(function() {
  'use strict';

  const billboardContent = [
    { id: 'billboard-1', title: 'Universal Design', text: 'Design for everyone, not just the average user. When we build for diversity, everyone benefits.', position: { x: -15, y: 8, z: -30 } },
    { id: 'billboard-2', title: 'Perceivable', text: 'Information must be presentable in ways all users can perceive. Use alt text, captions, and sufficient contrast.', position: { x: 20, y: 10, z: -80 } },
    { id: 'billboard-3', title: 'Operable', text: 'All functionality must be available via keyboard. No mouse required. Everyone can navigate.', position: { x: -25, y: 12, z: -150 } },
    { id: 'billboard-4', title: 'Understandable', text: 'Content should be readable and predictable. Clear language, consistent navigation, helpful error messages.', position: { x: 18, y: 9, z: -220 } },
    { id: 'billboard-5', title: 'Robust', text: 'Build with semantic HTML. Works with assistive technologies today and tomorrow.', position: { x: -20, y: 11, z: -300 } },
    { id: 'billboard-6', title: '1 Billion+', text: 'People worldwide live with disabilities. That\'s 15% of the global population you might be excluding.', position: { x: 22, y: 8, z: -380 } },
    { id: 'billboard-7', title: 'Color Contrast', text: '4.5:1 minimum for normal text. 3:1 for large text. Test your designs!', position: { x: -18, y: 13, z: -460 } },
    { id: 'billboard-8', title: 'Keyboard First', text: 'If it works with a keyboard, it works for everyone. Tab, Enter, Space, Arrows.', position: { x: 15, y: 10, z: -540 } }
  ];

  let scene, camera, renderer;
  let buildings = [];
  let billboardMeshes = [];
  let scrollSpeed = 0;
  let baseSpeed = 0.5;
  let cameraZ = 0;
  let targetCameraZ = 0;
  let isPaused = false;
  let animationId;
  const cityLength = 600;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    const container = document.getElementById('three-canvas');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 50, 300);

    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 5, -100);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    createLights();
    createGround();
    createCity();
    createBillboards();

    setupEventListeners();
    animate();
  }

  function createLights() {
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    moonLight.position.set(50, 100, 50);
    scene.add(moonLight);

    for (let z = -50; z > -cityLength; z -= 60) {
      const leftLight = new THREE.PointLight(0xffaa44, 0.6, 50);
      leftLight.position.set(-12, 8, z);
      scene.add(leftLight);

      const rightLight = new THREE.PointLight(0x44aaff, 0.6, 50);
      rightLight.position.set(12, 8, z + 30);
      scene.add(rightLight);
    }
  }

  function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, cityLength + 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -cityLength / 2;
    scene.add(ground);

    const roadGeometry = new THREE.PlaneGeometry(16, cityLength + 200);
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      roughness: 0.8
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    road.position.z = -cityLength / 2;
    scene.add(road);

    for (let z = 0; z > -cityLength - 100; z -= 10) {
      const lineGeometry = new THREE.PlaneGeometry(0.3, 5);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff88 });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.y = 0.02;
      line.position.z = z;
      scene.add(line);
    }
  }

  function createCity() {
    const buildingColors = [0x2a4858, 0x3d5a6c, 0x1e3a4c, 0x4a6572, 0x2c3e50];

    for (let z = -20; z > -cityLength; z -= 15) {
      for (let side = -1; side <= 1; side += 2) {
        if (Math.random() > 0.3) {
          const width = 8 + Math.random() * 8;
          const height = 15 + Math.random() * 35;
          const depth = 8 + Math.random() * 8;

          const geometry = new THREE.BoxGeometry(width, height, depth);
          const material = new THREE.MeshStandardMaterial({
            color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
            roughness: 0.7,
            metalness: 0.1
          });

          const building = new THREE.Mesh(geometry, material);
          building.position.set(
            side * (35 + Math.random() * 15),
            height / 2,
            z + Math.random() * 10
          );

          scene.add(building);
          buildings.push(building);

          addWindows(building, width, height, depth, side);
        }
      }
    }
  }

  function addWindows(building, width, height, depth, side) {
    const windowGeometry = new THREE.PlaneGeometry(1, 1.5);

    const rows = Math.floor(height / 4);
    const cols = Math.floor(width / 3);

    for (let row = 1; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.2) {
          const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffeeaa,
            transparent: true,
            opacity: Math.random() > 0.4 ? 0.8 : 0.1
          });

          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

          windowMesh.position.set(
            building.position.x - side * (width / 2 + 0.1),
            row * 4 - height / 2 + building.position.y,
            building.position.z - width / 2 + 2 + col * 3
          );
          windowMesh.rotation.y = side * Math.PI / 2;

          scene.add(windowMesh);
        }
      }
    }
  }

  function createTextTexture(title, text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 512;
    canvas.height = 320;

    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#3182ce';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a365d');
    gradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = gradient;
    ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = '#90cdf4';
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, canvas.width / 2, 30);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const maxWidth = canvas.width - 60;

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine.trim());

    const lineHeight = 32;
    const startY = 100;
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }

  function createBillboards() {
    billboardContent.forEach((data, index) => {
      const group = new THREE.Group();
      group.position.set(data.position.x, data.position.y, data.position.z);

      const isLeftSide = data.position.x < 0;
      if (isLeftSide) {
        group.rotation.y = Math.PI / 6;
      } else {
        group.rotation.y = -Math.PI / 6;
      }

      const texture = createTextTexture(data.title, data.text);

      const screenGeometry = new THREE.PlaneGeometry(10, 6.25);
      const screenMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.z = 0.26;
      group.add(screen);

      const frameGeometry = new THREE.BoxGeometry(10.5, 6.75, 0.5);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a365d,
        metalness: 0.8,
        roughness: 0.2
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      group.add(frame);

      const poleHeight = data.position.y - 3;
      const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, poleHeight);
      const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.3
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = -poleHeight / 2 - 3.375;
      group.add(pole);

      const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.5);
      const base = new THREE.Mesh(baseGeometry, poleMaterial);
      base.position.y = -poleHeight - 3.375 - 0.25;
      group.add(base);

      const light = new THREE.SpotLight(0x3182ce, 1, 25, Math.PI / 4, 0.5);
      light.position.set(0, 5, 5);
      light.target = screen;
      group.add(light);
      group.add(light.target);

      const pointLight = new THREE.PointLight(0x90cdf4, 0.3, 15);
      pointLight.position.set(0, 0, 3);
      group.add(pointLight);

      group.userData = { id: data.id, index: index, title: data.title, text: data.text };
      scene.add(group);
      billboardMeshes.push(group);
    });
  }


  function setupEventListeners() {
    let scrollTimeout;

    window.addEventListener('wheel', (e) => {
      if (isPaused) return;

      const delta = Math.abs(e.deltaY);
      scrollSpeed = Math.min(delta * 0.02, 5);
      targetCameraZ -= (baseSpeed + scrollSpeed) * 2;
      targetCameraZ = Math.max(targetCameraZ, -cityLength + 50);

      updateSpeedIndicator(scrollSpeed);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollSpeed = 0;
        updateSpeedIndicator(0);
      }, 150);
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (isPaused && e.key !== ' ' && e.key !== 'Escape') return;

      switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          targetCameraZ -= 20;
          targetCameraZ = Math.max(targetCameraZ, -cityLength + 50);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          targetCameraZ += 20;
          targetCameraZ = Math.min(targetCameraZ, 0);
          break;
        case 'Home':
          e.preventDefault();
          targetCameraZ = 0;
          break;
        case 'End':
          e.preventDefault();
          targetCameraZ = -cityLength + 50;
          break;
        case ' ':
          e.preventDefault();
          toggleMotion();
          break;
        case 'Escape':
          e.preventDefault();
          resetCamera();
          break;
      }
    });

    const toggleBtn = document.getElementById('toggle-motion');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleMotion);
    }

    const resetBtn = document.getElementById('reset-camera');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetCamera);
    }

    const panelToggle = document.getElementById('toggle-panel');
    const panelContent = document.getElementById('panel-content');
    if (panelToggle && panelContent) {
      panelToggle.addEventListener('click', () => {
        const isExpanded = panelToggle.getAttribute('aria-expanded') === 'true';
        panelToggle.setAttribute('aria-expanded', !isExpanded);
        panelContent.hidden = isExpanded;
        panelToggle.textContent = isExpanded ? 'Show Text Version' : 'Hide Text Version';
      });
    }

    window.addEventListener('resize', onWindowResize);

    if (prefersReducedMotion) {
      isPaused = true;
      const btn = document.getElementById('toggle-motion');
      if (btn) {
        btn.setAttribute('aria-pressed', 'true');
        btn.textContent = 'Resume Animation';
      }
    }
  }

  function toggleMotion() {
    isPaused = !isPaused;
    const toggleBtn = document.getElementById('toggle-motion');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', isPaused);
      toggleBtn.textContent = isPaused ? 'Resume Animation' : 'Pause Animation';
    }
  }

  function resetCamera() {
    targetCameraZ = 0;
    cameraZ = 0;
    camera.position.z = 0;
    scrollSpeed = 0;
    updateSpeedIndicator(0);
  }

  function updateSpeedIndicator(speed) {
    const fill = document.querySelector('.speed-fill');
    const bar = document.querySelector('.speed-bar');
    if (fill && bar) {
      const percentage = Math.min((speed / 5) * 100, 100);
      fill.style.width = `${percentage}%`;
      bar.setAttribute('aria-valuenow', Math.round(percentage));
    }
  }

  function onWindowResize() {
    const container = document.getElementById('three-canvas');
    if (!container || !camera || !renderer) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (!isPaused) {
      targetCameraZ -= baseSpeed * 0.1;
      targetCameraZ = Math.max(targetCameraZ, -cityLength + 50);
    }

    cameraZ += (targetCameraZ - cameraZ) * 0.05;
    camera.position.z = cameraZ;
    camera.lookAt(0, 5, cameraZ - 100);

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
