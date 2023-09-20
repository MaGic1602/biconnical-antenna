import * as THREE from "three";
import { Vector3 } from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

//#region CONSTANTS

let radius = 10;
let length = 10;
let density = 10;
let poleWidth = 1;
let poleLength = 15;
let posX = 0
let posY = 0
let posZ = 0
let fi = 0
let theta = 0

let facesWithCoords = {}

//#endregion

//#region CONTROLS

var densityInput = document.getElementById("densityInput");
densityInput.setAttribute("value", density.toString());

var poleLengthInput = document.getElementById("poleLengthInput");
poleLengthInput.setAttribute("value", poleLength.toString());

var radiusInput = document.getElementById("radiusInput");
radiusInput.setAttribute("value", radius.toString());

var heightInput = document.getElementById("heightInput");
heightInput.setAttribute("value", length.toString());

var positionXInput = document.getElementById("antennaPositionXInput");
positionXInput.setAttribute("value", posX.toString());

var positionYInput = document.getElementById("antennaPositionYInput");
positionYInput.setAttribute("value", posY.toString());

var positionZInput = document.getElementById("antennaPositionZInput");
positionZInput.setAttribute("value", posZ.toString());

var fiInput = document.getElementById("antennaFiInput");
fiInput.setAttribute("value", fi.toString());

var thetaInput = document.getElementById("antennaThetaInput");
thetaInput.setAttribute("value", theta.toString());

var jsonData = document.getElementById("jsonData");

var exportButton = document.getElementById("exportButton");
exportButton.addEventListener('click', function (e) { exportJSON(facesWithCoords) });

//#endregion

//#region THREE.JS SETUP
var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
const clearColor = parseInt("05024a", 16);
renderer.setClearColor(clearColor);
document.body.appendChild(renderer.domElement);

camera.position.z = 30;
camera.position.x = 30;
camera.lookAt(0, 0, 0);
camera.rotateZ(1.57079633 * 3);

//#endregion

//#region EVENT LISTENER BINDINGS

document.addEventListener("keydown", onDocumentKeyDown, false);

