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

class WordCloud {
    constructor(container, words = defaultWords) {
        this.container = container;
        this.words = words;
        this.nodeMeshes = [];
        this.animationEnabled = true;
        this.animationFrameId = null;
        this.font = null;
        this.fontLoaded = false;
        this.activeTextMesh = null;
        this.cloudGroup = null;
        this.textGroup = null;
        
        // Performance optimizations
        this.sphereGeometry = new THREE.SphereGeometry(1, 12, 12); // Reduced segments
        this.materialCache = new Map();
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 30; // 30 FPS target
        this.lastAnimationUpdate = 0;
        this.animationUpdateInterval = 50; // Update positions every 50ms
        
        // Raycasting optimization
        this.lastRaycastTime = 0;
        this.raycastThrottle = 100; // Increased throttle time
        
        this.init();
    }
    
    init() {
        // Create main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111133);
        
        // Create main camera
        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 200;
        this.camera.position.y = 50;

        // Create text scene and camera
        this.textScene = new THREE.Scene();
        this.textCamera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.textCamera.position.z = 100;
        this.textCamera.position.y = 20; // Adjusted for better text view
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance" // Prefer GPU over integrated graphics
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
        this.renderer.autoClear = false;
        this.container.appendChild(this.renderer.domElement);
        
        // Create scene groups
        this.cloudGroup = new THREE.Group();
        this.textGroup = new THREE.Group();
        
        // Position the cloud group lower
        this.cloudGroup.position.y = -30;
        
        // Position the text group higher
        this.textGroup.position.y = 40;
        
        // Add groups to respective scenes
        this.scene.add(this.cloudGroup);
        this.textScene.add(this.textGroup);
        
        // Add ambient light to both scenes
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight.clone());
        this.textScene.add(ambientLight.clone());
        
        // Add directional light for main scene
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Add specific light for text scene
        const textLight = new THREE.DirectionalLight(0x6666ff, 1);
        textLight.position.set(0, 0, 1);
        this.textScene.add(textLight);
        
