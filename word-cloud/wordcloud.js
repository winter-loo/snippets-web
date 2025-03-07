import * as THREE from 'three';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

THREE.Cache.enabled = true;

let container;

let camera, cameraTarget, scene, renderer;

let group, textMesh1, textMesh2, textGeo, materials;

let firstLetter = true;

let text = 'three.js',

    bevelEnabled = true,

    font = undefined;

const depth = 20,
    size = 70,
    hover = 30,

    curveSegments = 4,

    bevelThickness = 16,
    bevelSize = 1.5;

const reverseFontMap = [];
const reverseWeightMap = [];

let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

let fontIndex = 1;

init();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    // CAMERA

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.set(0, 400, 700);

    cameraTarget = new THREE.Vector3(0, 200, 0);

    // SCENE

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // LIGHTS

    // const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
    // dirLight.position.set( 0, 0, 1 ).normalize();
    // scene.add( dirLight );

    const pointLight = new THREE.PointLight(0xffffff, 4.5, 0, 0);
    pointLight.color.setHSL(Math.random(), 1, 0.5);
    pointLight.position.set(0, 100, 90);
    scene.add(pointLight);

    materials = [
        new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
    ];

    group = new THREE.Group();
    group.position.y = 100;

    scene.add(group);

  const axesHelper = new THREE.AxesHelper(5); // Length of axes = 5 units
  scene.add(axesHelper);


    loadFont();

    // RENDERER

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    // EVENTS

    container.style.touchAction = 'none';
    container.addEventListener('pointerdown', onPointerDown);

    document.addEventListener('keypress', onDocumentKeyPress);
    document.addEventListener('keydown', onDocumentKeyDown);

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentKeyDown(event) {

    if (firstLetter) {

        firstLetter = false;
        text = '';

    }

    const keyCode = event.keyCode;

    // backspace

    if (keyCode == 8) {

        event.preventDefault();

        text = text.substring(0, text.length - 1);
        refreshText();

        return false;

    }

}

function onDocumentKeyPress(event) {

    const keyCode = event.which;

    // backspace

    if (keyCode == 8) {

        event.preventDefault();

    } else {

        const ch = String.fromCharCode(keyCode);
        text += ch;

        refreshText();

    }

}

function loadFont() {

    const loader = new FontLoader();
    loader.load('/fonts/helvetiker_regular.typeface.json', function (response) {

        font = response;

        refreshText();

    });

}

function createText() {

    textGeo = new TextGeometry(text, {

        font: font,

        size: size,
        depth: depth,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    });

    textGeo.computeBoundingBox();

    const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

    textMesh1 = new THREE.Mesh(textGeo, materials);

    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    group.add(textMesh1);

}

function refreshText() {

    group.remove(textMesh1);

    if (!text) return;

    createText();

}

function onPointerDown(event) {

    if (event.isPrimary === false) return;

    pointerXOnPointerDown = event.clientX - windowHalfX;
    targetRotationOnPointerDown = targetRotation;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event) {

    if (event.isPrimary === false) return;

    pointerX = event.clientX - windowHalfX;

    targetRotation = targetRotationOnPointerDown + (pointerX - pointerXOnPointerDown) * 0.02;

}

function onPointerUp() {

    if (event.isPrimary === false) return;

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

}

function animate() {

    group.rotation.y += (targetRotation - group.rotation.y) * 0.05;

    camera.lookAt(cameraTarget);

    renderer.clear();
    renderer.render(scene, camera);

}

