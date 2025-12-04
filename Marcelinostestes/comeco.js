import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/MTLLoader.js";
import { Box3, Vector3, Raycaster } from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// 🎬 Cena
const scene = new THREE.Scene();

// 📷 Câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, 0);

// 🖼️ Renderizador
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const container3D = document.getElementById("container3D");
container3D.appendChild(renderer.domElement);
renderer.setSize(container3D.clientWidth, container3D.clientHeight);


// 💡 Luzes
scene.add(new THREE.AmbientLight(0xffffff, 0.15));
const directional1 = new THREE.DirectionalLight(0xffffff, 0.4);
directional1.position.set(5, 5, 5); scene.add(directional1);
const directional2 = new THREE.DirectionalLight(0xffffff, 0.4);
directional2.position.set(-5, 5, 5); scene.add(directional2);
const directional3 = new THREE.DirectionalLight(0xffffff, 0.4);
directional3.position.set(0, 5, -5); scene.add(directional3);
const pointLight = new THREE.PointLight(0xffffff, 0.3);
pointLight.position.set(0, 2, 2); scene.add(pointLight);

// 🎮 Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.update();

// 📦 Carregar OBJ + MTL
let object;
const mtlLoader = new MTLLoader();
mtlLoader.load("./sla/sla.mtl", (materials) => {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load(
    "./sla/sla.obj",
    (obj) => {
      object = obj;

      const box = new Box3().setFromObject(object);
      const center = new Vector3();
      box.getCenter(center);
      object.position.sub(center);

      object.rotation.y = -Math.PI / 4.2;
      object.position.x -= 0.05;

      const size = new Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

      camera.position.set(0, maxDim * 0.5, cameraZ * 0.8);
      controls.target.set(0, 0, 0);
      controls.update();

      // Salvar posição inicial
      initialCameraPos.copy(camera.position);
      initialTarget.copy(controls.target);

      object.scale.set(1, 1, 1);
      scene.add(object);

      // Criar caixa debug da porta
      addDoorDebugArea();
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
    (error) => console.error("Erro ao carregar OBJ:", error)
  );
});

// Posição inicial da câmera
const initialCameraPos = new Vector3();
const initialTarget = new Vector3();

// Caixa de debug da porta
let portaBox, portaMesh;
function addDoorDebugArea() {
  const portaCentro = new Vector3(-0.04, -0.12, 0.3);
  const portaTamanho = new Vector3(0.3, 0.3, 0.2);

  const geometry = new THREE.BoxGeometry(portaTamanho.x, portaTamanho.y, portaTamanho.z);
  const material = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0 });
  portaMesh = new THREE.Mesh(geometry, material);
  portaMesh.position.copy(portaCentro);
  scene.add(portaMesh);

  portaBox = new Box3().setFromObject(portaMesh);
}

// Raycaster
const raycaster = new Raycaster();
const mouse = new Vector3();

window.addEventListener("click", (event) => {
  if (!portaBox) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(object, true);

  if (intersects.length > 0 && portaBox.containsPoint(intersects[0].point)) {
    zoomToBox(portaBox);
  } else {
    resetCamera();
  }
});

// Zoom na porta
function zoomToBox(box) {
  const center = new Vector3();
  box.getCenter(center);

  const size = new Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  const fov = camera.fov * (Math.PI / 110);
  const distance = (maxDim / 2) / Math.tan(fov / 2);

  const dir = new Vector3().subVectors(camera.position, controls.target).normalize();
  const newPos = center.clone().add(dir.multiplyScalar(distance * 1.8));

  animateCamera(camera.position.clone(), newPos, controls.target.clone(), center, () => {
    // Remove modelo 3D
    if (object) {
      scene.remove(object);
      object.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      object = null;
    }

    // Mostrar conteúdo interno com fade-in
    const conteudo = document.getElementById("conteudo");
    conteudo.classList.remove("hidden");
    setTimeout(() => {
      conteudo.classList.add("show");
    }, 50);
  });
}

// Reset da câmera
function resetCamera() {
  const conteudo = document.getElementById("conteudo");
  if (conteudo) {
    conteudo.classList.remove("show");
    setTimeout(() => conteudo.classList.add("hidden"), 500);
  }

  animateCamera(camera.position.clone(), initialCameraPos, controls.target.clone(), initialTarget);
}

// Animação da câmera
function animateCamera(startPos, endPos, startTarget, endTarget, onComplete) {
  let progress = 0;
  const duration = 53;

  function animate() {
    progress++;
    const t = progress / duration;

    camera.position.lerpVectors(startPos, endPos, t);
    controls.target.lerpVectors(startTarget, endTarget, t);
    controls.update();

    if (progress < duration) requestAnimationFrame(animate);
    else if (onComplete) onComplete();
  }
  animate();
}

// Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});