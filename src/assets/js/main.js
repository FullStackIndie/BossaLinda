// Import all of Bootstrap's JS
import * as bootstrap from "bootstrap/dist/js/bootstrap.esm";

import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { ModelLoader } from "/assets/js/model_loader.js";

const scene = new THREE.Scene();

let object;
let ObjToRender;
let firstLoad = true;

const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.set(-100, 10, 250);
scene.background = new THREE.Color().setHSL(0.6, 0, 1);
scene.fog = new THREE.Fog(scene.background, 1, 5000);
// camera.position.z = 5;

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
scene.add(hemiLightHelper);
// scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(1, 1, 1).normalize();
// scene.add(directionalLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(-1, 1.75, 1);
dirLight.position.multiplyScalar(30);
scene.add(dirLight);

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = -0.0001;

const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
scene.add(dirLightHelper);

const groundGeo = new THREE.PlaneGeometry(10000, 10000);
const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
groundMat.color.setHSL(0.095, 1, 0.75);

const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -35;
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const vertexShader = document.getElementById("vertexShader").textContent;
const fragmentShader = document.getElementById("fragmentShader").textContent;
const uniforms = {
  topColor: { value: new THREE.Color(0x0077ff) },
  bottomColor: { value: new THREE.Color(0xffffff) },
  offset: { value: 33 },
  exponent: { value: 0.6 },
};
uniforms["topColor"].value.copy(hemiLight.color);

scene.fog.color.copy(uniforms["bottomColor"].value);

const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
const skyMat = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.BackSide,
});

const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
var modelView = document.getElementById("model-view");
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(modelView.offsetWidth, window.innerHeight - 200);
renderer.setSize(modelView.offsetWidth, 500);
modelView.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, modelView);
const loader = new STLLoader();
let model;

function STLViewer(modelUrl, elementID) {
  controls.reset();
  scene.remove();

  var elem = document.getElementById(elementID);
  window.addEventListener(
    "resize",
    function () {
      renderer.setSize(elem.offsetWidth, elem.offsetHeight);
      camera.aspect = elem.offsetWidth / elem.offsetHeight;
      // renderer.setSize(elem.clientWidth, elem.clientHeight);
      // camera.aspect = elem.clientWidth / elem.clientHeight;
      camera.updateProjectionMatrix();
    },
    false
  );
  if (document.getElementById("model-load-spinner") == null) {
    var template = document.getElementById("spinner-template");
    var view = document.getElementById("spinner-view");
    var div = template.content.querySelector("div");
    var spinner = document.importNode(div, true);
    view.appendChild(spinner);
  }

  controls.enableDamping = true;
  controls.rotateSpeed = 0.2;
  controls.dampingFactor = 0.1;
  controls.enableZoom = true;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.75;

  loader.load(
    modelUrl,
    function (geometry) {
      geometry.center();

      var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0x111111,
        shininess: 100,
      });

      model = new THREE.Mesh(geometry, material);
      scene.add(model);
      // var fogColor = new THREE.Color(0x000000); // Set the fog color
      // var fogDensity = 0.02; // Set the fog density
      // var fog = new THREE.Fog(fogColor, fogDensity);
      // scene.fog = fog;

      // Compute the middle
      var middle = new THREE.Vector3();
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter(middle);

      // Center it
      model.position.x = -1 * middle.x;
      model.position.y = -1 * middle.y;
      model.position.z = -1 * middle.z;
      // mesh.rotation.set(-7.8, 0, 0.3);
      // mesh.rotation.set(0, 0, -Math.PI / 2);
      model.scale.set(0.3, 0.3, 0.3);
      model.castShadow = true;
      model.receiveShadow = true;

      // Adjust camera position based on bounding box
      var boundingBox = new THREE.Box3().setFromObject(model);
      var center = boundingBox.getCenter(new THREE.Vector3());
      var size = boundingBox.getSize(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.y, size.z);
      var fov = camera.fov * (Math.PI / 180);
      var cameraDistance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

      // Zoom out the camera by a factor
      var zoomFactor = 1.5; // Adjust this value to control the zoom level
      cameraDistance *= zoomFactor;

      camera.position.copy(center);
      camera.position.z += cameraDistance;
      controls.target.copy(center);

      // // Pull the camera away as needed
      // var largestDimension = Math.max(
      //   geometry.boundingBox.max.x,
      //   geometry.boundingBox.max.y,
      //   geometry.boundingBox.max.z
      // );
      // camera.position.z = largestDimension * 1.5;

      // Initialize variables
      let mouseX, mouseY, euler;
      let isShiftDown = false;

      // Add event listeners for mouse and keyboard input
      window.addEventListener("mousemove", onMouseMove, false);
      window.addEventListener("keydown", onKeyDown, false);
      window.addEventListener("keyup", onKeyUp, false);
      window.addEventListener("mousedown", onMouseDown, false);
      window.addEventListener("mouseup", onMouseUp, false);

      // Function to handle keydown events
      function onKeyDown(event) {
        if (event.keyCode === 16) {
          // Shift key
          isShiftDown = true;
        }
      }

      // Function to handle keyup events
      function onKeyUp(event) {
        if (event.keyCode === 16) {
          // Shift key
          isShiftDown = false;
        }
      }

      // Function to handle mouse movement
      function onMouseMove(event) {
        // Calculate normalized device coordinates
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        euler = new THREE.Euler(mouseY * Math.PI, mouseX * Math.PI, 0, "XYZ");
      }

      // Function to handle mouse down events
      function onMouseDown(event) {
        if (event.button === 0 && isShiftDown) {
          // Left mouse button and Shift key
          document.addEventListener("mousemove", rotateModel, false);
        }
      }

      // Function to handle mouse up events
      function onMouseUp(event) {
        if (event.button === 0 && isShiftDown) {
          // Left mouse button and Shift key
          document.removeEventListener("mousemove", rotateModel, false);
        }
      }

      function rotateModel(event) {
        if (model) {
          model.rotation.setFromVector3(euler);
        }
      }

      firstLoad = false;
      var animate = function (mesh) {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate(model);
    },
    (xhr) => {
      if ((xhr.loaded / xhr.total) * 100 == 100) {
        console.log("Model loaded Successfully");
        if (document.getElementById("model-load-spinner") != null) {
          document.getElementById("model-load-spinner").remove();
        }
      }
    },
    (error) => {
      console.log(error);
    }
  );
}

function removeModel() {
  if (model) {
    scene.remove(model);
    model.geometry.dispose();
    model.material.dispose();
    renderer.dispose();
    model = null;
  }
}

const modelLoader = new ModelLoader(
  "anchor-template",
  "model-col-1",
  "model-col-2"
);
modelLoader.loadModels();
var models = document.getElementsByClassName("model-src");
for (let i = 0; i < models.length; i++) {
  models[i].addEventListener("click", () => {
    removeModel();
    var dataSrc = models[i].getAttribute("data-src");
    // console.log(dataSrc);
    STLViewer(dataSrc, "model-view");
  });
}

if (WebGL.isWebGLAvailable()) {
  // Initiate function or other initializations here
  // animate();
  // STLViewer(
  //   "https://dsm56ob6rdulz.cloudfront.net/BossaLinda/Shakespeare_To_Print_or_Not_To_Print_3DL1Z.stl",
  //   "model"
  // );
  if (firstLoad) {
    STLViewer("./models/40k_Tau_Firesight_Marksman_Pod.stl");
    firstLoad = false;
  }
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("container").appendChild(warning);
}
