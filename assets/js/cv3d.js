/* السيرة الذاتية ثلاثية الأبعاد
   - عجلة (نصف دائرة) يمرّ عليها خط مضيء، وعلى الخط حلقة مضيئة لكل محطة.
   - بجانب كل حلقة بطاقة صورة بإطار مضيء وفوقها السنة.
   - التمرير يدير العجلة: البطاقة الحالية تنقشر من زاويتها كاللاصقة وتصعد، والتالية تأتي من الأسفل وتلتصق.
   - النص يظهر في لوحة جانبية (HTML) ليكون واضحًا وقابلًا للنسخ. */
import * as THREE from "three";

const ACC = "#F5CD6A", ACC_DEEP = "#E3B341";
const W = 2.15, H = 2.0;            // card
const R = 5.2;                      // wheel radius
const STEP = 0.5;                   // radians between stations
const CARD_X = -(W / 2 + 0.42);     // card sits beside the beam
const DIAG = Math.hypot(W, H);
const AR = "٠١٢٣٤٥٦٧٨٩";
const arN = n => String(n).replace(/\d/g, d => AR[d]);

/* ---------- card shader: sticky drag + corner peel ---------- */
const VERT = /* glsl */`
uniform float uPeel, uR, uVel, uTime, uSeed;
uniform vec2 uCorner, uDir;
varying vec2 vUv; varying float vCurl; varying float vLift; varying float vShadow;
const float PI = 3.14159265;
void main(){
  vUv = uv;
  vec3 p = position;
  vec2 n = vec2(p.x / ${(W / 2).toFixed(3)}, p.y / ${(H / 2).toFixed(3)});
  float v = uVel;
  p.z += -v * 0.24 * (1.0 - n.x*n.x*0.4) * (n.y*n.y - 0.33);
  p.y += -v * 0.07 * (1.0 - n.y*n.y);
  p.x *= 1.0 - min(abs(v),1.2) * 0.04 * (1.0 - n.y*n.y);
  p.z += sin(n.x*2.4 + n.y*1.3 + uTime*3.0 + uSeed) * 0.016 * min(abs(v),1.0);
  float s = dot(p.xy - uCorner, uDir);
  vCurl = 0.0; vLift = 0.0;
  vShadow = uPeel > 0.0 ? (1.0 - smoothstep(uPeel, uPeel + 0.5, s)) * step(uPeel, s) * min(uPeel*3.0, 1.0) : 0.0;
  if (uPeel > 0.0 && s < uPeel) {
    float d = uPeel - s, a = d / uR, ns, z;
    if (a < PI) { ns = uPeel - uR * sin(a); z = uR * (1.0 - cos(a)); }
    else { ns = uPeel + (d - PI * uR); z = 2.0 * uR; }
    p.xy += uDir * (ns - s);
    p.z += z;
    vCurl = clamp(a / PI, 0.0, 1.0);
    vLift = z / (2.0 * uR);
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const FRAG = /* glsl */`
uniform sampler2D uMap; uniform float uDim, uAlpha;
varying vec2 vUv; varying float vCurl; varying float vLift; varying float vShadow;
void main(){
  vec4 t = texture2D(uMap, vUv);
  if (t.a < 0.03) discard;
  vec3 col;
  if (gl_FrontFacing) {
    col = t.rgb;
    float fold = smoothstep(0.0, 0.5, vCurl) * (1.0 - smoothstep(0.5, 1.0, vCurl));
    col *= 1.0 - 0.45 * fold;
    col *= 1.0 - 0.5 * vShadow;
  } else {
    float stripe = 0.5 + 0.5 * sin((vUv.x * 1.6 + vUv.y) * 90.0);
    col = mix(vec3(0.82, 0.77, 0.66), vec3(0.70, 0.64, 0.52), stripe * 0.3);
    col *= 0.6 + 0.4 * vLift;
  }
  col *= 1.0 - uDim;
  gl_FragColor = vec4(col, t.a * uAlpha);
  #include <colorspace_fragment>
}`;

/* ---------- glow shader for beam/rings: fades away from the active station ---------- */
const GLOW_VERT = /* glsl */`
varying float vA; uniform float uFull;
void main(){ vA = uFull > 0.5 ? uv.x * 6.2831853 - 3.14159265 : 0.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const GLOW_FRAG = /* glsl */`
uniform vec3 uColor; uniform float uOpacity, uActive, uSpread;
varying float vA;
void main(){
  float d = vA - uActive;
  float f = uSpread > 0.0 ? exp(-(d*d) / (2.0*uSpread*uSpread)) : 1.0;
  gl_FragColor = vec4(uColor * (0.25 + 0.75*f), uOpacity * (0.12 + 0.88*f));
  #include <colorspace_fragment>
}`;
const glowMat = (color, opacity, spread = 1.0, full = 1) => new THREE.ShaderMaterial({
  vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uActive: { value: 0 }, uSpread: { value: spread }, uFull: { value: full } }
});

