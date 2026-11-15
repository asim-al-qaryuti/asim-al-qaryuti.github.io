/* السيرة الذاتية ثلاثية الأبعاد — تصميم بسيط
   - عجلة (نصف دائرة) يمر عليها خط بسيط، وعند كل محطة نقطة.
   - بجانب كل نقطة بطاقة صورة بإطار بسيط وفوقها السنة.
   - التمرير يدير العجلة: البطاقة الحالية تنقشر من زاويتها كاللاصقة وتصعد، والتالية تأتي من الأسفل.
   - النص في لوحة جانبية، والألوان تتبع الوضع الليلي/النهاري. */
import * as THREE from "three";

const W = 2.15, H = 2.0;            // card
const R = 5.2;                      // wheel radius
const STEP = 0.5;                   // radians between stations
const CARD_X = -(W / 2 + 0.42);
const DIAG = Math.hypot(W, H);

/* ---------- card shader: corner peel (sticker) + a light stretch while moving ---------- */
const VERT = /* glsl */`
uniform float uPeel, uR, uVel;
uniform vec2 uCorner, uDir;
varying vec2 vUv; varying float vCurl; varying float vLift;
const float PI = 3.14159265;
void main(){
  vUv = uv;
  vec3 p = position;
  float ny = p.y / ${(H / 2).toFixed(3)};
  p.z += -uVel * 0.12 * (ny*ny - 0.33);
  float s = dot(p.xy - uCorner, uDir);
  vCurl = 0.0; vLift = 0.0;
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
uniform sampler2D uMap; uniform float uAlpha, uDim; uniform vec3 uBack, uFade;
varying vec2 vUv; varying float vCurl; varying float vLift;
void main(){
  vec4 t = texture2D(uMap, vUv);
  if (t.a < 0.03) discard;
  vec3 col = gl_FrontFacing ? t.rgb * (1.0 - 0.25 * smoothstep(0.0, 0.5, vCurl) * (1.0 - smoothstep(0.5, 1.0, vCurl)))
                            : uBack * (0.8 + 0.2 * vLift);
  col = mix(col, uFade, uDim);
  gl_FragColor = vec4(col, t.a * uAlpha);
  #include <colorspace_fragment>
}`;
const LINE_FRAG = /* glsl */`
uniform vec3 uColor; uniform float uActive; varying float vA;
void main(){ float d = vA - uActive; float f = exp(-(d*d) / 1.6); gl_FragColor = vec4(uColor, 0.15 + 0.85 * f);
  #include <colorspace_fragment>
}`;

/* ---------- theme colours (from CSS variables) ---------- */
function themeColors() {
  const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
  const light = document.documentElement.getAttribute("data-theme") === "light";
  return { light, acc: v("--acc") || "#E3B341", bg: v("--bg") || "#070708", card: light ? "#E9E8E4" : "#1A1A1E", ink: v("--ink") || "#fff", mute: v("--mute") || "#888" };
}