densityInput.addEventListener("change", function (e) {
  density = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

radiusInput.addEventListener("change", function (e) {
  radius = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

heightInput.addEventListener("change", function (e) {
  length = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

positionXInput.addEventListener("change", function (e) {
  posX = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

positionYInput.addEventListener("change", function (e) {
  posY = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

positionZInput.addEventListener("change", function (e) {
  posZ = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

fiInput.addEventListener("change", function (e) {
  fi = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

thetaInput.addEventListener("change", function (e) {
  theta = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

poleLengthInput.addEventListener("change", function (e) {
  poleLength = parseInt(e.currentTarget.value);
  scene.remove(antenna);
  antenna = createAntenna();
  scene.add(antenna);
});

//#endregion

//#region GEOMETRY FUNCTIONS

function removeBase(geometry, segments) {
  var vertices = geometry.attributes.position.array;
  var faces = geometry.index.array;

  const baseVertexCount = segments + 1;
  vertices = Array.from(vertices);
  vertices.splice(-baseVertexCount * 3);

  const baseFaceCount = segments;
  faces = Array.from(faces);
  faces.splice(-baseFaceCount * 3);

  geometry.setIndex(faces);
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(vertices), 3)
  );
  console.trace()
  return geometry;
}

function moveAntenna(antenna) {
  antenna.translateX(posX);
  antenna.translateY(posY);
  antenna.translateZ(posZ);
}

function rotateAntenna(antenna) {
  antenna.rotateX(fi * Math.PI / 180)
  antenna.rotateY(theta * Math.PI / 180)
}

function createAntenna() {
  var cone2bottom = new THREE.ConeBufferGeometry(
    radius,
    length,
    density,
    1,
    false
  );

  var cone1bottom = new THREE.ConeBufferGeometry(
    radius,
    length,
    density,
    1,
    false
  );

  var cone2top = new THREE.ConeBufferGeometry(
    radius,
    length / 2,
    density,
    1,
    false
  );

  var cone1top = new THREE.ConeBufferGeometry(
    radius,
    length / 2,
    density,
    1,
    false
  );

  cone1bottom.translate(0, -length / 2, 0);
  cone1top.rotateZ(Math.PI);
  cone1top.translate(0, -length - length / 4, 0);

  cone2bottom.rotateZ(Math.PI);
  cone2bottom.translate(0, length / 2, 0);
  cone2top.translate(0, length / 4 + length, 0);

  cone1bottom = removeBase(cone1bottom, density);
  cone2bottom = removeBase(cone2bottom, density);
  cone1top = removeBase(cone1top, density);
  cone2top = removeBase(cone2top, density);

  const poleGeometry = new THREE.BoxGeometry(poleLength, poleWidth, poleWidth);
  poleGeometry.translate(-poleLength / 2, 0, 0);

  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([
    cone1bottom,
    cone2bottom,
    cone1top,
    cone2top,
    poleGeometry,
  ]);

  const antenna = new THREE.Mesh(mergedGeometry, material);
  antenna.translateX(poleLength);

  moveAntenna(antenna);
  rotateAntenna(antenna);

  console.trace()

  calculateLinesWithVertices(antenna);

  return antenna;
}

function calculateLinesWithVertices(mesh) {
  facesWithCoords = {}
  const indices = mesh.geometry.index.array;
  const positionAttribute = mesh.geometry.getAttribute('position');
  const faces = [];

  for (let i = 0; i < indices.length; i += 2) {
    const face = {
      a: indices[i],
      b: indices[i + 1],
    };
    faces.push(face)
  }

  var doubles = []
  var count = 0;

  faces.map((face) => {
    var faceWithCoords = {}

    faceWithCoords.a = new Vector3(positionAttribute.getX(face.a), positionAttribute.getY(face.a), positionAttribute.getZ(face.a))
    faceWithCoords.b = new Vector3(positionAttribute.getX(face.b), positionAttribute.getY(face.b), positionAttribute.getZ(face.b))

    if(!doubles.includes(JSON.stringify(faceWithCoords))) {
      facesWithCoords[`žica:${count}`]=faceWithCoords;
      count++;

      doubles.push(JSON.stringify(faceWithCoords));
      var faceReverse = {};
      faceReverse.a = faceWithCoords.b;
      faceReverse.b = faceWithCoords.a;
      doubles.push(JSON.stringify(faceReverse));
    }
  
  })
  return facesWithCoords
}

function onDocumentKeyDown(event) {
  event = event || window.event;
  var keycode = event.keyCode;
  switch (keycode) {
    case 37:
      camera.rotateY(0.1);
      break;
    case 38:
      camera.rotateX(0.1);
      break;
    case 39:
      camera.rotateY(-0.1);
      break;
    case 40:
      camera.rotateX(-0.1);
      break;
    case 65:
      camera.rotateZ(0.1);
      break;
    case 68:
      camera.rotateZ(-0.1);
      break;
    case 87:
      var direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.add(direction);
      break;
    case 83:
      var direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      var inverse = new THREE.Vector3().multiplyVectors(
        new THREE.Vector3(-1, -1, -1),
        direction
      );
      camera.position.add(inverse);

      break;
  }
  console.trace()
}

function newLine(color) {
  const vectors = [new THREE.Vector3(0, -500, 0), new THREE.Vector3(0, 500, 0)];
  const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
  const material = new THREE.LineBasicMaterial({ color: color, linewidth: 1 });
  return new THREE.Line(geometry, material);
}

function createWorldGrid() {
  for (var i = -500; i < 500; i++) {
    const yLine = newLine(0x0000ff);
    yLine.translateZ(i);
    scene.add(yLine);

    const zLine = newLine(0xff0000);
    zLine.translateY(i);
    zLine.rotateX(Math.PI / 2);
    scene.add(zLine);
  }
  console.trace()
}

function exportJSON(json) {
  jsonData.innerHTML = ""
  jsonData.innerHTML = "Exported coordinates <br> <br>" + JSON.stringify(json, undefined, 4);
}
//#endregion

createWorldGrid();
let antenna = createAntenna();
scene.add(antenna);

var counter = 1;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  counter == 1 ? console.trace() : ""
  counter = counter + 1;
}

animate();