/**
 * NEXUS Particle Engine v2.0
 * Advanced 3D Particle System with Dynamic Shape Morphing
 * @author Shiva Ganesh
 * @description Real-time interactive particle system with hand gesture control
 */

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.particles = [];
        this.particleCount = 3000;
        this.currentShape = 'hearts';
        this.currentColorTheme = 'cyberpunk';
        this.expansionFactor = 1;
        this.targetExpansion = 1;
        this.rotationSpeed = 0.002;
        this.time = 0;
        this.burstActive = false;
        this.chaosMode = false;
        this.webMode = false;
        this.handPosition = { x: 0, y: 0, z: 0 };
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        
        // Enhanced color themes
        this.colorThemes = {
            cyberpunk: [
                new THREE.Color(0xff00ff), // Magenta
                new THREE.Color(0x00ffff), // Cyan
                new THREE.Color(0xff0080), // Hot Pink
                new THREE.Color(0x8000ff), // Purple
                new THREE.Color(0x00ff80), // Mint
                new THREE.Color(0xff8000), // Orange
            ],
            matrix: [
                new THREE.Color(0x00ff00),
                new THREE.Color(0x00cc00),
                new THREE.Color(0x009900),
                new THREE.Color(0x00ff66),
                new THREE.Color(0x33ff33),
                new THREE.Color(0x66ff66),
            ],
            sunset: [
                new THREE.Color(0xff4500),
                new THREE.Color(0xff6347),
                new THREE.Color(0xff7f50),
                new THREE.Color(0xffa500),
                new THREE.Color(0xffd700),
                new THREE.Color(0xff1493),
            ],
            aurora: [
                new THREE.Color(0x00ff87),
                new THREE.Color(0x00d4ff),
                new THREE.Color(0x9d00ff),
                new THREE.Color(0xff00c8),
                new THREE.Color(0x00ffc8),
                new THREE.Color(0x7b00ff),
            ],
            lava: [
                new THREE.Color(0xff0000),
                new THREE.Color(0xff3300),
                new THREE.Color(0xff6600),
                new THREE.Color(0xff9900),
                new THREE.Color(0xffcc00),
                new THREE.Color(0xcc0000),
            ],
            ice: [
                new THREE.Color(0x00bfff),
                new THREE.Color(0x87ceeb),
                new THREE.Color(0xadd8e6),
                new THREE.Color(0xe0ffff),
                new THREE.Color(0xf0f8ff),
                new THREE.Color(0x00ffff),
            ]
        };
        
        this.shapes = ['hearts', 'flowers', 'saturn', 'fireworks', 'galaxy', 'dna', 'cube', 'tornado'];
        
        this.init();
    }
    
    init() {
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 60;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a0a0f, 1);
        this.container.appendChild(this.renderer.domElement);
        
        // Create systems
        this.createParticles();
        this.createBackgroundStars();
        this.createNebula();
        
        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        
        // Start animation
        this.animate();
    }
    
    createBackgroundStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 300;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
            
            const brightness = 0.5 + Math.random() * 0.5;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = brightness;
            
            sizes[i] = Math.random() * 2;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.backgroundStars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.backgroundStars);
    }
    
    createNebula() {
        // Create nebula effect with large transparent spheres
        const nebulaGroup = new THREE.Group();
        
        const nebulaColors = [0x4a0080, 0x000080, 0x800040];
        
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.SphereGeometry(30 + Math.random() * 40, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: nebulaColors[i % nebulaColors.length],
                transparent: true,
                opacity: 0.03,
                side: THREE.BackSide
            });
            
            const nebula = new THREE.Mesh(geometry, material);
            nebula.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 50 - 50
            );
            nebulaGroup.add(nebula);
        }
        
        this.nebula = nebulaGroup;
        this.scene.add(this.nebula);
    }
    
    createParticles() {
        if (this.particleGroup) {
            this.scene.remove(this.particleGroup);
        }
        
        this.particleGroup = new THREE.Group();
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        
        this.originalPositions = new Float32Array(this.particleCount * 3);
        this.targetPositions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        this.particlePhases = new Float32Array(this.particleCount);
        
        this.generateShapePositions(this.currentShape, this.originalPositions);
        
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = this.originalPositions[i * 3];
            positions[i * 3 + 1] = this.originalPositions[i * 3 + 1];
            positions[i * 3 + 2] = this.originalPositions[i * 3 + 2];
            
            this.targetPositions[i * 3] = positions[i * 3];
            this.targetPositions[i * 3 + 1] = positions[i * 3 + 1];
            this.targetPositions[i * 3 + 2] = positions[i * 3 + 2];
            
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            
            this.particlePhases[i] = Math.random() * Math.PI * 2;
            
            const colorIndex = Math.floor(Math.random() * this.colorThemes[this.currentColorTheme].length);
            const color = this.colorThemes[this.currentColorTheme][colorIndex];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: this.renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                varying float vSize;
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    vSize = size;
                    
                    vec3 pos = position;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * pixelRatio * (350.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vSize;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
                    float glow = exp(-dist * 3.0) * 0.5;
                    
                    vec3 finalColor = vColor * (1.0 + glow);
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particleMesh = new THREE.Points(geometry, material);
        this.particleGroup.add(this.particleMesh);
        this.scene.add(this.particleGroup);
        
        // Update UI
        document.getElementById('particle-count').textContent = this.particleCount;
    }
    
    generateShapePositions(shape, positions) {
        switch (shape) {
            case 'hearts':
                this.generateHeartPositions(positions);
                break;
            case 'flowers':
                this.generateFlowerPositions(positions);
                break;
            case 'saturn':
                this.generateSaturnPositions(positions);
                break;
            case 'fireworks':
                this.generateFireworksPositions(positions);
                break;
            case 'galaxy':
                this.generateGalaxyPositions(positions);
                break;
            case 'dna':
                this.generateDNAPositions(positions);
                break;
            case 'cube':
                this.generateTesseractPositions(positions);
                break;
            case 'tornado':
                this.generateTornadoPositions(positions);
                break;
            default:
                this.generateSpherePositions(positions);
        }
    }
    
    generateHeartPositions(positions) {
        const scale = 1.2;
        for (let i = 0; i < this.particleCount; i++) {
            const t = (i / this.particleCount) * Math.PI * 2;
            const layer = Math.floor(Math.random() * 5);
            const layerOffset = layer * 0.1;
            
            // 3D heart parametric equation
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            
            // Add depth variation for 3D effect
            const z = Math.sin(t * 2) * 5 + (Math.random() - 0.5) * 8;
            
            positions[i * 3] = x * scale * (1 + layerOffset) + (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 1] = y * scale * (1 + layerOffset) + (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 2] = z * (1 + layerOffset);
        }
    }
    
    generateFlowerPositions(positions) {
        const scale = 20;
        const petals = 6;
        
        for (let i = 0; i < this.particleCount; i++) {
            const layer = i / this.particleCount;
            
            if (layer < 0.15) {
                // Center of flower
                const phi = Math.random() * Math.PI * 2;
                const r = Math.random() * 4;
                positions[i * 3] = r * Math.cos(phi);
                positions[i * 3 + 1] = r * Math.sin(phi);
                positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
            } else {
                // Petals
                const theta = Math.random() * Math.PI * 2;
                const petalShape = Math.abs(Math.cos(petals * theta / 2));
                const r = petalShape * scale * (0.5 + Math.random() * 0.5);
                
                positions[i * 3] = r * Math.cos(theta) + (Math.random() - 0.5) * 2;
                positions[i * 3 + 1] = r * Math.sin(theta) + (Math.random() - 0.5) * 2;
                positions[i * 3 + 2] = Math.sin(theta * petals) * 3 + (Math.random() - 0.5) * 2;
            }
        }
    }
    
    generateSaturnPositions(positions) {
        const planetRadius = 12;
        const ringInnerRadius = 18;
        const ringOuterRadius = 30;
        
        for (let i = 0; i < this.particleCount; i++) {
            if (i < this.particleCount * 0.35) {
                // Planet sphere
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.acos(2 * Math.random() - 1);
                const r = planetRadius * Math.cbrt(Math.random());
                
                positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
                positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
                positions[i * 3 + 2] = r * Math.cos(theta);
            } else {
                // Rings with tilt
                const angle = Math.random() * Math.PI * 2;
                const r = ringInnerRadius + Math.random() * (ringOuterRadius - ringInnerRadius);
                const ringThickness = 0.5 + Math.random() * 0.5;
                
                // Add gaps in the ring
                const gapCheck = Math.sin(angle * 8);
                const gap = gapCheck > 0.7 ? 0 : 1;
                
                const x = r * Math.cos(angle) * gap;
                const y = (Math.random() - 0.5) * ringThickness * 2;
                const z = r * Math.sin(angle) * 0.3 * gap; // Tilt the ring
                
                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;
            }
        }
    }
    
    generateFireworksPositions(positions) {
        const burstCount = 7;
        const particlesPerBurst = Math.floor(this.particleCount / burstCount);
        
        for (let b = 0; b < burstCount; b++) {
            const centerX = (Math.random() - 0.5) * 40;
            const centerY = (Math.random() - 0.5) * 40;
            const centerZ = (Math.random() - 0.5) * 30;
            const burstRadius = 8 + Math.random() * 12;
            
            for (let i = 0; i < particlesPerBurst; i++) {
                const idx = b * particlesPerBurst + i;
                if (idx >= this.particleCount) break;
                
                // Create starburst pattern
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.acos(2 * Math.random() - 1);
                const r = burstRadius * Math.pow(Math.random(), 0.5);
                
                // Add trails
                const trail = Math.random() < 0.3 ? Math.random() * 5 : 0;
                
                positions[idx * 3] = centerX + r * Math.sin(theta) * Math.cos(phi);
                positions[idx * 3 + 1] = centerY + r * Math.sin(theta) * Math.sin(phi) - trail;
                positions[idx * 3 + 2] = centerZ + r * Math.cos(theta);
            }
        }
    }
    
    generateGalaxyPositions(positions) {
        const arms = 4;
        const armSpread = 0.5;
        const galaxyRadius = 30;
        
        for (let i = 0; i < this.particleCount; i++) {
            const radius = Math.random() * galaxyRadius;
            const armAngle = (i % arms) * (Math.PI * 2 / arms);
            const spinAmount = radius * 0.5;
            const angle = armAngle + spinAmount + (Math.random() - 0.5) * armSpread;
            
            // Create spiral arms
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Flatten towards center, thicken at edges
            const heightVariance = (radius / galaxyRadius) * 3;
            const y = (Math.random() - 0.5) * heightVariance;
            
            positions[i * 3] = x + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z + (Math.random() - 0.5) * 2;
        }
    }
    
    generateDNAPositions(positions) {
        const height = 50;
        const radius = 10;
        const twists = 3;
        
        for (let i = 0; i < this.particleCount; i++) {
            const t = (i / this.particleCount) * height - height / 2;
            const angle = (t / height) * Math.PI * 2 * twists;
            
            if (i % 20 < 10) {
                // First helix strand
                positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.5;
                positions[i * 3 + 1] = t + (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.5;
            } else if (i % 20 < 18) {
                // Second helix strand
                positions[i * 3] = Math.cos(angle + Math.PI) * radius + (Math.random() - 0.5) * 1.5;
                positions[i * 3 + 1] = t + (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 2] = Math.sin(angle + Math.PI) * radius + (Math.random() - 0.5) * 1.5;
            } else {
                // Connecting rungs (base pairs)
                const rungT = Math.random();
                const x1 = Math.cos(angle) * radius;
                const z1 = Math.sin(angle) * radius;
                const x2 = Math.cos(angle + Math.PI) * radius;
                const z2 = Math.sin(angle + Math.PI) * radius;
                
                positions[i * 3] = x1 + (x2 - x1) * rungT;
                positions[i * 3 + 1] = t;
                positions[i * 3 + 2] = z1 + (z2 - z1) * rungT;
            }
        }
    }
    
    generateTesseractPositions(positions) {
        const size = 15;
        const innerSize = size * 0.5;
        
        // Vertices of outer and inner cubes
        const outerVertices = [];
        const innerVertices = [];
        
        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                for (let z = -1; z <= 1; z += 2) {
                    outerVertices.push([x * size, y * size, z * size]);
                    innerVertices.push([x * innerSize, y * innerSize, z * innerSize]);
                }
            }
        }
        
        for (let i = 0; i < this.particleCount; i++) {
            const section = i / this.particleCount;
            
            if (section < 0.3) {
                // Outer cube edges
                const edgeIdx = Math.floor(Math.random() * 12);
                const edges = [
                    [0, 1], [2, 3], [4, 5], [6, 7], // X edges
                    [0, 2], [1, 3], [4, 6], [5, 7], // Y edges
                    [0, 4], [1, 5], [2, 6], [3, 7]  // Z edges
                ];
                const edge = edges[edgeIdx];
                const t = Math.random();
                const v1 = outerVertices[edge[0]];
                const v2 = outerVertices[edge[1]];
                
                positions[i * 3] = v1[0] + (v2[0] - v1[0]) * t + (Math.random() - 0.5);
                positions[i * 3 + 1] = v1[1] + (v2[1] - v1[1]) * t + (Math.random() - 0.5);
                positions[i * 3 + 2] = v1[2] + (v2[2] - v1[2]) * t + (Math.random() - 0.5);
            } else if (section < 0.6) {
                // Inner cube edges
                const edgeIdx = Math.floor(Math.random() * 12);
                const edges = [
                    [0, 1], [2, 3], [4, 5], [6, 7],
                    [0, 2], [1, 3], [4, 6], [5, 7],
                    [0, 4], [1, 5], [2, 6], [3, 7]
                ];
                const edge = edges[edgeIdx];
                const t = Math.random();
                const v1 = innerVertices[edge[0]];
                const v2 = innerVertices[edge[1]];
                
                positions[i * 3] = v1[0] + (v2[0] - v1[0]) * t + (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 1] = v1[1] + (v2[1] - v1[1]) * t + (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 2] = v1[2] + (v2[2] - v1[2]) * t + (Math.random() - 0.5) * 0.5;
            } else {
                // Connecting lines between cubes
                const vertIdx = Math.floor(Math.random() * 8);
                const t = Math.random();
                const v1 = outerVertices[vertIdx];
                const v2 = innerVertices[vertIdx];
                
                positions[i * 3] = v1[0] + (v2[0] - v1[0]) * t + (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 1] = v1[1] + (v2[1] - v1[1]) * t + (Math.random() - 0.5) * 0.5;
                positions[i * 3 + 2] = v1[2] + (v2[2] - v1[2]) * t + (Math.random() - 0.5) * 0.5;
            }
        }
    }
    
    generateTornadoPositions(positions) {
        const height = 50;
        const baseRadius = 25;
        const topRadius = 5;
        
        for (let i = 0; i < this.particleCount; i++) {
            const t = i / this.particleCount;
            const y = t * height - height / 2;
            
            // Radius decreases as we go up
            const radius = baseRadius - (baseRadius - topRadius) * t;
            
            // Add spiral twist
            const angle = t * Math.PI * 8 + Math.random() * 0.5;
            
            // Add some turbulence
            const turbulence = Math.sin(t * 20) * 2;
            
            positions[i * 3] = (Math.cos(angle) * radius + turbulence) * (0.8 + Math.random() * 0.4);
            positions[i * 3 + 1] = y + (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = (Math.sin(angle) * radius + turbulence) * (0.8 + Math.random() * 0.4);
        }
    }
    
    generateSpherePositions(positions) {
        const radius = 20;
        for (let i = 0; i < this.particleCount; i++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.acos(2 * Math.random() - 1);
            const r = radius * Math.cbrt(Math.random());
            
            positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            positions[i * 3 + 2] = r * Math.cos(theta);
        }
    }
    
    setShape(shape) {
        this.currentShape = shape;
        this.generateShapePositions(shape, this.targetPositions);
        
        // Show visual feedback
        const gestureEl = document.getElementById('current-gesture');
        const labelEl = document.getElementById('gesture-label');
        
        const icons = {
            hearts: '❤️',
            flowers: '🌸',
            saturn: '🪐',
            fireworks: '🎆',
            galaxy: '🌀',
            dna: '🧬',
            cube: '📦',
            tornado: '🌪️'
        };
        
        gestureEl.textContent = icons[shape] || '✨';
        labelEl.textContent = shape.toUpperCase();
        gestureEl.classList.add('show');
        labelEl.classList.add('show');
        
        setTimeout(() => {
            gestureEl.classList.remove('show');
            labelEl.classList.remove('show');
        }, 1200);
    }
    
    setColorTheme(theme) {
        this.currentColorTheme = theme;
        const colors = this.particleMesh.geometry.attributes.color.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const colorIndex = Math.floor(Math.random() * this.colorThemes[theme].length);
            const color = this.colorThemes[theme][colorIndex];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        this.particleMesh.geometry.attributes.color.needsUpdate = true;
    }
    
    setExpansion(factor) {
        this.targetExpansion = factor;
    }
    
    triggerBurst() {
        this.burstActive = true;
        
        // Randomize velocities for explosion
        for (let i = 0; i < this.particleCount; i++) {
            this.velocities[i * 3] = (Math.random() - 0.5) * 2;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
        
        setTimeout(() => {
            this.burstActive = false;
        }, 800);
    }
    
    triggerChaos() {
        this.chaosMode = true;
        setTimeout(() => {
            this.chaosMode = false;
        }, 2000);
    }
    
    triggerWeb() {
        this.webMode = true;
        setTimeout(() => {
            this.webMode = false;
        }, 1500);
    }
    
    updateHandPosition(x, y) {
        this.handPosition.x = (x - 0.5) * 80;
        this.handPosition.y = -(y - 0.5) * 80;
    }
    
    nextShape() {
        const currentIndex = this.shapes.indexOf(this.currentShape);
        const nextIndex = (currentIndex + 1) % this.shapes.length;
        this.setShape(this.shapes[nextIndex]);
        return this.shapes[nextIndex];
    }
    
    nextColor() {
        const themes = Object.keys(this.colorThemes);
        const currentIndex = themes.indexOf(this.currentColorTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setColorTheme(themes[nextIndex]);
        return themes[nextIndex];
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016;
        this.frameCount++;
        
        // Calculate FPS
        const currentTime = performance.now();
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFrameTime));
            document.getElementById('fps-counter').textContent = this.fps;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }
        
        // Smooth expansion
        this.expansionFactor += (this.targetExpansion - this.expansionFactor) * 0.08;
        
        // Update particles
        const positions = this.particleMesh.geometry.attributes.position.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            
            let targetX = this.targetPositions[idx] * this.expansionFactor;
            let targetY = this.targetPositions[idx + 1] * this.expansionFactor;
            let targetZ = this.targetPositions[idx + 2] * this.expansionFactor;
            
            // Chaos mode - random movement
            if (this.chaosMode) {
                targetX += Math.sin(this.time * 5 + i) * 10;
                targetY += Math.cos(this.time * 5 + i * 0.5) * 10;
                targetZ += Math.sin(this.time * 3 + i * 0.3) * 10;
            }
            
            // Web mode - attract to lines from center
            if (this.webMode) {
                const angle = Math.atan2(positions[idx + 1], positions[idx]);
                const webAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
                targetX = Math.cos(webAngle) * 30 * (i / this.particleCount);
                targetY = Math.sin(webAngle) * 30 * (i / this.particleCount);
            }
            
            // Lerp to target
            positions[idx] += (targetX - positions[idx]) * 0.03;
            positions[idx + 1] += (targetY - positions[idx + 1]) * 0.03;
            positions[idx + 2] += (targetZ - positions[idx + 2]) * 0.03;
            
            // Floating animation
            const phase = this.particlePhases[i];
            positions[idx] += Math.sin(this.time * 2 + phase) * 0.02;
            positions[idx + 1] += Math.cos(this.time * 2 + phase) * 0.02;
            
            // Burst effect
            if (this.burstActive) {
                positions[idx] += this.velocities[idx] * 2;
                positions[idx + 1] += this.velocities[idx + 1] * 2;
                positions[idx + 2] += this.velocities[idx + 2] * 2;
            }
            
            // Hand attraction
            const dx = this.handPosition.x - positions[idx];
            const dy = this.handPosition.y - positions[idx + 1];
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 40) {
                const force = 0.02 * (1 - dist / 40);
                positions[idx] += dx * force;
                positions[idx + 1] += dy * force;
            }
        }
        
        this.particleMesh.geometry.attributes.position.needsUpdate = true;
        
        // Rotate particle group
        this.particleGroup.rotation.y += this.rotationSpeed;
        this.particleGroup.rotation.x = Math.sin(this.time * 0.3) * 0.1;
        
        // Animate background
        if (this.backgroundStars) {
            this.backgroundStars.rotation.y += 0.0003;
            this.backgroundStars.rotation.x += 0.0001;
        }
        
        if (this.nebula) {
            this.nebula.rotation.y += 0.0001;
        }
        
        // Update shader uniforms
        this.particleMesh.material.uniforms.time.value = this.time;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
