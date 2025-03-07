import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

class WordCloud {
    constructor(container, words = defaultWords) {
        this.container = container;
        this.words = words;
        this.textMeshes = [];
        this.fontLoaded = false;
        this.font = null;
        
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111133);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 150;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Add point lights for more dynamic lighting
        const colors = [0xff5555, 0x55ff55, 0x5555ff];
        colors.forEach((color, i) => {
            const light = new THREE.PointLight(color, 1, 200);
            const angle = (i / colors.length) * Math.PI * 2;
            light.position.set(
                Math.cos(angle) * 100,
                Math.sin(angle) * 100,
                50
            );
            this.scene.add(light);
        });
        
        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Load font
        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.font = font;
            this.fontLoaded = true;
            this.createWordCloud();
        });
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start animation loop
        this.animate();
    }
    
    createWordCloud() {
        if (!this.fontLoaded) return;
        
        // Clear existing meshes
        this.textMeshes.forEach(mesh => this.scene.remove(mesh));
        this.textMeshes = [];
        
        // Sort words by weight (descending)
        const sortedWords = [...this.words].sort((a, b) => b.weight - a.weight);
        
        // Calculate the scaling factor for weights
        const maxWeight = Math.max(...sortedWords.map(word => word.weight));
        const minWeight = Math.min(...sortedWords.map(word => word.weight));
        const weightRange = maxWeight - minWeight;
        
        // Create text meshes
        sortedWords.forEach((word, index) => {
            // Scale size based on weight
            const size = 3 + ((word.weight - minWeight) / weightRange) * 7;
            const depth = size * 0.2;
            
            // Create text geometry
            const textGeometry = new TextGeometry(word.text, {
                font: this.font,
                size: size,
                depth: depth,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.5,
                bevelSize: 0.2,
                bevelOffset: 0,
                bevelSegments: 3
            });
            
            // Center the geometry
            textGeometry.computeBoundingBox();
            const centerOffset = new THREE.Vector3();
            textGeometry.boundingBox.getCenter(centerOffset).negate();
            textGeometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);
            
            // Create material with unique color based on weight
            const hue = (index / sortedWords.length) * 0.8 + 0.1; // Avoid pure red (0) and pure blue (0.66)
            const saturation = 0.7 + (word.weight / maxWeight) * 0.3;
            const lightness = 0.5 + (word.weight / maxWeight) * 0.2;
            
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(hue, saturation, lightness),
                specular: 0xffffff,
                shininess: 100,
                emissive: new THREE.Color().setHSL(hue, saturation, lightness * 0.2)
            });
            
            // Create mesh
            const textMesh = new THREE.Mesh(textGeometry, material);
            
            // Position in 3D space using spherical distribution
            const phi = Math.acos(-1 + (2 * index) / sortedWords.length);
            const theta = Math.sqrt(sortedWords.length * Math.PI) * phi;
            const radius = 40 + (Math.random() * 30);
            
            textMesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
            textMesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
            textMesh.position.z = radius * Math.cos(phi);
            
            // Random rotation
            textMesh.rotation.x = Math.random() * 0.3;
            textMesh.rotation.y = Math.random() * 0.3;
            
            // Store original position for animation
            textMesh.userData = {
                originalPosition: textMesh.position.clone(),
                originalRotation: textMesh.rotation.clone(),
                animationPhase: Math.random() * Math.PI * 2,
                animationSpeed: 0.5 + Math.random() * 0.5,
                hoverScale: 1.0
            };
            
            this.scene.add(textMesh);
            this.textMeshes.push(textMesh);
        });
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const time = Date.now() * 0.001;
        
        // Animate each word
        this.textMeshes.forEach(mesh => {
            const data = mesh.userData;
            
            // Gentle floating animation
            const floatAmplitude = 0.5;
            mesh.position.x = data.originalPosition.x + Math.sin(time * data.animationSpeed + data.animationPhase) * floatAmplitude;
            mesh.position.y = data.originalPosition.y + Math.cos(time * data.animationSpeed + data.animationPhase) * floatAmplitude;
            mesh.position.z = data.originalPosition.z + Math.sin(time * data.animationSpeed * 0.5 + data.animationPhase) * floatAmplitude;
            
            // Gentle rotation
            mesh.rotation.x = data.originalRotation.x + Math.sin(time * 0.2) * 0.05;
            mesh.rotation.y = data.originalRotation.y + Math.cos(time * 0.2) * 0.05;
            
            // Apply hover scale
            mesh.scale.setScalar(data.hoverScale);
            
            // Ease back to normal scale if needed
            if (data.hoverScale > 1.0) {
                data.hoverScale = THREE.MathUtils.lerp(data.hoverScale, 1.0, 0.05);
            }
        });
        
        // Update controls
        this.controls.update();
        
        // Slowly rotate the entire cloud
        this.scene.rotation.y += 0.001;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Method to update words
    updateWords(newWords) {
        this.words = newWords;
        if (this.fontLoaded) {
            this.createWordCloud();
        }
    }
    
    // Add interactivity with raycasting
    setupInteractivity() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.container.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update the raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Check for intersections
            const intersects = this.raycaster.intersectObjects(this.textMeshes);
            
            // Reset all meshes
            this.textMeshes.forEach(mesh => {
                document.body.style.cursor = 'default';
            });
            
            // Handle intersections
            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                document.body.style.cursor = 'pointer';
                mesh.userData.hoverScale = 1.2;
            }
        });
        
        this.container.addEventListener('click', (event) => {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.textMeshes);
            
            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                // Find the word data
                const wordIndex = this.textMeshes.indexOf(mesh);
                if (wordIndex >= 0) {
                    const word = this.words[wordIndex];
                    console.log(`Clicked on: ${word.text} (weight: ${word.weight})`);
                    // You could trigger an event or callback here
                }
            }
        });
    }
}

export { WordCloud, defaultWords };
