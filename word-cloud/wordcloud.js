// 3D Word Cloud implementation using Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Default words to display
const defaultWords = [
    { text: "Three.js", weight: 15 },
    { text: "JavaScript", weight: 12 },
    { text: "WebGL", weight: 10 },
    { text: "Programming", weight: 8 },
    { text: "3D", weight: 14 },
    { text: "Animation", weight: 7 },
    { text: "Visualization", weight: 9 },
    { text: "Interactive", weight: 6 },
    { text: "Web", weight: 11 },
    { text: "Graphics", weight: 8 },
    { text: "Canvas", weight: 7 },
    { text: "HTML5", weight: 9 },
    { text: "CSS", weight: 6 },
    { text: "Development", weight: 5 },
    { text: "Code", weight: 8 },
    { text: "Technology", weight: 7 },
    { text: "Digital", weight: 5 },
    { text: "Design", weight: 6 },
    { text: "Creative", weight: 4 },
    { text: "Visual", weight: 5 }
];

// Check if modules are properly loaded
if (!OrbitControls || !FontLoader || !TextGeometry) {
    console.error('Failed to import Three.js modules. Check the import paths.');
}

// Global variables
let scene, camera, renderer, controls;
let wordMeshes = [];
let words = [...defaultWords];

// Color palette for words
const colors = [
    0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd,
    0x8c564b, 0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf
];

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 200;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add additional lighting effects
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Add a subtle animated background
    const backgroundGeometry = new THREE.SphereGeometry(500, 32, 32);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide
    });
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(backgroundMesh);

    // Generate the word cloud
    generateWordCloud();

    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    document.getElementById('addWordBtn').addEventListener('click', addNewWord);
    document.getElementById('randomizeBtn').addEventListener('click', randomizePositions);
    document.getElementById('resetBtn').addEventListener('click', resetWordCloud);
    document.getElementById('wordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewWord();
        }
    });

    // Start animation loop
    animate();

    // Add hover effect for interactivity
    addHoverEffect();
}

// Generate the 3D word cloud
function generateWordCloud() {
    // Clear existing words
    wordMeshes.forEach(mesh => scene.remove(mesh));
    wordMeshes = [];

    // Create a sphere layout
    const radius = 100;
    const fontLoader = new FontLoader();
    
    // Using a dynamic approach to load the font
    const createWordMesh = (font) => {
        words.forEach((word, index) => {
            // Calculate size based on weight
            const size = Math.max(3, word.weight);
            
            // Create text geometry
            const textGeometry = new TextGeometry(word.text, {
                font: font,
                size: size,
                height: size / 4,
                curveSegments: 5,
                bevelEnabled: false
            });
            
            // Center the text geometry
            textGeometry.computeBoundingBox();
            const centerOffset = new THREE.Vector3();
            centerOffset.subVectors(
                textGeometry.boundingBox.max,
                textGeometry.boundingBox.min
            );
            centerOffset.multiplyScalar(-0.5);
            
            // Create material with random color
            const material = new THREE.MeshPhongMaterial({
                color: colors[index % colors.length],
                specular: 0x555555,
                shininess: 30
            });
            
            // Create mesh
            const textMesh = new THREE.Mesh(textGeometry, material);
            
            // Position on a sphere
            const phi = Math.acos(-1 + (2 * index) / words.length);
            const theta = Math.sqrt(words.length * Math.PI) * phi;
            
            textMesh.position.x = radius * Math.sin(phi) * Math.cos(theta) + centerOffset.x;
            textMesh.position.y = radius * Math.sin(phi) * Math.sin(theta) + centerOffset.y;
            textMesh.position.z = radius * Math.cos(phi) + centerOffset.z;
            
            // Random rotation
            textMesh.rotation.x = Math.random() * 0.3;
            textMesh.rotation.y = Math.random() * 0.3;
            textMesh.rotation.z = Math.random() * 0.3;
            
            // Add to scene and store reference
            scene.add(textMesh);
            wordMeshes.push(textMesh);
        });
    };

    // Load font and create word meshes
    fontLoader.load(
        'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/fonts/helvetiker_regular.typeface.json',
        createWordMesh,
        undefined,
        function(err) {
            console.error('Error loading font:', err);
            // Fallback to basic shapes if font fails to load
            createFallbackWordCloud();
        }
    );
}

// Fallback to basic shapes if font loading fails
function createFallbackWordCloud() {
    words.forEach((word, index) => {
        const size = Math.max(3, word.weight);
        const geometry = new THREE.BoxGeometry(size * word.text.length / 2, size, size / 4);
        const material = new THREE.MeshPhongMaterial({
            color: colors[index % colors.length],
            specular: 0x555555,
            shininess: 30
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position on a sphere
        const radius = 100;
        const phi = Math.acos(-1 + (2 * index) / words.length);
        const theta = Math.sqrt(words.length * Math.PI) * phi;
        
        mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
        mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
        mesh.position.z = radius * Math.cos(phi);
        
        // Random rotation
        mesh.rotation.x = Math.random() * 0.3;
        mesh.rotation.y = Math.random() * 0.3;
        mesh.rotation.z = Math.random() * 0.3;
        
        // Add to scene and store reference
        scene.add(mesh);
        wordMeshes.push(mesh);
    });
}

// Add a new word to the cloud
function addNewWord() {
    const input = document.getElementById('wordInput');
    const text = input.value.trim();
    
    if (text) {
        // Add the new word with a random weight
        words.push({
            text: text,
            weight: Math.floor(Math.random() * 10) + 5
        });
        
        // Regenerate the word cloud
        generateWordCloud();
        
        // Clear the input
        input.value = '';
    }
}

// Randomize positions of words
function randomizePositions() {
    const radius = 100;
    
    wordMeshes.forEach((mesh, index) => {
        // New random position on sphere
        const phi = Math.acos(-1 + (2 * Math.random()));
        const theta = Math.sqrt(words.length * Math.PI) * phi * Math.random();
        
        // Create animation
        const targetX = radius * Math.sin(phi) * Math.cos(theta);
        const targetY = radius * Math.sin(phi) * Math.sin(theta);
        const targetZ = radius * Math.cos(phi);
        
        // Animate to new position over time
        animatePosition(mesh, targetX, targetY, targetZ);
        
        // Random rotation
        mesh.rotation.x = Math.random() * 0.3;
        mesh.rotation.y = Math.random() * 0.3;
        mesh.rotation.z = Math.random() * 0.3;
    });
}

// Animate position change
function animatePosition(mesh, targetX, targetY, targetZ) {
    const startX = mesh.position.x;
    const startY = mesh.position.y;
    const startZ = mesh.position.z;
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Update position
        mesh.position.x = startX + (targetX - startX) * easeProgress;
        mesh.position.y = startY + (targetY - startY) * easeProgress;
        mesh.position.z = startZ + (targetZ - startZ) * easeProgress;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Reset word cloud to default words
function resetWordCloud() {
    words = [...defaultWords];
    generateWordCloud();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Enhance word animations
function animateWords() {
    wordMeshes.forEach(mesh => {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the entire word cloud slowly
    scene.rotation.y += 0.001;
    
    // Animate words
    animateWords();

    // Update controls
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Add hover effect for interactivity
function addHoverEffect() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(wordMeshes);
        
        wordMeshes.forEach(mesh => mesh.material.emissive.set(0x000000));
        intersects.forEach(intersect => intersect.object.material.emissive.set(0x444444));
    });
}

// Initialize the application
init();
