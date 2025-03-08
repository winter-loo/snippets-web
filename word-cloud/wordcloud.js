import * as THREE from 'three';
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
        this.nodeMeshes = [];
        this.connections = [];
        this.labels = [];
        this.animationEnabled = true;
        this.animationFrameId = null;
        this.showLabels = true;
        
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
        
        // Create word cloud
        this.createWordCloud();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Create CSS2D renderer for labels
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.container.appendChild(this.labelRenderer.domElement);
        
        // Start animation loop
        this.animate();
    }
    
    createWordCloud() {
        // Clear existing meshes
        this.nodeMeshes.forEach(mesh => this.scene.remove(mesh));
        this.nodeMeshes = [];
        
        // Clear existing connections
        this.connections.forEach(line => this.scene.remove(line));
        this.connections = [];
        
        // Clear existing labels
        this.labels.forEach(label => {
            if (label.element.parentNode) {
                label.element.parentNode.removeChild(label.element);
            }
        });
        this.labels = [];
        
        // Sort words by weight (descending)
        const sortedWords = [...this.words].sort((a, b) => b.weight - a.weight);
        
        // Calculate the scaling factor for weights
        const maxWeight = Math.max(...sortedWords.map(word => word.weight));
        const minWeight = Math.min(...sortedWords.map(word => word.weight));
        const weightRange = maxWeight - minWeight;
        
        // Create node meshes
        const nodePositions = [];
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        
        sortedWords.forEach((word, index) => {
            // Scale size based on weight
            const size = 1 + ((word.weight - minWeight) / weightRange) * 3;
            
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
            const nodeMesh = new THREE.Mesh(sphereGeometry, material);
            nodeMesh.scale.setScalar(size);
            
            // Position in 3D space using spherical distribution
            const phi = Math.acos(-1 + (2 * index) / sortedWords.length);
            const theta = Math.sqrt(sortedWords.length * Math.PI) * phi;
            const radius = 50;
            
            nodeMesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
            nodeMesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
            nodeMesh.position.z = radius * Math.cos(phi);
            
            // Store original position for animation
            nodeMesh.userData = {
                originalPosition: nodeMesh.position.clone(),
                animationPhase: Math.random() * Math.PI * 2,
                animationSpeed: 0.5 + Math.random() * 0.5,
                hoverScale: 1.0,
                word: word
            };
            
            this.scene.add(nodeMesh);
            this.nodeMeshes.push(nodeMesh);
            nodePositions.push(nodeMesh.position);
            
            // Create label for the node
            const labelDiv = document.createElement('div');
            labelDiv.className = 'node-label';
            labelDiv.textContent = word.text;
            labelDiv.style.color = 'white';
            labelDiv.style.padding = '2px 6px';
            labelDiv.style.borderRadius = '4px';
            labelDiv.style.backgroundColor = 'rgba(0,0,0,0.6)';
            labelDiv.style.fontSize = `${12 + (word.weight - minWeight) / weightRange * 6}px`;
            labelDiv.style.pointerEvents = 'none';
            labelDiv.style.transition = 'opacity 0.3s';
            labelDiv.style.opacity = '0.8';
            
            const label = new CSS2DObject(labelDiv);
            label.position.copy(nodeMesh.position);
            this.scene.add(label);
            this.labels.push(label);
            nodeMesh.userData.label = label;
        });
        
        // Create connections between nodes (for the most important words)
        const numConnections = Math.min(sortedWords.length * 2, 50); // Limit the number of connections
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x4444aa, 
            transparent: true, 
            opacity: 0.3 
        });
        
        for (let i = 0; i < numConnections; i++) {
            // Connect random nodes, with higher probability for more important nodes
            const sourceIndex = Math.floor(Math.pow(Math.random(), 2) * this.nodeMeshes.length);
            let targetIndex;
            do {
                targetIndex = Math.floor(Math.pow(Math.random(), 2) * this.nodeMeshes.length);
            } while (targetIndex === sourceIndex);
            
            const sourcePosition = this.nodeMeshes[sourceIndex].position;
            const targetPosition = this.nodeMeshes[targetIndex].position;
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                sourcePosition,
                targetPosition
            ]);
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
            this.connections.push(line);
        }
    }
    
    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        const time = Date.now() * 0.001;
        
        // Animate each node
        this.nodeMeshes.forEach(mesh => {
            const data = mesh.userData;
            
            // Gentle floating animation (only if animation is enabled)
            if (this.animationEnabled) {
                const floatAmplitude = 1.0;
                mesh.position.x = data.originalPosition.x + Math.sin(time * data.animationSpeed + data.animationPhase) * floatAmplitude;
                mesh.position.y = data.originalPosition.y + Math.cos(time * data.animationSpeed + data.animationPhase) * floatAmplitude;
                mesh.position.z = data.originalPosition.z + Math.sin(time * data.animationSpeed * 0.5 + data.animationPhase) * floatAmplitude;
                
                // Update label position
                if (data.label) {
                    data.label.position.copy(mesh.position);
                }
            } else {
                // When animation is paused, keep nodes at their original positions
                mesh.position.copy(data.originalPosition);
                
                // Update label position
                if (data.label) {
                    data.label.position.copy(mesh.position);
                }
            }
            
            // Apply hover scale
            mesh.scale.setScalar(data.hoverScale * (1 + ((data.word.weight - Math.min(...this.words.map(w => w.weight))) / 
                                                        (Math.max(...this.words.map(w => w.weight)) - Math.min(...this.words.map(w => w.weight)))) * 3));
            
            // Ease back to normal scale if needed
            if (data.hoverScale > 1.0) {
                data.hoverScale = THREE.MathUtils.lerp(data.hoverScale, 1.0, 0.05);
            }
            
            // Update label visibility based on camera distance
            if (data.label && data.label.element) {
                const distance = this.camera.position.distanceTo(mesh.position);
                const opacity = this.showLabels ? Math.max(0, 1 - distance / 150) : 0;
                data.label.element.style.opacity = opacity.toString();
            }
        });
        
        // Update connections to follow nodes
        this.connections.forEach(line => {
            const positions = line.geometry.attributes.position.array;
            const sourceIndex = Math.floor(Math.random() * this.nodeMeshes.length);
            const targetIndex = Math.floor(Math.random() * this.nodeMeshes.length);
            
            if (this.nodeMeshes[sourceIndex] && this.nodeMeshes[targetIndex]) {
                positions[0] = this.nodeMeshes[sourceIndex].position.x;
                positions[1] = this.nodeMeshes[sourceIndex].position.y;
                positions[2] = this.nodeMeshes[sourceIndex].position.z;
                
                positions[3] = this.nodeMeshes[targetIndex].position.x;
                positions[4] = this.nodeMeshes[targetIndex].position.y;
                positions[5] = this.nodeMeshes[targetIndex].position.z;
                
                line.geometry.attributes.position.needsUpdate = true;
            }
        });
        
        // Update controls
        this.controls.update();
        
        // Slowly rotate the entire cloud (only if animation is enabled)
        if (this.animationEnabled) {
            this.scene.rotation.y += 0.001;
        }
        
        this.renderer.render(this.scene, this.camera);
        if (this.labelRenderer) {
            this.labelRenderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.labelRenderer) {
            this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
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
            // Calculate mouse position in normalized device coordinates
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update the raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Check for intersections
            const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
            
            // Reset all meshes
            this.nodeMeshes.forEach(mesh => {
                document.body.style.cursor = 'default';
                if (mesh.userData.label && mesh.userData.label.element) {
                    mesh.userData.label.element.style.backgroundColor = 'rgba(0,0,0,0.6)';
                }
            });
            
            // Handle intersections
            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                document.body.style.cursor = 'pointer';
                mesh.userData.hoverScale = 1.2;
                
                // Highlight label
                if (mesh.userData.label && mesh.userData.label.element) {
                    mesh.userData.label.element.style.backgroundColor = 'rgba(100,100,255,0.8)';
                    mesh.userData.label.element.style.opacity = '1';
                }
            }
        });
        
        this.container.addEventListener('click', (event) => {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.nodeMeshes);
            
            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                // Find the word data
                const wordIndex = this.nodeMeshes.indexOf(mesh);
                if (wordIndex >= 0) {
                    const word = this.words[wordIndex];
                    console.log(`Clicked on: ${word.text} (weight: ${word.weight})`);
                    // You could trigger an event or callback here
                }
            }
        });
    }
    
    // Method to toggle animation
    toggleAnimation() {
        this.animationEnabled = !this.animationEnabled;
        return this.animationEnabled;
    }
    
    // Method to toggle labels
    toggleLabels() {
        this.showLabels = !this.showLabels;
        return this.showLabels;
    }
}

