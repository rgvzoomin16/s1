const canvas = document.getElementById("love-canvas");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b2419, 0.052);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xc7ffd9, 1.02);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x79f0b3, 1.25, 35);
pointLight.position.set(3, 4, 6);
scene.add(pointLight);

const accentLight = new THREE.PointLight(0xa0ffde, 0.8, 30);
accentLight.position.set(-5, -3, 5);
scene.add(accentLight);

function heartShape(scale = 1) {
  const x = 0;
  const y = 0;
  const shape = new THREE.Shape();
  shape.moveTo(x, y + 0.5 * scale);
  shape.bezierCurveTo(x, y + 0.5 * scale, x - 0.5 * scale, y, x - 1 * scale, y);
  shape.bezierCurveTo(x - 1.8 * scale, y, x - 1.8 * scale, y + 1.1 * scale, x - 1.8 * scale, y + 1.1 * scale);
  shape.bezierCurveTo(x - 1.8 * scale, y + 1.8 * scale, x - 1 * scale, y + 2.2 * scale, x, y + 3 * scale);
  shape.bezierCurveTo(x + 1 * scale, y + 2.2 * scale, x + 1.8 * scale, y + 1.8 * scale, x + 1.8 * scale, y + 1.1 * scale);
  shape.bezierCurveTo(x + 1.8 * scale, y + 1.1 * scale, x + 1.8 * scale, y, x + 1 * scale, y);
  shape.bezierCurveTo(x + 0.5 * scale, y, x, y + 0.5 * scale, x, y + 0.5 * scale);
  return shape;
}

const heartGeo = new THREE.ExtrudeGeometry(heartShape(0.55), {
  depth: 0.45,
  bevelEnabled: true,
  bevelSegments: 8,
  steps: 2,
  bevelSize: 0.12,
  bevelThickness: 0.14,
});
heartGeo.center();

const heartMaterial = new THREE.MeshStandardMaterial({
  color: 0x5ce4a3,
  metalness: 0.18,
  roughness: 0.25,
  emissive: 0x17784c,
  emissiveIntensity: 0.36,
});

const mainHeart = new THREE.Mesh(heartGeo, heartMaterial);
mainHeart.scale.set(1.4, 1.4, 1.4);
scene.add(mainHeart);

const emojis = ["💚", "💞", "💖", "🌿", "✨", "🫶", "😍", "🌹", "🦋"];
const emojiGroup = new THREE.Group();
const emojiSprites = [];
const mouse = new THREE.Vector2(0, 0);

for (let i = 0; i < 30; i += 1) {
  const symbol = emojis[i % emojis.length];
  const sprite = makeEmojiSprite(symbol);
  const radius = 3.2 + Math.random() * 4.2;
  const theta = Math.random() * Math.PI * 2;
  const y = (Math.random() - 0.5) * 5;

  sprite.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
  sprite.scale.setScalar(0.86 + Math.random() * 0.68);
  sprite.userData = {
    speed: 0.0035 + Math.random() * 0.006,
    radius,
    theta,
    baseY: y,
    bob: Math.random() * Math.PI * 2,
    actionOffset: new THREE.Vector3(),
  };

  emojiSprites.push(sprite);
  emojiGroup.add(sprite);
}

scene.add(emojiGroup);

function makeEmojiSprite(char) {
  const size = 128;
  const emojiCanvas = document.createElement("canvas");
  emojiCanvas.width = size;
  emojiCanvas.height = size;
  const ctx = emojiCanvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);
  ctx.font = "92px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, size / 2, size / 2 + 7);

  const texture = new THREE.CanvasTexture(emojiCanvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  return new THREE.Sprite(material);
}

window.addEventListener("pointermove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  mainHeart.rotation.y = t * 0.6;
  mainHeart.rotation.x = Math.sin(t * 0.8) * 0.16;
  mainHeart.position.y = Math.sin(t * 1.1) * 0.24;

  const targetX = mouse.x * 1.7;
  const targetY = mouse.y * 1.4;

  emojiSprites.forEach((sprite, index) => {
    const data = sprite.userData;
    data.theta += data.speed;
    data.bob += data.speed * 1.8;

    const orbitX = Math.cos(data.theta) * data.radius;
    const orbitZ = Math.sin(data.theta) * data.radius;
    const orbitY = data.baseY + Math.sin(data.bob) * 0.65;

    const factor = 0.35 + (index % 5) * 0.08;
    const desiredX = targetX * factor;
    const desiredY = targetY * factor;

    data.actionOffset.x += (desiredX - data.actionOffset.x) * 0.05;
    data.actionOffset.y += (desiredY - data.actionOffset.y) * 0.05;
    data.actionOffset.z += (Math.sin(t + index) * 0.22 - data.actionOffset.z) * 0.04;

    sprite.position.x = orbitX + data.actionOffset.x;
    sprite.position.y = orbitY + data.actionOffset.y;
    sprite.position.z = orbitZ + data.actionOffset.z;

    sprite.material.opacity = 0.55 + (Math.sin(data.bob * 1.8) + 1) * 0.2;
    sprite.scale.setScalar((0.86 + (Math.sin(t * 2 + index) + 1) * 0.18) * (0.9 + (index % 4) * 0.1));
  });

  emojiGroup.rotation.y = Math.sin(t * 0.25) * 0.34;
  emojiGroup.rotation.x = Math.cos(t * 0.2) * 0.1;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
