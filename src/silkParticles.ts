import * as THREE from 'three';

const PARTICLE_COUNT = 800;
const GOLD = new THREE.Color(0xc9a84c);
const GOLD_LIGHT = new THREE.Color(0xe8d48b);
const GOLD_DARK = new THREE.Color(0x9a7a2e);

export function initSilkParticles(): () => void {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.id = 'silk-particles-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '9999',
    pointerEvents: 'none',
  } as CSSStyleDeclaration);
  document.body.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const phases = new Float32Array(PARTICLE_COUNT);

  const palette = [GOLD, GOLD_LIGHT, GOLD_DARK];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    positions[i3] = (Math.random() - 0.5) * 14;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 6;

    velocities[i3] = (Math.random() - 0.5) * 0.002;
    velocities[i3 + 1] = 0.003 + Math.random() * 0.006;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.001;

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;

    sizes[i] = 2.0 + Math.random() * 4.0;
    phases[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.6 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        float depth = -mvPosition.z;
        vAlpha = smoothstep(8.0, 1.0, depth);

        gl_PointSize = size * uPixelRatio * (3.0 / depth);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uOpacity;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha *= alpha;
        alpha *= vAlpha * uOpacity;

        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let scrollY = window.scrollY;
  let scrollSpeed = 0;
  let prevScrollY = window.scrollY;

  const onScroll = () => {
    scrollY = window.scrollY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  const onMouseMove = (e: MouseEvent) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  };
  window.addEventListener('resize', onResize);

  // Pause the animation entirely when the tab is hidden to save battery/CPU
  const onVisibility = () => {
    running = !document.hidden;
    if (running) {
      lastFrame = 0;
      animationId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationId);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  let animationId: number;
  let running = true;
  let lastFrame = 0;
  const FRAME_INTERVAL = 1000 / 30; // cap at 30fps to cut CPU/GPU cost
  const startTime = performance.now();

  const animate = (now: number) => {
    animationId = requestAnimationFrame(animate);

    // Skip work on off-screen frames to keep a low, steady CPU footprint
    if (now - lastFrame < FRAME_INTERVAL) return;
    lastFrame = now;

    const elapsed = (performance.now() - startTime) * 0.001;

    scrollSpeed = (scrollY - prevScrollY) * 0.1;
    scrollSpeed = Math.max(-2, Math.min(2, scrollSpeed));
    prevScrollY += (scrollY - prevScrollY) * 0.1;

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    material.uniforms.uTime.value = elapsed;

    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const phase = phases[i];

      const sineOffsetX = Math.sin(elapsed * 0.3 + phase) * 0.003;
      const sineOffsetY = Math.cos(elapsed * 0.2 + phase * 1.3) * 0.002;

      let vx = velocities[i3] + sineOffsetX;
      let vy = velocities[i3 + 1] + sineOffsetY;
      let vz = velocities[i3 + 2];

      vy += scrollSpeed * 0.015;
      vx += scrollSpeed * 0.004 * Math.sin(phase);

      const depth01 = (posArray[i3 + 2] + 3) / 6;
      vx += mouseX * 0.002 * depth01;
      vy += mouseY * 0.001 * depth01;

      posArray[i3] += vx;
      posArray[i3 + 1] += vy;
      posArray[i3 + 2] += vz;

      if (posArray[i3 + 1] > 5.5) {
        posArray[i3 + 1] = -5.5;
        posArray[i3] = (Math.random() - 0.5) * 14;
        posArray[i3 + 2] = (Math.random() - 0.5) * 6;
      }
      if (posArray[i3 + 1] < -5.5) {
        posArray[i3 + 1] = 5.5;
      }
      if (posArray[i3] > 7.5) posArray[i3] = -7.5;
      if (posArray[i3] < -7.5) posArray[i3] = 7.5;
    }

    posAttr.needsUpdate = true;

    camera.position.x += (mouseX * 0.15 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 0.08 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };

  requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationId);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