/* ---------- canvas helpers ---------- */
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function paintCard(c, e, img, T) {
  const g = c.getContext("2d"), cw = c.width, ch = c.height, b = 10, rad = 28;
  g.clearRect(0, 0, cw, ch);
  g.save(); rr(g, b, b, cw - b * 2, ch - b * 2, rad); g.clip();
  if (img) {
    const s = Math.max(cw / img.width, ch / img.height), w = img.width * s, h = img.height * s;
    g.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  } else {
    g.fillStyle = T.card; g.fillRect(0, 0, cw, ch);
    // simple photo placeholder icon
    const cx = cw / 2, cy = ch * .42, s = 120;
    g.strokeStyle = T.mute; g.lineWidth = 7; g.lineJoin = "round"; g.globalAlpha = .55;
    rr(g, cx - s, cy - s * .78, s * 2, s * 1.56, 18); g.stroke();
    g.beginPath(); g.arc(cx + s * .42, cy - s * .3, s * .17, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx - s + 8, cy + s * .55); g.lineTo(cx - s * .25, cy - s * .1); g.lineTo(cx + s * .2, cy + s * .3); g.lineTo(cx + s * .5, cy + s * .05); g.lineTo(cx + s - 8, cy + s * .5); g.stroke();
    g.globalAlpha = 1;
    g.direction = "rtl"; g.textAlign = "center"; g.textBaseline = "middle";
    let fs = 50; g.font = `600 ${fs}px "Readex Pro"`;
    while (g.measureText(e.title || "").width > cw * .82 && fs > 30) { fs -= 3; g.font = `600 ${fs}px "Readex Pro"`; }
    g.fillStyle = T.ink; g.fillText(e.title || "", cx, ch * .78);
  }
  g.restore();
  rr(g, b, b, cw - b * 2, ch - b * 2, rad); g.lineWidth = 12; g.strokeStyle = T.acc; g.stroke();
}
function paintYear(c, text, T) {
  const g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height);
  g.direction = "rtl"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = '700 96px "Readex Pro"'; g.fillStyle = T.acc; g.fillText(text, c.width / 2, c.height / 2 + 6);
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
  try { await Promise.all([document.fonts.load('700 96px "Readex Pro"', "١٤٣٠ هـ"), document.fonts.load('600 50px "Readex Pro"', "المولد")]); } catch {}

  let T = themeColors();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  const rig = new THREE.Group(); scene.add(rig);
  const drum = new THREE.Group(); drum.position.set(0, 0, -R); rig.add(drum);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  /* the line along the wheel */
  class Arc extends THREE.Curve { getPoint(t, o = new THREE.Vector3()) { const a = -Math.PI + t * Math.PI * 2; return o.set(0, R * Math.sin(a), R * Math.cos(a)); } }
  const lineMat = new THREE.ShaderMaterial({
    vertexShader: `varying float vA; void main(){ vA = uv.x * 6.2831853 - 3.14159265; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: LINE_FRAG, transparent: true, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(T.acc) }, uActive: { value: 0 } }
  });
  drum.add(new THREE.Mesh(new THREE.TubeGeometry(new Arc(), 360, 0.02, 10, true), lineMat));

  /* stations */
  const geo = new THREE.PlaneGeometry(W, H, 48, 44);
  const dirUp = new THREE.Vector2(W, H).normalize();
  const ringGeo = new THREE.TorusGeometry(0.13, 0.022, 10, 48), diskGeo = new THREE.CircleGeometry(0.2, 48), dotGeo = new THREE.CircleGeometry(0.065, 32);
  const backCol = () => T.light ? "#D8D5CC" : "#C9C4B8";
  const stations = entries.map((e, i) => {
    const psi = -i * STEP, st = new THREE.Group();
    st.position.set(0, R * Math.sin(psi), R * Math.cos(psi)); st.rotation.x = -psi;
    drum.add(st);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: T.mute, transparent: true }));
    const disk = new THREE.Mesh(diskGeo, new THREE.MeshBasicMaterial({ color: T.acc, transparent: true }));
    const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true }));
    ring.position.z = .01; disk.position.z = .012; dot.position.z = .014;
    st.add(ring, disk, dot);

    const cnv = document.createElement("canvas"); cnv.width = 860; cnv.height = 800;
    const tex = new THREE.CanvasTexture(cnv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
    let img = null;
    const repaint = () => { paintCard(cnv, e, img, T); tex.needsUpdate = true; };
    repaint();
    if (e.img) { const im = new Image(); im.onload = () => { img = im; repaint(); }; im.src = e.img; }
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide,
      uniforms: { uMap: { value: tex }, uPeel: { value: 0 }, uR: { value: 0.15 }, uCorner: { value: new THREE.Vector2(-W / 2, -H / 2) }, uDir: { value: dirUp.clone() }, uVel: { value: 0 }, uAlpha: { value: 1 }, uDim: { value: 0 }, uBack: { value: new THREE.Color(backCol()) }, uFade: { value: new THREE.Color(T.bg) } }
    });
    const card = new THREE.Mesh(geo, mat);
    card.position.set(CARD_X, 0.22, 0.02);
    st.add(card);
    const yc = document.createElement("canvas"); yc.width = 640; yc.height = 160;
    const ytex = new THREE.CanvasTexture(yc); ytex.colorSpace = THREE.SRGBColorSpace;
    const repaintYear = () => { paintYear(yc, e.year || "", T); ytex.needsUpdate = true; };
    repaintYear();
    const yr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), new THREE.MeshBasicMaterial({ map: ytex, transparent: true, depthWrite: false }));
    yr.position.set(CARD_X, 0.22 + H / 2 + 0.26, 0.02);
    st.add(yr);
    return { card, mat, ring, disk, dot, yr, repaint, repaintYear };
  });

  /* react to day/night switch */
  const onTheme = () => {
    T = themeColors();
    lineMat.uniforms.uColor.value.set(T.acc);
    stations.forEach(s => {
      s.ring.material.color.set(T.mute); s.disk.material.color.set(T.acc);
      s.mat.uniforms.uFade.value.set(T.bg); s.mat.uniforms.uBack.value.set(backCol());
      s.repaint(); s.repaintYear();
    });
  };
  document.addEventListener("themechange", onTheme);

  /* layout */
  let narrow = false;
  const resize = () => {
    const vw = pin.clientWidth, vh = pin.clientHeight;
    narrow = vw < 760;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const span = W + 0.9;
    const dH = (H * (narrow ? 3.3 : 3.05) / 2) / t;
    const dW = (span / (narrow ? .84 : .46) / 2) / (t * camera.aspect);
    camera.position.set(0, narrow ? -0.6 : 0.1, Math.max(dH, dW));
    camera.lookAt(0, narrow ? -0.15 : 0.32, 0);
    camera.updateProjectionMatrix();
    const hw = t * camera.position.z * camera.aspect;
    rig.position.x = narrow ? 1.22 : (W / 2 + 0.42) / 2 - 0.32 * hw;
    rig.rotation.y = narrow ? 0.04 : 0.24;
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
    idle = false; clearTimeout(idleT); idleT = setTimeout(() => idle = true, 220);
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
    }, reduced ? 0 : 110);
  };

  /* animate — quick, near-critically-damped follow so scrolling feels light */
  let x = raw, v = 0, vel = 0, last = performance.now(), raf = 0, running = false, active = -1;
  const K = 150, C = 2 * Math.sqrt(K) * 0.92;
  const smooth = t => t * t * (3 - 2 * t), clamp01 = t => Math.min(1, Math.max(0, t));
  const frame = now => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    const target = idle ? Math.round(raw) : raw, prev = x;
    if (reduced) x = target;
    else { const a = K * (target - x) - C * v; v += a * dt; x += v * dt; }
    const instV = (x - prev) / Math.max(dt, 1e-4);
    vel += ((reduced ? 0 : Math.max(-1, Math.min(1, instV * 0.25))) - vel) * Math.min(1, dt * 10);

    drum.rotation.x = -x * STEP;
    lineMat.uniforms.uActive.value = -x * STEP;

    stations.forEach((s, i) => {
      const u = s.mat.uniforms, off = x - i, ao = Math.abs(off), near = Math.max(0, 1 - ao);
      const vis = ao < 3.4;
      s.card.visible = s.yr.visible = s.ring.visible = s.disk.visible = s.dot.visible = vis;
      if (!vis) return;
      if (off >= 0) {
        u.uCorner.value.set(-W / 2, -H / 2); u.uDir.value.copy(dirUp);
        u.uPeel.value = smooth(clamp01(off * 1.1)) * DIAG * 0.42;
      } else {
        u.uCorner.value.set(W / 2, H / 2); u.uDir.value.copy(dirUp).negate();
        u.uPeel.value = smooth(clamp01(-off * 1.1)) * DIAG * 0.24;
      }
      u.uVel.value = vel * near;
      const alpha = 1 - smooth(clamp01((ao - 1.8) / 1.3));
      u.uAlpha.value = alpha; u.uDim.value = Math.min(ao * 0.45, 0.75);
      s.yr.material.opacity = alpha * (0.3 + 0.7 * near);
      s.card.renderOrder = 10 - Math.round(ao);
      s.disk.scale.setScalar(Math.max(0.001, near)); s.dot.scale.setScalar(Math.max(0.001, near));
      s.disk.material.opacity = s.dot.material.opacity = alpha;
      s.ring.material.opacity = alpha * (1 - near * 0.9);
    });

    const a = Math.max(0, Math.min(N - 1, Math.round(x)));
    if (a !== active) {
      if (active !== -1) showPanel(a);
      active = a;
      rail.forEach((b, i) => b.setAttribute("aria-current", i === a));
      if (nEl) nEl.textContent = String(a + 1).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
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
      document.removeEventListener("themechange", onTheme);
      removeEventListener("scroll", readScroll); root.removeEventListener("click", onRail);
      scene.traverse(o => { o.geometry?.dispose?.(); const m = o.material; if (m) { m.map?.dispose?.(); m.uniforms?.uMap?.value?.dispose?.(); m.dispose?.(); } });
      renderer.dispose();
    }
  };
}
