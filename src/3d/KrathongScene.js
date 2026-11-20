import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class KrathongScene {
  constructor(container, onKrathongSelect) {
    this.container = container;
    this.onKrathongSelect = onKrathongSelect;

    this.krathongObjects = new Map(); // id -> THREE.Group
    this.peopleObjects = [];
    this.lanterns = [];
    this.animatingCamera = false;
    this.cameraTargetPos = new THREE.Vector3();
    this.cameraTargetLook = new THREE.Vector3();

    this.init();
    this.buildAtmosphere();
    this.buildTerrainAndRiver();
    this.buildArchitecture();
    this.buildPeople(20);
    this.setupEvents();
    this.animate();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050814);
    this.scene.fog = new THREE.FogExp2(0x060b1e, 0.007);

    // 2. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 1000);
    this.camera.position.set(0, 22, 52);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below water
    this.controls.minDistance = 8;
    this.controls.maxDistance = 120;
    this.controls.target.set(0, 3, 0);

    // 5. Raycaster
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.clock = new THREE.Clock();
  }

  buildAtmosphere() {
    // Ambient Light (deep midnight blue & warm festival glow)
    const ambientLight = new THREE.AmbientLight(0x2d3a60, 2.2);
    this.scene.add(ambientLight);

    // Moonlight Directional
    const moonLight = new THREE.DirectionalLight(0xe2e8f0, 2.2);
    moonLight.position.set(-45, 60, -50);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.bias = -0.0005;
    this.scene.add(moonLight);

    // The Glowing Full Moon
    const moonGeo = new THREE.SphereGeometry(7, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.set(-55, 65, -80);
    this.scene.add(this.moon);

    // Moon Glow Halo
    const haloGeo = new THREE.RingGeometry(7, 18, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfff3c4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(this.moon.position);
    halo.position.z += 0.5;
    halo.lookAt(this.camera.position);
    this.scene.add(halo);

    // Stars Particle System
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 300;
      starPos[i + 1] = Math.random() * 90 + 20;
      starPos[i + 2] = (Math.random() - 0.5) * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  buildTerrainAndRiver() {
    // 1. River Surface
    const waterGeo = new THREE.PlaneGeometry(160, 160, 64, 64);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x071e3d,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.94
    });
    this.water = new THREE.Mesh(waterGeo, waterMat);
    this.water.position.y = 0;
    this.scene.add(this.water);
    this.waterGeometry = waterGeo;

    // 2. River Bank Ground (Left Shore & Right Shore)
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x142018, roughness: 0.85 });

    // Left Shore (where Temple and Chedi stand)
    const leftBankGeo = new THREE.BoxGeometry(70, 8, 160);
    const leftBank = new THREE.Mesh(leftBankGeo, bankMat);
    leftBank.position.set(-50, 3, 0);
    leftBank.receiveShadow = true;
    this.scene.add(leftBank);

    // Right Shore (where Thai Houses and Boardwalk stand)
    const rightBankGeo = new THREE.BoxGeometry(60, 8, 160);
    const rightBank = new THREE.Mesh(rightBankGeo, bankMat);
    rightBank.position.set(50, 3, 0);
    rightBank.receiveShadow = true;
    this.scene.add(rightBank);

    // Boardwalks / Piers along both shores for people to walk on
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.7 });
    
    // Left Promenade
    const leftPromenade = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 120), woodMat);
    leftPromenade.position.set(-18, 3.2, 0);
    leftPromenade.receiveShadow = true;
    this.scene.add(leftPromenade);

    // Right Promenade
    const rightPromenade = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 120), woodMat);
    rightPromenade.position.set(22, 3.2, 0);
    rightPromenade.receiveShadow = true;
    this.scene.add(rightPromenade);

    // Festive Lanterns on boardwalk posts
    this.createFestiveLanterns();
  }

  createFestiveLanterns() {
    const postMat = new THREE.MeshStandardMaterial({ color: 0x221a15 });
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });

    for (let z = -50; z <= 50; z += 20) {
      // Left side lantern
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), postMat);
      postL.position.set(-16, 5, z);
      this.scene.add(postL);

      const lampL = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), lanternMat);
      lampL.position.set(-16, 7, z);
      this.scene.add(lampL);

      const lightL = new THREE.PointLight(0xffaa33, 0.8, 14);
      lightL.position.copy(lampL.position);
      this.scene.add(lightL);

      // Right side lantern
      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), postMat);
      postR.position.set(20, 5, z);
      this.scene.add(postR);

      const lampR = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), lanternMat);
      lampR.position.set(20, 7, z);
      this.scene.add(lampR);

      const lightR = new THREE.PointLight(0xffaa33, 0.8, 14);
      lightR.position.copy(lampR.position);
      this.scene.add(lightR);
    }
  }

  buildArchitecture() {
    // 1. Thai Wat (Temple) on Left Shore
    this.temple = this.createThaiTemple();
    this.temple.position.set(-36, 7, -15);
    this.scene.add(this.temple);

    // 2. Golden Pagoda / Chedi (พระเจดีย์ทองอร่าม) next to Temple
    this.chedi = this.createGoldenChedi();
    this.chedi.position.set(-38, 7, 20);
    this.scene.add(this.chedi);

    // 3. Thai Traditional Stilt House (บ้านทรงไทยริมน้ำ) on Right Shore
    this.thaiHouse1 = this.createThaiHouse();
    this.thaiHouse1.position.set(38, 7, -12);
    this.scene.add(this.thaiHouse1);

    this.thaiHouse2 = this.createThaiHouse();
    this.thaiHouse2.position.set(38, 7, 24);
    this.thaiHouse2.scale.set(0.85, 0.85, 0.85);
    this.scene.add(this.thaiHouse2);
  }

  createThaiTemple() {
    const templeGroup = new THREE.Group();

    // Temple Main Base / Hall
    const hallMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.6 });
    const hallGeo = new THREE.BoxGeometry(16, 9, 26);
    const hall = new THREE.Mesh(hallGeo, hallMat);
    hall.position.y = 4.5;
    hall.castShadow = true;
    hall.receiveShadow = true;
    templeGroup.add(hall);

    // Red & Gold Multi-tiered Thai Roofs
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

    // Tier 1 Roof
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(13, 6, 4), roofMat);
    roof1.position.set(0, 12, 0);
    roof1.rotation.y = Math.PI / 4;
    roof1.scale.set(1.4, 0.8, 2.0);
    roof1.castShadow = true;
    templeGroup.add(roof1);

    // Tier 2 Roof
    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(10, 5, 4), roofMat);
    roof2.position.set(0, 15, 0);
    roof2.rotation.y = Math.PI / 4;
    roof2.scale.set(1.2, 0.7, 1.7);
    roof2.castShadow = true;
    templeGroup.add(roof2);

    // Golden Gable (หน้าบันทองคำ)
    const gable = new THREE.Mesh(new THREE.ConeGeometry(3, 4, 3), goldMat);
    gable.position.set(0, 14, 13);
    templeGroup.add(gable);

    // Golden Spire on top (ยอดปราสาท)
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.8, 8, 8), goldMat);
    spire.position.set(0, 20, 0);
    templeGroup.add(spire);

    // Front Pillars
    for (let x of [-6, -2, 2, 6]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 9), hallMat);
      pillar.position.set(x, 4.5, 14);
      templeGroup.add(pillar);
    }

    // Warm Light illuminating Temple
    const templeLight = new THREE.PointLight(0xffbe55, 3.5, 50);
    templeLight.position.set(0, 10, 16);
    templeGroup.add(templeLight);

    return templeGroup;
  }

  createGoldenChedi() {
    const chediGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25
    });

    // Tiered Octagonal Base (ฐานแปดเหลี่ยม)
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 2.5, 8), goldMat);
    base1.position.y = 1.25;
    base1.castShadow = true;
    chediGroup.add(base1);

    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.5, 2.5, 8), goldMat);
    base2.position.y = 3.5;
    base2.castShadow = true;
    chediGroup.add(base2);

    // Bell Dome (องค์ระฆัง)
    const bell = new THREE.Mesh(new THREE.SphereGeometry(5.2, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2), goldMat);
    bell.position.y = 4.5;
    bell.castShadow = true;
    chediGroup.add(bell);

    // Throne / Harmika (บัลลังก์)
    const throne = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.5, 3.5), goldMat);
    throne.position.y = 10;
    chediGroup.add(throne);

    // Multi-ring Spire (ปล้องไฉน)
    for (let i = 0; i < 9; i++) {
      const r = 1.6 - i * 0.15;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.1, 0.6, 16), goldMat);
      ring.position.y = 11 + i * 0.6;
      chediGroup.add(ring);
    }

    // Final Golden Needle Top (ปลียอดและเม็ดน้ำค้าง)
    const needle = new THREE.Mesh(new THREE.ConeGeometry(0.3, 5, 16), goldMat);
    needle.position.y = 18.5;
    chediGroup.add(needle);

    // Spot Light shining up at Chedi
    const chediLight = new THREE.PointLight(0xffd700, 4.2, 55);
    chediLight.position.set(0, 12, 10);
    chediGroup.add(chediLight);

    return chediGroup;
  }

  createThaiHouse() {
    const houseGroup = new THREE.Group();
    const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.8 });
    const roofWoodMat = new THREE.MeshStandardMaterial({ color: 0x6d381e, roughness: 0.6 });

    // Stilts / Pillars (เสาเรือน)
    for (let x of [-5, 5]) {
      for (let z of [-7, 0, 7]) {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5), woodDarkMat);
        stilt.position.set(x, 2.5, z);
        houseGroup.add(stilt);
      }
    }

    // House Body (ตัวเรือนฝาปะกน)
    const body = new THREE.Mesh(new THREE.BoxGeometry(11, 5, 15), woodDarkMat);
    body.position.set(0, 7.5, 0);
    body.castShadow = true;
    houseGroup.add(body);

    // Traditional Thai Gable Roof (หลังคาจั่วทรงไทยแอ่นโค้ง)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(9, 6, 4), roofWoodMat);
    roof.position.set(0, 13, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.4, 0.9, 1.8);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Balcony / Porch towards river (ชานเรือน)
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 10), woodDarkMat);
    balcony.position.set(-7, 5, 0);
    houseGroup.add(balcony);

    // Balcony Light
    const houseLight = new THREE.PointLight(0xffa233, 2.5, 25);
    houseLight.position.set(-6, 7, 0);
    houseGroup.add(houseLight);

    return houseGroup;
  }

  buildPeople(count = 20) {
    const skinColors = [0xdfb190, 0xd09f7a, 0xe5c298];
    const shirtColors = [
      0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6,
      0xec4899, 0x14b8a6, 0xf97316, 0x6366f1, 0x06b6d4
    ];

    for (let i = 0; i < count; i++) {
      const personGroup = new THREE.Group();

      const skinColor = skinColors[Math.floor(Math.random() * skinColors.length)];
      const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];

      const skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
      const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), skinMat);
      head.position.y = 2.4;
      personGroup.add(head);

      // Torso / Shirt
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.1, 8), shirtMat);
      torso.position.y = 1.6;
      personGroup.add(torso);

      // Legs
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1), pantsMat);
      legL.position.set(-0.16, 0.55, 0);
      personGroup.add(legL);

      const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1), pantsMat);
      legR.position.set(0.16, 0.55, 0);
      personGroup.add(legR);

      // Distribute 10 people on left shore, 10 on right shore
      const isLeft = i < 10;
      const x = isLeft ? -18 + (Math.random() - 0.5) * 3 : 22 + (Math.random() - 0.5) * 3;
      const z = -45 + (i % 10) * 10 + (Math.random() - 0.5) * 4;

      personGroup.position.set(x, 3.4, z);
      personGroup.rotation.y = isLeft ? Math.PI / 2 + (Math.random() - 0.5) * 0.6 : -Math.PI / 2 + (Math.random() - 0.5) * 0.6;

      this.scene.add(personGroup);
      this.peopleObjects.push({
        group: personGroup,
        baseY: 3.4,
        walkSpeed: 0.4 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  // -------------------------------------------------------------
  // KRATHONG MANAGEMENT (Create, Update, Render)
  // -------------------------------------------------------------
  syncKrathongs(krathongsList) {
    const existingIds = new Set(this.krathongObjects.keys());
    const newIds = new Set(krathongsList.map(k => k.id));

    // Remove deleted ones
    for (let id of existingIds) {
      if (!newIds.has(id)) {
        const obj = this.krathongObjects.get(id);
        this.scene.remove(obj);
        this.krathongObjects.delete(id);
      }
    }

    // Add or update
    krathongsList.forEach((data, index) => {
      if (!this.krathongObjects.has(data.id)) {
        this.createKrathongMesh(data, index, krathongsList.length);
      } else {
        // Update vote count or data reference
        const group = this.krathongObjects.get(data.id);
        group.userData = data;
        if (group.badge && group.badge.updateData) {
          group.badge.updateData(data);
        }
      }
    });
  }

  createKrathongBadge(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    let cachedImg = null;

    const render = (userImg) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pill dimensions
      const px = 18, py = 16, pw = 476, ph = 128, radius = 64;

      // Glow & drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
      ctx.shadowBlur = 18;

      // Glassmorphic background
      const grad = ctx.createLinearGradient(px, py, px + pw, py);
      grad.addColorStop(0, 'rgba(10, 16, 32, 0.94)');
      grad.addColorStop(1, 'rgba(24, 34, 60, 0.92)');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, radius);
      ctx.fill();
      ctx.restore();

      // Golden border
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, radius);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#F59E0B';
      ctx.stroke();

      // Avatar circle
      const avX = px + 64;
      const avY = py + 64;
      const avR = 48;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avX, avY, avR, 0, Math.PI * 2);
      ctx.clip();

      if (userImg) {
        ctx.drawImage(userImg, avX - avR, avY - avR, avR * 2, avR * 2);
      } else {
        // Fallback initials avatar
        ctx.fillStyle = '#6366F1';
        ctx.fillRect(avX - avR, avY - avR, avR * 2, avR * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 42px "Kanit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.name ? data.name.charAt(0) : 'ก', avX, avY);
      }
      ctx.restore();

      // Avatar gold ring
      ctx.beginPath();
      ctx.arc(avX, avY, avR, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FDE68A';
      ctx.stroke();

      // Text: Name
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = 'bold 34px "Kanit", sans-serif';
      ctx.fillStyle = '#FFFFFF';

      let displayName = data.name || 'ผู้เข้าประกวด';
      if (displayName.length > 13) {
        displayName = displayName.substring(0, 12) + '...';
      }
      ctx.fillText(displayName, avX + 60, py + 25);

      // Text: Votes & Heart
      ctx.font = 'bold 28px "Kanit", sans-serif';
      ctx.fillStyle = '#FB7185';
      ctx.fillText(`❤️ ${(data.votes || 0).toLocaleString()} คะแนน`, avX + 60, py + 72);

      texture.needsUpdate = true;
    };

    // Initial render
    render(null);

    // Load photo
    if (data.photoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        cachedImg = img;
        render(cachedImg);
      };
      img.onerror = () => {
        render(null);
      };
      img.src = data.photoUrl;
    }

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(4.2, 1.3, 1);
    sprite.position.set(0, 2.7, 0); // Position above candle
    sprite.renderOrder = 100;

    sprite.updateData = (newData) => {
      data = newData;
      render(cachedImg);
    };

    return sprite;
  }

  createKrathongMesh(data, index, total) {
    const group = new THREE.Group();
    group.userData = data;

    // Krathong Color & Style
    let petalColor = 0xf472b6; // default pink
    if (data.krathongType === 'banana') petalColor = 0x22c55e;
    if (data.krathongType === 'royal') petalColor = 0xf59e0b;
    if (data.krathongType === 'flower') petalColor = 0xec4899;
    if (data.krathongType === 'coconut') petalColor = 0x06b6d4;

    const baseColor = data.krathongType === 'coconut' ? 0x451a03 : 0x15803d;

    // 1. Base (Banana trunk or Coconut)
    const baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 0.45, 18), baseMat);
    base.position.y = 0.2;
    base.castShadow = true;
    group.add(base);

    // 2. Petals Ring (กลีบกระทงพับจีบ)
    const petalMat = new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.4 });
    const petalCount = 14;
    for (let p = 0; p < petalCount; p++) {
      const angle = (p / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.ConeGeometry(0.4, 0.9, 4);
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 1.1, 0.4, Math.sin(angle) * 1.1);
      petal.rotation.y = angle;
      petal.rotation.z = -0.55;
      group.add(petal);
    }

    // Inner Layer Petals
    const innerPetalMat = new THREE.MeshStandardMaterial({ color: 0xfff176, roughness: 0.5 });
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2 + 0.2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), innerPetalMat);
      petal.position.set(Math.cos(angle) * 0.65, 0.45, Math.sin(angle) * 0.65);
      petal.rotation.y = angle;
      petal.rotation.z = -0.4;
      group.add(petal);
    }

    // 3. Candle (เทียน)
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xfffae0 });
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2), candleMat);
    candle.position.set(0, 0.9, 0);
    group.add(candle);

    // Flame (เปลวไฟเรืองแสง)
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), flameMat);
    flame.scale.set(0.8, 1.5, 0.8);
    flame.position.set(0, 1.6, 0);
    group.add(flame);

    // Candle Point Light
    const candleLight = new THREE.PointLight(0xff9900, 1.6, 9);
    candleLight.position.set(0, 1.7, 0);
    group.add(candleLight);

    // 4. Incense Sticks (ธูป 3 ดอก)
    const incenseMat = new THREE.MeshStandardMaterial({ color: 0x991b1b });
    for (let s of [-0.2, 0, 0.2]) {
      const incense = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6), incenseMat);
      incense.position.set(s, 1.0, 0.35);
      incense.rotation.x = 0.2;
      group.add(incense);
    }

    // 5. Floating Name & Photo Badge (ป้ายชื่อและรูปถ่ายลอยเหนือกระทง)
    const badge = this.createKrathongBadge(data);
    group.add(badge);
    group.badge = badge;

    // Small golden mounting post supporting the badge
    const postMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6), postMat);
    post.position.set(0, 1.6, 0);
    group.add(post);

    // 6. Initial River Position
    // Distribute krathongs nicely in the river channel (-12 < x < 16, -55 < z < 55)
    const riverWidth = 24;
    const spacing = 110 / Math.max(total, 1);
    const posX = -10 + Math.random() * riverWidth;
    const posZ = -55 + index * spacing + (Math.random() - 0.5) * 4;

    group.position.set(posX, 0.15, posZ);

    // Speed and drift pattern
    group.driftSpeed = 0.08 + Math.random() * 0.06;
    group.wobblePhase = Math.random() * Math.PI * 2;
    group.flame = flame;
    group.candleLight = candleLight;

    this.scene.add(group);
    this.krathongObjects.set(data.id, group);

    return group;
  }

  // -------------------------------------------------------------
  // CAMERA ANIMATION (Fly smoothly to selected Krathong)
  // -------------------------------------------------------------
  focusOnKrathong(krathongId) {
    const krathong = this.krathongObjects.get(krathongId);
    if (!krathong) return;

    this.animatingCamera = true;
    this.cameraAnimStartTime = performance.now();
    this.cameraAnimDuration = 1200; // ms

    this.cameraStartPos = this.camera.position.clone();
    this.cameraStartTarget = this.controls.target.clone();

    // Destination target is the krathong
    this.cameraEndTarget = krathong.position.clone().add(new THREE.Vector3(0, 0.5, 0));
    // Destination position is slightly above and in front of krathong
    this.cameraEndPos = krathong.position.clone().add(new THREE.Vector3(0, 4.5, 9));
  }

  setupEvents() {
    // Resize Listener
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Pointer Click / Tap Listener for Krathong Interaction
    const canvas = this.renderer.domElement;
    
    let pointerDownPos = { x: 0, y: 0 };
    canvas.addEventListener('pointerdown', (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('pointerup', (e) => {
      // Check if it's a tap/click (not a drag)
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist < 6) {
        this.handlePointerClick(e);
      }
    });
  }

  handlePointerClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Check intersection with all Krathong objects (meshes and sprites)
    const krathongMeshes = [];
    for (let group of this.krathongObjects.values()) {
      group.traverse((child) => {
        if (child.isMesh || child.isSprite) {
          child.krathongOwner = group.userData;
          krathongMeshes.push(child);
        }
      });
    }

    const intersects = this.raycaster.intersectObjects(krathongMeshes, false);
    if (intersects.length > 0) {
      const selectedData = intersects[0].object.krathongOwner;
      if (selectedData && this.onKrathongSelect) {
        this.focusOnKrathong(selectedData.id);
        this.onKrathongSelect(selectedData);
      }
    }
  }

  onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP
  // -------------------------------------------------------------
  animate() {
    this.animFrameId = requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // 1. Water Ripple Effect
    if (this.waterGeometry) {
      const pos = this.waterGeometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getZ(i);
        const y = Math.sin(u * 0.15 + time * 1.5) * 0.12 + Math.cos(v * 0.12 + time * 1.2) * 0.1;
        pos.setY(i, y);
      }
      this.waterGeometry.computeVertexNormals();
      this.waterGeometry.attributes.position.needsUpdate = true;
    }

    // 2. Krathong River Drift & Bobbing
    for (let group of this.krathongObjects.values()) {
      // Drift slowly along the river Z-axis towards +Z
      group.position.z += group.driftSpeed * 0.1;
      if (group.position.z > 58) {
        group.position.z = -58; // Loop back upriver
      }

      // Gentle floating bobbing
      const bob = Math.sin(time * 2.2 + group.wobblePhase) * 0.08;
      group.position.y = 0.18 + bob;
      group.rotation.y += 0.003;
      group.rotation.z = Math.sin(time * 1.5 + group.wobblePhase) * 0.03;

      // Candle flicker
      if (group.flame && group.candleLight) {
        const flicker = 0.85 + Math.sin(time * 18 + group.wobblePhase) * 0.18;
        group.flame.scale.set(0.8 * flicker, 1.5 * flicker, 0.8 * flicker);
        group.candleLight.intensity = 1.4 * flicker;
      }
    }

    // 3. People Walking & Swaying
    for (let p of this.peopleObjects) {
      const sway = Math.sin(time * 4 * p.walkSpeed + p.phase) * 0.05;
      p.group.position.y = p.baseY + Math.abs(sway);
      p.group.rotation.z = sway * 0.5;
    }

    // 4. Smooth Camera Animation when flying to Krathong
    if (this.animatingCamera) {
      const elapsed = performance.now() - this.cameraAnimStartTime;
      const progress = Math.min(elapsed / this.cameraAnimDuration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, ease);
      this.controls.target.lerpVectors(this.cameraStartTarget, this.cameraEndTarget, ease);

      if (progress >= 1) {
        this.animatingCamera = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}