// Create a CSS2D renderer for labels
class CSS2DObject extends THREE.Object3D {
    constructor(element) {
        super();
        this.element = element || document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.userSelect = 'none';
        
        this.addEventListener('removed', () => {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        });
    }
    
    copy(source, recursive) {
        super.copy(source, recursive);
        this.element = source.element.cloneNode(true);
        return this;
    }
}

class CSS2DRenderer {
    constructor() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.pointerEvents = 'none';
        
        this.domElement = container;
        this.cache = {
            objects: new WeakMap()
        };
    }
    
    setSize(width, height) {
        this.domElement.style.width = width + 'px';
        this.domElement.style.height = height + 'px';
    }
    
    render(scene, camera) {
        const fov = camera.projectionMatrix.elements[5] * window.innerHeight / 2;
        
        // Clear existing objects
        while (this.domElement.firstChild) {
            this.domElement.removeChild(this.domElement.firstChild);
        }
        this.cache.objects = new WeakMap();
        
        // Find all CSS2DObjects in the scene
        scene.traverse(object => {
            if (object instanceof CSS2DObject) {
                this.cache.objects.set(object, {
                    object: object,
                    element: object.element,
                    visible: true
                });
                this.domElement.appendChild(object.element);
            }
        });
        
        const vector = new THREE.Vector3();
        const viewMatrix = camera.matrixWorldInverse;
        
        // Get all objects from the scene that are CSS2DObjects
        scene.traverse(object => {
            if (object instanceof CSS2DObject) {
                const data = this.cache.objects.get(object);
                if (!data) return;
                
                if (object.parent === null) {
                    data.visible = false;
                    data.element.style.display = 'none';
                    return;
                }
                
                vector.setFromMatrixPosition(object.matrixWorld);
                vector.applyMatrix4(viewMatrix);
                
                const visible = (vector.z > -1 && vector.z < 1);
                
                if (visible) {
                    vector.applyMatrix4(camera.projectionMatrix);
                    
                    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (1 - (vector.y * 0.5 + 0.5)) * window.innerHeight;
                    
                    data.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                    data.element.style.display = '';
                } else {
                    data.element.style.display = 'none';
                }
                
                data.visible = visible;
            }
        });
    }
}

export { WordCloud, defaultWords, CSS2DObject, CSS2DRenderer };
