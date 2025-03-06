import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(25, 50, 25);
scene.add(pointLight);

camera.position.z = 50;

const loader = new FontLoader();

loader.load('/fonts/helvetiker_regular.typeface.json', function ( font ) {
            const textGeometry = new TextGeometry('leeway', {
                font: font,
                size: 5,
            });

            // Center the text
            textGeometry.center();

            // Create material
            // const textMaterial = new THREE.MeshPhongMaterial({
            //     color: 0xff8800,
            //     specular: 0xffffff,
            //     shininess: 100
            // });
            const textMaterial = new THREE.MeshNormalMaterial();

            // Create mesh
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            scene.add(textMesh);

            // textMesh.rotation.x += 0.05;
            // textMesh.rotation.y += 0.05;

            function animate() {
              renderer.render( scene, camera );
            }
            renderer.setAnimationLoop( animate );
} );