/* ---------- canvas helpers ---------- */
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function star8(g, cx, cy, r, stroke, lw = 3) {
  for (let k = 0; k < 2; k++) { g.save(); g.translate(cx, cy); g.rotate(k * Math.PI / 4); g.strokeStyle = stroke; g.lineWidth = lw; g.strokeRect(-r * .7, -r * .7, r * 1.4, r * 1.4); g.restore(); }
}
function paintCard(c, e, i, n, img) {
  const g = c.getContext("2d"), cw = c.width, ch = c.height, pad = 22, rad = 46;
  g.clearRect(0, 0, cw, ch);
  // glow behind frame
  g.save(); g.shadowColor = "rgba(245,205,106,.55)"; g.shadowBlur = 30;
  rr(g, pad, pad, cw - pad * 2, ch - pad * 2, rad); g.fillStyle = "#0b0b0d"; g.fill(); g.restore();
  g.save(); rr(g, pad, pad, cw - pad * 2, ch - pad * 2, rad); g.clip();
  if (img) {
    const s = Math.max((cw - pad * 2) / img.width, (ch - pad * 2) / img.height);
    const w = img.width * s, h = img.height * s;
    g.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    const v = g.createLinearGradient(0, ch * .55, 0, ch); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.35)");
    g.fillStyle = v; g.fillRect(0, 0, cw, ch);
  } else {
    const bg = g.createLinearGradient(cw, 0, 0, ch); bg.addColorStop(0, "#1D1A12"); bg.addColorStop(.6, "#121110"); bg.addColorStop(1, "#0A0A0B");
    g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
    const sh = g.createRadialGradient(cw * .5, ch * .42, 10, cw * .5, ch * .42, cw * .6);
    sh.addColorStop(0, "rgba(245,205,106,.22)"); sh.addColorStop(1, "rgba(245,205,106,0)");
    g.fillStyle = sh; g.fillRect(0, 0, cw, ch);
    star8(g, cw / 2, ch * .42, cw * .26, "rgba(245,205,106,.35)", 3);
    star8(g, cw / 2, ch * .42, cw * .17, "rgba(245,205,106,.18)", 2);
    g.textAlign = "center"; g.textBaseline = "middle"; g.direction = "rtl";
    g.font = '700 150px "Readex Pro"'; g.fillStyle = "rgba(245,205,106,.92)";
    g.fillText(arN(i + 1), cw / 2, ch * .43);
    g.font = '500 52px "Readex Pro"'; g.fillStyle = "#F4F4F5";
    let t = e.title || "", fs = 52; while (g.measureText(t).width > cw * .8 && fs > 30) { fs -= 3; g.font = `500 ${fs}px "Readex Pro"`; }
    g.fillText(t, cw / 2, ch * .78);
    g.font = '400 30px "Readex Pro"'; g.fillStyle = "rgba(200,200,210,.55)";
    g.fillText(`${arN(i + 1)} من ${arN(n)}`, cw / 2, ch * .87);
  }
  g.restore();
  rr(g, pad, pad, cw - pad * 2, ch - pad * 2, rad); g.lineWidth = 9; g.strokeStyle = ACC_DEEP; g.stroke();
  rr(g, pad + 14, pad + 14, cw - pad * 2 - 28, ch - pad * 2 - 28, rad - 12); g.lineWidth = 2; g.strokeStyle = "rgba(255,240,200,.25)"; g.stroke();
}
function yearTexture(text) {
  const c = document.createElement("canvas"); c.width = 640; c.height = 180;
  const g = c.getContext("2d"); g.direction = "rtl"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = '700 104px "Readex Pro"';
  g.shadowColor = "rgba(245,205,106,.7)"; g.shadowBlur = 26; g.fillStyle = ACC;
  g.fillText(text, 320, 96);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- main ---------- */
export async function mountCV(root, entries, { reduced = false } = {}) {
  const pin = root.querySelector(".cv-pin"), canvas = pin.querySelector("canvas");
  const N = entries.length;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  try {
    await Promise.all([document.fonts.load('700 100px "Readex Pro"', "١٤٣٠ هـ"), document.fonts.load('500 50px "Readex Pro"', "المولد"), document.fonts.load('400 30px "Readex Pro"', "من")]);
  } catch {}

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  const rig = new THREE.Group(); scene.add(rig);
  const drum = new THREE.Group(); drum.position.set(0, 0, -R); rig.add(drum);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  /* the glowing beam along the wheel */
  class Arc extends THREE.Curve { getPoint(t, o = new THREE.Vector3()) { const a = -Math.PI + t * Math.PI * 2; return o.set(0, R * Math.sin(a), R * Math.cos(a)); } }
  const arc = new Arc();
  const beamMats = [glowMat("#FFF6D8", 1.0, 0.95), glowMat(ACC_DEEP, 0.5, 0.9), glowMat(ACC_DEEP, 0.11, 0.8), glowMat(ACC_DEEP, 0.03, 0.7)];
  [0.014, 0.04, 0.11, 0.26].forEach((r, k) => drum.add(new THREE.Mesh(new THREE.TubeGeometry(arc, 360, r, 12, true), beamMats[k])));
  // faint light fan beneath the beam
  const fanGeo = new THREE.BufferGeometry(), fanPos = [], fanUv = [], fanIdx = [], SEG = 240;
  for (let k = 0; k <= SEG; k++) {
    const t = k / SEG, a = -Math.PI + t * Math.PI * 2, y = R * Math.sin(a), z = R * Math.cos(a);
    fanPos.push(-1.6, y, z, 1.6, y, z); fanUv.push(t, 0, t, 1);
    if (k < SEG) { const b = k * 2; fanIdx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
  }
  fanGeo.setAttribute("position", new THREE.Float32BufferAttribute(fanPos, 3));
  fanGeo.setAttribute("uv", new THREE.Float32BufferAttribute(fanUv, 2)); fanGeo.setIndex(fanIdx);
  const fanMat = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform vec3 uColor; uniform float uActive; varying vec2 vUv;
      void main(){ float a=vUv.x*6.2831853-3.14159265; float d=a-uActive; float f=exp(-(d*d)/(2.0*0.6*0.6));
        float x=abs(vUv.y-0.5)*2.0; float w=pow(1.0-x,3.0); gl_FragColor=vec4(uColor, 0.07*f*w);
        #include <colorspace_fragment>
      }`,
    uniforms: { uColor: { value: new THREE.Color(ACC_DEEP) }, uActive: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  });
  drum.add(new THREE.Mesh(fanGeo, fanMat));

  /* stations: ring + dot + card + year */
  const geo = new THREE.PlaneGeometry(W, H, 64, 60);
  const dirUp = new THREE.Vector2(W, H).normalize();
  const ringGeo = new THREE.TorusGeometry(0.2, 0.016, 12, 64), ringGlowGeo = new THREE.TorusGeometry(0.2, 0.06, 12, 64);
  const dotGeo = new THREE.CircleGeometry(0.055, 32), haloGeo = new THREE.CircleGeometry(0.2, 40);
  const stations = entries.map((e, i) => {
    const psi = -i * STEP;
    const st = new THREE.Group();
    st.position.set(0, R * Math.sin(psi), R * Math.cos(psi)); st.rotation.x = -psi;
    drum.add(st);
    const ringMat = new THREE.MeshBasicMaterial({ color: "#FFF1C9", transparent: true });
    const ringGlowMat = new THREE.MeshBasicMaterial({ color: ACC_DEEP, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, ringMat), ringGlow = new THREE.Mesh(ringGlowGeo, ringGlowMat);
    const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true }));
    const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: ACC_DEEP, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false }));
    const pulse = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: ACC, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    [halo, ringGlow, ring, dot, pulse].forEach((m, k) => { m.position.z = 0.01 + k * 0.002; st.add(m); });

    const cnv = document.createElement("canvas"); cnv.width = 860; cnv.height = 800;
    paintCard(cnv, e, i, N, null);
    const tex = new THREE.CanvasTexture(cnv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
    if (e.img) { const im = new Image(); im.onload = () => { paintCard(cnv, e, i, N, im); tex.needsUpdate = true; }; im.src = e.img; }
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide,
      uniforms: { uMap: { value: tex }, uPeel: { value: 0 }, uR: { value: 0.16 }, uCorner: { value: new THREE.Vector2(-W / 2, -H / 2) }, uDir: { value: dirUp.clone() }, uVel: { value: 0 }, uTime: { value: 0 }, uSeed: { value: i * 1.73 }, uDim: { value: 0 }, uAlpha: { value: 1 } }
    });
    const card = new THREE.Mesh(geo, mat);
    card.position.set(CARD_X, 0.22, 0.02);
    st.add(card);
    const yr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42), new THREE.MeshBasicMaterial({ map: yearTexture(e.year || ""), transparent: true, depthWrite: false }));
    yr.position.set(CARD_X, 0.22 + H / 2 + 0.27, 0.02);
    st.add(yr);
    return { st, card, mat, ring, ringGlow, dot, halo, pulse, yr };
  });

  /* starfield */
  const mkPts = (count, spread, color, size, opacity) => {
    const pos = new Float32Array(count * 3);
    for (let k = 0; k < count; k++) { pos[k * 3] = (Math.random() - .5) * spread[0]; pos[k * 3 + 1] = (Math.random() - .5) * spread[1]; pos[k * 3 + 2] = -Math.random() * spread[2] - 3; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false }));
    scene.add(p); return p;
  };
  const stars = mkPts(650, [44, 28, 22], "#B9BCC6", 0.03, .6);
  const dust = mkPts(120, [16, 12, 8], ACC, 0.05, .45);

  /* layout */
  let narrow = false;
  const resize = () => {
    const vw = pin.clientWidth, vh = pin.clientHeight;
    narrow = vw < 760;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const span = W + 0.9;                                   // card + beam/ring
    const dH = (H * (narrow ? 3.3 : 3.05) / 2) / t;
    const dW = (span / (narrow ? .84 : .46) / 2) / (t * camera.aspect);
    camera.position.set(0, narrow ? -0.6 : 0.1, Math.max(dH, dW));
    camera.lookAt(0, narrow ? -0.15 : 0.32, 0);
    camera.updateProjectionMatrix();
    const hw = t * camera.position.z * camera.aspect;
    rig.position.x = narrow ? 1.22 : (W / 2 + 0.42) / 2 - 0.32 * hw;
  };
  const ro = new ResizeObserver(resize); ro.observe(pin); resize();

  /* scroll → target */
  const rail = [...root.querySelectorAll(".cv-rail [data-go]")];
  const nEl = root.querySelector("#cv-n"), bar = root.querySelector("#cv-bar");
  const panel = root.querySelector(".cv-panel");
  let raw = 0, idle = true, idleT = 0;
  const readScroll = () => {
    const r = root.getBoundingClientRect(), total = root.offsetHeight - innerHeight;
    raw = (total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0) * (N - 1);
    idle = false; clearTimeout(idleT); idleT = setTimeout(() => idle = true, 160);
  };
  addEventListener("scroll", readScroll, { passive: true }); readScroll(); idle = true;
  const goTo = j => {
    const total = root.offsetHeight - innerHeight;
    scrollTo({ top: root.getBoundingClientRect().top + scrollY + (N > 1 ? j / (N - 1) : 0) * total, behavior: reduced ? "auto" : "smooth" });
  };
  const onRail = e => { const b = e.target.closest("[data-go]"); if (b) goTo(+b.dataset.go); };
  root.addEventListener("click", onRail);
  let swapT = 0;
  const showPanel = i => {
    if (!panel) return;
    const e = entries[i];
    panel.classList.add("swap"); clearTimeout(swapT);
    swapT = setTimeout(() => {
      panel.querySelector(".y").textContent = e.year || "";
      panel.querySelector("h3").textContent = e.title || "";
      const pl = panel.querySelector(".pl"); pl.hidden = !e.place; pl.querySelector("span").textContent = e.place || "";
      panel.querySelector("p").textContent = e.text || "";
      panel.classList.remove("swap");
    }, reduced ? 0 : 180);
  };

  /* pointer tilt */
  let px = 0, py = 0, tx = 0, ty = 0;
  const onMove = e => { const r = pin.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; };
  pin.addEventListener("pointermove", onMove, { passive: true });

  /* animate */
  let x = raw, v = 0, vel = 0, last = performance.now(), raf = 0, running = false, active = -1, time = 0;
  const K = 75, C = 11.5;
  const smooth = t => t * t * (3 - 2 * t), clamp01 = t => Math.min(1, Math.max(0, t));
  const frame = now => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now; time += dt;
    const target = idle ? Math.round(raw) : raw, prev = x;
    if (reduced) x += (target - x) * Math.min(1, dt * 12);
    else { const a = K * (target - x) - C * v; v += a * dt; x += v * dt; }
    const instV = (x - prev) / Math.max(dt, 1e-4);
    vel += ((reduced ? 0 : Math.max(-1.3, Math.min(1.3, instV * 0.42))) - vel) * Math.min(1, dt * 10);

    drum.rotation.x = -x * STEP;
    const activeAngle = -x * STEP;
    beamMats.forEach(m => m.uniforms.uActive.value = activeAngle);
    fanMat.uniforms.uActive.value = activeAngle;

    px += (tx - px) * Math.min(1, dt * 4); py += (ty - py) * Math.min(1, dt * 4);
    rig.rotation.y = (narrow ? 0.04 : 0.24) + px * 0.14;
    rig.rotation.z = narrow ? 0 : -0.08;
    rig.rotation.x = py * 0.06;

    stations.forEach((s, i) => {
      const u = s.mat.uniforms, off = x - i, ao = Math.abs(off), near = Math.max(0, 1 - ao);
      s.st.visible = ao < 3.6;
      if (!s.st.visible) return;
      if (off >= 0) {
        u.uCorner.value.set(-W / 2, -H / 2); u.uDir.value.copy(dirUp);
        u.uPeel.value = smooth(clamp01(off * 1.1)) * DIAG * 0.46 + (ao < .6 ? Math.abs(vel) * 0.18 : 0);
      } else {
        u.uCorner.value.set(W / 2, H / 2); u.uDir.value.copy(dirUp).negate();
        u.uPeel.value = smooth(clamp01(-off * 1.1)) * DIAG * 0.28 + (ao < .6 ? Math.abs(vel) * 0.12 : 0);
      }
      u.uVel.value = vel * (1 - Math.min(ao, 1) * .5);
      u.uTime.value = time;
      u.uDim.value = Math.min(ao * 0.38, 0.7);
      const alpha = 1 - smooth(clamp01((ao - 1.8) / 1.3));
      u.uAlpha.value = alpha;
      s.yr.material.opacity = alpha * (0.35 + 0.65 * near);
      s.card.renderOrder = 10 - Math.round(ao);
      const sc = 0.75 + near * 0.75;
      s.ring.scale.setScalar(sc); s.ringGlow.scale.setScalar(sc); s.dot.scale.setScalar(0.8 + near * 0.6); s.halo.scale.setScalar(sc * (1 + near * .6));
      s.ring.material.opacity = (0.45 + near * 0.55) * alpha; s.ringGlow.material.opacity = (0.15 + near * 0.4) * alpha;
      s.dot.material.opacity = alpha; s.halo.material.opacity = (0.06 + near * 0.22) * alpha;
      const ph = (time * 0.9 + i * 0.13) % 1;
      s.pulse.scale.setScalar(sc * (1 + ph * 1.6)); s.pulse.material.opacity = near * (1 - ph) * 0.5 * alpha;
    });

    const dp = dust.geometry.attributes.position;
    for (let k = 0; k < dp.count; k++) { let yy = dp.getY(k) + dt * (0.12 + (k % 7) * 0.025); if (yy > 6) yy = -6; dp.setY(k, yy); }
    dp.needsUpdate = true;
    stars.rotation.z = time * 0.004; stars.position.y = x * 0.25;

    const a = Math.max(0, Math.min(N - 1, Math.round(x)));
    if (a !== active) {
      if (active !== -1) showPanel(a);
      active = a;
      rail.forEach((b, i) => b.setAttribute("aria-current", i === a));
      if (nEl) nEl.textContent = arN(a + 1);
    }
    if (bar) bar.style.width = (N > 1 ? x / (N - 1) * 100 : 100).toFixed(2) + "%";
    renderer.render(scene, camera);
  };
  const start = () => { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const io = new IntersectionObserver(es => es[0].isIntersecting ? start() : stop());
  io.observe(root);
  if (Math.round(raw) !== 0) showPanel(Math.round(raw));

  return {
    destroy() {
      stop(); io.disconnect(); ro.disconnect(); clearTimeout(idleT); clearTimeout(swapT);
      removeEventListener("scroll", readScroll); root.removeEventListener("click", onRail); pin.removeEventListener("pointermove", onMove);
      scene.traverse(o => { o.geometry?.dispose?.(); const m = o.material; if (m) { m.map?.dispose?.(); m.uniforms?.uMap?.value?.dispose?.(); m.dispose?.(); } });
      renderer.dispose();
    }
  };
}