        // Add point lights for globe
        const colors = [0xff5555, 0x55ff55, 0x5555ff];
        colors.forEach((color, i) => {
            const light = new THREE.PointLight(color, 1, 200);
            const angle = (i / colors.length) * Math.PI * 2;
            light.position.set(
                Math.cos(angle) * 100,
                Math.sin(angle) * 100,
                50
            );
            this.cloudGroup.add(light);
        });
        
        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Load font for 3D text
        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.font = font;
            this.fontLoaded = true;
        });
        
        // Create word cloud
        this.createWordCloud();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start animation loop
        this.animate();
    }
    
    createWordCloud() {
        // Clear existing meshes and cache
        this.nodeMeshes.forEach(mesh => this.cloudGroup.remove(mesh));
        this.nodeMeshes = [];
        this.materialCache.clear();
        
        // Optimize geometry creation
        const sortedWords = [...this.words].sort((a, b) => b.weight - a.weight);
        const maxWeight = Math.max(...sortedWords.map(w => w.weight));
        const minWeight = Math.min(...sortedWords.map(w => w.weight));
        const weightRange = maxWeight - minWeight;
        
        // Create node meshes with optimized materials
        sortedWords.forEach((word, index) => {
            const size = 1 + ((word.weight - minWeight) / weightRange) * 3;
            
            // Calculate color values
            const hue = (index / sortedWords.length) * 0.8 + 0.1;
            const saturation = 0.7;
            const lightness = 0.5;
            
            // Create material
            let material;
            
            if (word.text == "leeway") {
                material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHex(0xff0000),
                    shininess: 50, // Reduced for better performance
                });
            } else {
                material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(hue, saturation, lightness),
                    shininess: 50, // Reduced for better performance
                    emissive: new THREE.Color().setHSL(hue, saturation * 0.7, lightness * 0.2)
                });
            }
            
            const nodeMesh = new THREE.Mesh(this.sphereGeometry, material);
            nodeMesh.scale.setScalar(size);
            
            // Optimized position calculation
            const phi = Math.acos(-1 + (2 * index) / sortedWords.length);
            const theta = Math.sqrt(sortedWords.length * Math.PI) * phi;
            const radius = 40;
            
            nodeMesh.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta) - 20,
                radius * Math.cos(phi)
            );
            
            // Store complete userData
            nodeMesh.userData = {
                originalPosition: nodeMesh.position.clone(),
                animationPhase: Math.random() * Math.PI * 2,
                animationSpeed: 0.5,
                word: word,
                originalColor: {
                    hue: hue,
                    saturation: saturation,
                    lightness: lightness
                }
            };
            
            this.cloudGroup.add(nodeMesh);
            this.nodeMeshes.push(nodeMesh);
        });
    }
    
    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        const currentTime = Date.now();
        
        // Limit frame rate
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            return;
        }
        this.lastFrameTime = currentTime;
        
        if (this.animationEnabled) {
            // Only update positions periodically
            if (currentTime - this.lastAnimationUpdate > this.animationUpdateInterval) {
                this.lastAnimationUpdate = currentTime;
                const time = currentTime * 0.001;
                
                this.nodeMeshes.forEach((mesh) => {
                    const data = mesh.userData;
                    
                    // Simplified floating animation with fewer calculations
                    const floatAmplitude = 1.0;
                    const phase = time * data.animationSpeed + data.animationPhase;
                    mesh.position.x = data.originalPosition.x + Math.sin(phase) * floatAmplitude;
                    mesh.position.y = data.originalPosition.y + Math.cos(phase) * floatAmplitude;
                    mesh.position.z = data.originalPosition.z + Math.sin(phase * 0.5) * floatAmplitude;
                });
                
                // Smoother rotation
                this.cloudGroup.rotation.y += 0.01;
            }
        }
        
        // Optimize text animation
        if (this.activeTextMesh) {
            const data = this.activeTextMesh.userData;
            const age = (currentTime - data.createdAt) * 0.001;
            const animationDuration = 1.0;
            
            if (age < animationDuration) {
                // Initial animation from source to center
                const progress = age / animationDuration;
                const eased = 1 - Math.pow(1 - progress, 3);
                
                // Move from source position to center of text group
                const targetPosition = new THREE.Vector3(0, 0, 0);
                this.activeTextMesh.position.lerpVectors(
                    data.sourcePosition,
                    targetPosition,
                    eased
                );
                
                // Also animate the z-position to create a "coming forward" effect
                this.activeTextMesh.position.z = data.sourcePosition.z * (1 - eased);
                
                // Scale up from small to full size
                const scale = 0.1 + 0.9 * eased;
                this.activeTextMesh.scale.setScalar(scale);
            } else {
                // After initial animation, keep text centered in view
                
                // Gentle floating animation
                const floatY = Math.sin(currentTime * 0.001) * 0.5;
                this.activeTextMesh.position.set(0, floatY, 0);
                
                // Check if text is too large for current viewport and adjust if needed
                if (this.activeTextMesh && data.word) {
                    const viewportHeight = this.getViewportHeightAtZ(0);
                    const currentBoundingBox = new THREE.Box3().setFromObject(this.activeTextMesh);
                    const textHeight = currentBoundingBox.max.y - currentBoundingBox.min.y;
                    const textWidth = currentBoundingBox.max.x - currentBoundingBox.min.x;
                    
                    // If text is too large for viewport (with some margin), scale it down
                    const maxAllowedHeight = viewportHeight * 0.7; // 70% of viewport height
                    const maxAllowedWidth = viewportHeight * this.textCamera.aspect * 0.7; // 70% of viewport width
                    
                    if (textHeight > maxAllowedHeight || textWidth > maxAllowedWidth) {
                        const scaleFactorHeight = maxAllowedHeight / textHeight;
                        const scaleFactorWidth = maxAllowedWidth / textWidth;
                        const scaleFactor = Math.min(scaleFactorHeight, scaleFactorWidth);
                        
                        // Apply scale if significantly different from current scale
                        if (Math.abs(scaleFactor - this.activeTextMesh.scale.x) > 0.01) {
                            this.activeTextMesh.scale.multiplyScalar(scaleFactor * 0.95); // 5% margin
                        }
                    }
                }
            }
        }
        
        // Update controls with damping
        this.controls.update();
        
        // Batch rendering
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.textScene, this.textCamera);
    }
    
    onWindowResize() {
        // Update main camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update text camera
        this.textCamera.aspect = window.innerWidth / window.innerHeight;
        this.textCamera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // If there's active text, update its size to fit the new viewport
        if (this.activeTextMesh && this.activeTextMesh.userData.word) {
            // Get current text
            const word = this.activeTextMesh.userData.word;
            
            // For resize, we want the text to stay centered rather than
            // animating from the original source position again
            const position = new THREE.Vector3(0, 0, 30); // Use a fixed position in front of camera
            
            // Remove and recreate with proper sizing for new viewport
            this.removeWordText();
            this.showWordText(word, position);
            
            // Skip the animation since we're just resizing
            if (this.activeTextMesh) {
                this.activeTextMesh.userData.createdAt = 0; // Force animation to complete immediately
                this.activeTextMesh.position.set(0, 0, 0); // Center immediately
                this.activeTextMesh.scale.setScalar(1); // Full scale immediately
            }
        }
    }
    
    // Method to update words
    updateWords(newWords) {
        this.words = newWords;
        this.createWordCloud();
    }
    
    // Add interactivity with raycasting
    setupInteractivity() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.container.addEventListener('mousemove', (event) => {
            // Throttle raycasting
            const now = Date.now();
            if (now - this.lastRaycastTime < this.raycastThrottle) return;
            this.lastRaycastTime = now;
            
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
            
            // Reset cursor
            document.body.style.cursor = 'default';
            
            // Handle intersections
            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                document.body.style.cursor = 'pointer';
            }
        });
        
        this.container.addEventListener('click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
            
            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                const wordData = mesh.userData.word;
                
                // Stop rotation when a word is clicked
                this.animationEnabled = false;
                
                // Show the word text in 3D space
                this.showWordText(wordData, mesh.position.clone());
            } else {
                // Resume rotation when clicking empty space
                this.animationEnabled = true;
                
                // Remove word text
                this.removeWordText();
            }
        });
    }
    
    showWordText(word, position) {
        if (!this.fontLoaded) return;
        
        this.removeWordText();
        
        // Make spheres semi-transparent without changing colors
        this.nodeMeshes.forEach(mesh => {
            mesh.material.transparent = true;
            mesh.material.opacity = 0.3;
        });
        
        // Calculate a base size that considers both word weight and viewport dimensions
        const maxWeight = Math.max(...this.words.map(w => w.weight));
        const weightFactor = word.weight / maxWeight;
        
        // Get viewport dimensions in 3D units at the text position
        // This helps scale text appropriately for different screen sizes
        const viewportHeight = this.getViewportHeightAtZ(0); // At z=0 where text will be displayed
        
        // Adjust size based on text length - longer text should be smaller
        const lengthFactor = Math.max(0.5, 1 - (word.text.length / 20)); // Reduce size for longer words
        
        // Calculate final size considering all factors
        const size = Math.min(
            viewportHeight * 0.15, // Max 15% of viewport height
            (3 + weightFactor * 5) * lengthFactor
        );
        
        // Create text geometry with adjusted size
        const textGeometry = new TextGeometry(word.text, {
            font: this.font,
            size: size,
            depth: size * 0.2,
            curveSegments: 8,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 3
        });
        
        // Center the geometry
        textGeometry.computeBoundingBox();
        const centerOffset = new THREE.Vector3();
        textGeometry.boundingBox.getCenter(centerOffset).negate();
        textGeometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);
        
        // Create material with enhanced visual effects
        const material = new THREE.MeshPhongMaterial({
            color: 0x6666ff,
            specular: 0xffffff,
            shininess: 100,
            emissive: 0x2222aa,
            transparent: true,
            opacity: 0.9
        });
        
        // Create mesh
        const textMesh = new THREE.Mesh(textGeometry, material);
        
        // Convert the clicked sphere position from main scene to text scene coordinates
        // We need to account for the different group positions and camera setups
        const sourcePosition = this.convertPositionToTextScene(position);
        
        // Add entrance animation data
        textMesh.userData = {
            animationPhase: Math.random() * Math.PI * 2,
            createdAt: Date.now(),
            sourcePosition: sourcePosition,
            word: word // Store word data for potential use
        };
        
        // Start position
        textMesh.position.copy(textMesh.userData.sourcePosition);
        textMesh.scale.set(0.1, 0.1, 0.1);
        
        // Add text mesh to text scene
        this.textGroup.add(textMesh);
        this.activeTextMesh = textMesh;
    }
    
    // Helper method to convert a position from the main scene to the text scene
    convertPositionToTextScene(mainScenePosition) {
        // Create a copy of the position to avoid modifying the original
        const position = mainScenePosition.clone();
        
        // Account for the cloudGroup's position offset
        position.y += this.cloudGroup.position.y;
        
        // Project the position to screen coordinates
        const screenPosition = position.clone().project(this.camera);
        
        // Convert screen position back to 3D coordinates in the text scene
        const textScenePosition = new THREE.Vector3(
            screenPosition.x,
            screenPosition.y,
            0 // We want the text to appear at z=0 in the text scene
        ).unproject(this.textCamera);
        
        // Adjust for the text group's position
        textScenePosition.y -= this.textGroup.position.y;
        
        // Add some depth offset to ensure the text starts slightly behind
        // where it will end up (for a more dramatic entrance)
        textScenePosition.z = 30;
        
        return textScenePosition;
    }
    
    // Helper method to calculate viewport height in world units at a given Z position
    getViewportHeightAtZ(z) {
        // Get the camera's field of view in radians
        const fovRadians = this.textCamera.fov * Math.PI / 180;
        
        // Calculate the distance from camera to the z plane
        const distance = Math.abs(this.textCamera.position.z - z);
        
        // Calculate viewport height using trigonometry
        return 2 * Math.tan(fovRadians / 2) * distance;
    }

    removeWordText() {
        if (this.activeTextMesh) {
            this.textGroup.remove(this.activeTextMesh);
            this.activeTextMesh = null;
            
            // Restore sphere colors and opacity
            this.nodeMeshes.forEach(mesh => {
                const material = mesh.material;
                const colorData = mesh.userData.originalColor;
                
                if (mesh.userData.word.text === "leeway") {
                    material.color.setHex(0xff0000);
                    material.emissive.setHex(0x000000);
                } else if (colorData) {
                    // Restore original colors from userData
                    material.color.setHSL(colorData.hue, colorData.saturation, colorData.lightness);
                    material.emissive.setHSL(colorData.hue, colorData.saturation * 0.7, colorData.lightness * 0.2);
                }
                
                material.opacity = 1;
                material.transparent = false;
            });
        }
    }
    
    // Method to toggle animation
    toggleAnimation() {
        this.animationEnabled = !this.animationEnabled;
        return this.animationEnabled;
    }
}

export { WordCloud, defaultWords };
