// filepath: c:\Development\easter-labrynth\js\renderer.js
// Renderer-håndtering for spillet
import { CONFIG } from './config.js';

export const RendererModule = {
    // Initalisere Three.js komponenter
    init: function() {
        // Opprette Three.js scene
        CONFIG.scene = new THREE.Scene();
        
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Set background color based on level theme
        CONFIG.scene.background = new THREE.Color(CONFIG.colors.sky);
        
        // Set up Easter-themed fog in enhanced mode
        if (CONFIG.enhancedGraphics) {
            CONFIG.scene.fog = new THREE.FogExp2(0xC2E7FF, 0.03);
        }
        
        // Opprette kamera
        CONFIG.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        CONFIG.camera.position.set(0, 10, 0);
        CONFIG.camera.lookAt(0, 0, 0);
        
        // Opprette renderer
        CONFIG.renderer = new THREE.WebGLRenderer({ antialias: CONFIG.enhancedGraphics });
        CONFIG.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Enable shadows and better rendering in enhanced mode
        if (CONFIG.enhancedGraphics) {
            CONFIG.renderer.shadowMap.enabled = true;
            CONFIG.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            CONFIG.renderer.outputEncoding = THREE.sRGBEncoding;
        }
        
        document.getElementById('game-container').appendChild(CONFIG.renderer.domElement);
        
        // Lys
        this.setupLights();
        
        // Lag bakke (grønt gress)
        this.createGround();
        
        // Add Easter decorations if enhanced graphics is enabled
        if (CONFIG.enhancedGraphics) {
            this.addEasterDecorations();
        }
        
        // Håndter vindustørrelse
        window.addEventListener('resize', this.handleResize);
    },
    
    // Oppsett av lys i scenen
    setupLights: function() {
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Base ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, CONFIG.enhancedGraphics ? 0.5 : 0.6);
        CONFIG.scene.add(ambientLight);
        
        if (CONFIG.enhancedGraphics) {
            // Enhanced lighting setup
            const sunLight = new THREE.DirectionalLight(0xFFFFAA, 0.9);
            sunLight.position.set(10, 20, 10);
            sunLight.castShadow = true;
            
            // Improve shadow quality
            sunLight.shadow.mapSize.width = 1024;
            sunLight.shadow.mapSize.height = 1024;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 50;
            sunLight.shadow.camera.left = -15;
            sunLight.shadow.camera.right = 15;
            sunLight.shadow.camera.top = 15;
            sunLight.shadow.camera.bottom = -15;
            
            CONFIG.scene.add(sunLight);
            
            // Add a secondary light for better color
            const fillLight = new THREE.DirectionalLight(0xC2E7FF, 0.4);
            fillLight.position.set(-10, 10, -10);
            CONFIG.scene.add(fillLight);
        } else {
            // Basic lighting for performance mode
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 20, 10);
            CONFIG.scene.add(directionalLight);
        }
    },
    
    // Lag bakkenivå
    createGround: function() {
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        if (CONFIG.enhancedGraphics) {
            // Enhanced ground with texture for Easter theme
            const groundSize = 100;
            const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32);
            
            // Create a canvas for the ground texture
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Draw a green grass texture with Easter pattern
            ctx.fillStyle = '#88D169';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add some texture variation
            ctx.fillStyle = '#7BC35D';
            for (let i = 0; i < 100; i++) {
                const size = 5 + Math.random() * 15;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.beginPath();
                ctx.ellipse(x, y, size, size/2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Add tiny flowers randomly - use theme colors for flowers
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const flowerSize = 3 + Math.random() * 4;
                
                // Convert theme decoration color to CSS color string
                const colorIndex = Math.floor(Math.random() * currentTheme.decorationColors.length);
                const themeColor = currentTheme.decorationColors[colorIndex];
                const colorHex = themeColor.toString(16).padStart(6, '0');
                const flowerColor = `#${colorHex}`;
                
                // Flower petals using theme color
                ctx.fillStyle = flowerColor;
                for (let p = 0; p < 5; p++) {
                    const angle = (p / 5) * Math.PI * 2;
                    const dx = Math.cos(angle) * flowerSize;
                    const dy = Math.sin(angle) * flowerSize;
                    ctx.beginPath();
                    ctx.ellipse(x + dx, y + dy, flowerSize/2, flowerSize/2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Flower center
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.ellipse(x, y, flowerSize/2, flowerSize/2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            const groundTexture = new THREE.CanvasTexture(canvas);
            groundTexture.wrapS = THREE.RepeatWrapping;
            groundTexture.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set(10, 10);
            
            const groundMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xFFFFFF,
                map: groundTexture,
                roughness: 0.8,
                metalness: 0.1
            });
            
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -0.5;
            ground.receiveShadow = true;
            CONFIG.scene.add(ground);
        } else {
            // Simple ground for performance mode
            const groundGeometry = new THREE.PlaneGeometry(100, 100);
            const groundMaterial = new THREE.MeshStandardMaterial({ color: CONFIG.colors.ground });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -0.5;
            CONFIG.scene.add(ground);
        }
    },
    
    // Add Easter-themed decorations to the scene
    addEasterDecorations: function() {
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Add some clouds in the sky
        this.addClouds();
        
        // Add butterflies that fly around
        this.addButterflies(currentTheme);
    },
    
    // Add clouds to the sky
    addClouds: function() {
        const cloudGroup = new THREE.Group();
        
        for (let i = 0; i < 12; i++) {
            const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
            
            const cloudMaterial = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            });
            
            // Create cloud by combining several spheres
            const cloud = new THREE.Group();
            
            const mainPuff = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.add(mainPuff);
            
            // Add 3-6 additional puffs to form a cloud
            const puffCount = 3 + Math.floor(Math.random() * 4);
            for (let j = 0; j < puffCount; j++) {
                const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);
                const scale = 0.6 + Math.random() * 0.8;
                puff.scale.set(scale, scale, scale);
                puff.position.set(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 0.8,
                    (Math.random() - 0.5) * 2
                );
                cloud.add(puff);
            }
            
            // Position the cloud in the sky
            cloud.position.set(
                (Math.random() - 0.5) * 80,
                25 + (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 80
            );
            
            // Slightly different scale for each cloud
            const cloudScale = 2 + Math.random() * 3;
            cloud.scale.set(cloudScale, cloudScale * 0.6, cloudScale);
            
            // Add animation data
            cloud.userData = {
                speed: 0.02 + Math.random() * 0.02,
                direction: Math.random() * Math.PI * 2
            };
            
            cloudGroup.add(cloud);
        }
        
        CONFIG.scene.add(cloudGroup);
        this.clouds = cloudGroup;
    },
    
    // Add butterflies that fly around
    addButterflies: function(theme) {
        const butterflyGroup = new THREE.Group();
        
        // Create a butterfly geometry
        const createButterfly = () => {
            const butterfly = new THREE.Group();
            
            // Create butterfly wings
            const wingGeometry = new THREE.CircleGeometry(0.5, 8);
            
            // Use theme-specific decoration colors for butterflies
            const wingColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const wingMaterial = new THREE.MeshLambertMaterial({
                color: wingColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.25, 0, 0);
            leftWing.scale.set(0.5, 1, 1);
            butterfly.add(leftWing);
            
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.25, 0, 0);
            rightWing.scale.set(0.5, 1, 1);
            butterfly.add(rightWing);
            
            // Add animation properties
            butterfly.userData = {
                wingPhase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03,
                rotationSpeed: 0.01 + Math.random() * 0.02,
                altitude: 1 + Math.random() * 3,
                direction: Math.random() * Math.PI * 2,
                changeDirectionTime: Math.random() * 200,
                timeToNextChange: Math.random() * 200
            };
            
            return butterfly;
        };
        
        // Create 8 butterflies
        for (let i = 0; i < 8; i++) {
            const butterfly = createButterfly();
            
            // Position butterflies around the scene but not too far from center
            butterfly.position.set(
                (Math.random() - 0.5) * 40,
                butterfly.userData.altitude,
                (Math.random() - 0.5) * 40
            );
            
            butterflyGroup.add(butterfly);
        }
        
        CONFIG.scene.add(butterflyGroup);
        this.butterflies = butterflyGroup;
    },
    
    // Animate decorations
    animateDecorations: function() {
        if (!CONFIG.enhancedGraphics) return;
        
        // Animate clouds
        if (this.clouds) {
            this.clouds.children.forEach(cloud => {
                // Move clouds slowly across the sky
                cloud.position.x += Math.cos(cloud.userData.direction) * cloud.userData.speed;
                cloud.position.z += Math.sin(cloud.userData.direction) * cloud.userData.speed;
                
                // Loop clouds back when they get too far
                const maxDist = 60;
                if (cloud.position.x > maxDist) cloud.position.x = -maxDist;
                if (cloud.position.x < -maxDist) cloud.position.x = maxDist;
                if (cloud.position.z > maxDist) cloud.position.z = -maxDist;
                if (cloud.position.z < -maxDist) cloud.position.z = maxDist;
            });
        }
        
        // Animate butterflies
        if (this.butterflies) {
            this.butterflies.children.forEach(butterfly => {
                // Wing flapping animation
                butterfly.userData.wingPhase += 0.2;
                const wingFlapAmount = Math.sin(butterfly.userData.wingPhase) * Math.PI/4;
                
                // Apply wing rotation
                if (butterfly.children.length >= 2) {
                    butterfly.children[0].rotation.y = wingFlapAmount;
                    butterfly.children[1].rotation.y = -wingFlapAmount;
                }
                
                // Move in current direction
                butterfly.position.x += Math.cos(butterfly.userData.direction) * butterfly.userData.speed;
                butterfly.position.z += Math.sin(butterfly.userData.direction) * butterfly.userData.speed;
                
                // Make butterfly face direction of movement
                butterfly.rotation.y = butterfly.userData.direction;
                
                // Occasionally change direction
                butterfly.userData.timeToNextChange--;
                if (butterfly.userData.timeToNextChange <= 0) {
                    // New random direction
                    butterfly.userData.direction += (Math.random() - 0.5) * Math.PI/2;
                    butterfly.userData.timeToNextChange = butterfly.userData.changeDirectionTime;
                }
                
                // Slightly oscillate up and down
                butterfly.position.y = butterfly.userData.altitude + Math.sin(butterfly.userData.wingPhase * 0.1) * 0.2;
                
                // Keep butterflies within bounds
                const maxDist = 40;
                if (butterfly.position.x > maxDist || butterfly.position.x < -maxDist ||
                    butterfly.position.z > maxDist || butterfly.position.z < -maxDist) {
                    // Turn back toward center
                    butterfly.userData.direction = Math.atan2(-butterfly.position.z, -butterfly.position.x);
                }
            });
        }
    },
    
    // Håndtere endring av vindusstørrelse
    handleResize: function() {
        CONFIG.camera.aspect = window.innerWidth / window.innerHeight;
        CONFIG.camera.updateProjectionMatrix();
        CONFIG.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    // Renderingsløkke
    render: function() {
        // Animate Easter decorations if enhanced graphics are enabled
        if (CONFIG.enhancedGraphics) {
            this.animateDecorations();
        }
        
        CONFIG.renderer.render(CONFIG.scene, CONFIG.camera);
    },
    
    // Fjerne alle objekter ved nivåendring
    clearScene: function() {
        // Beholder grunnleggende objekter som lys, men fjerner labyrint, spiller og egg
        while(CONFIG.scene.children.length > 0) { 
            CONFIG.scene.remove(CONFIG.scene.children[0]); 
        }
        
        // Gjenopprett grunnleggende elementer
        this.setupLights();
        this.createGround();
        
        // Recreate decorations if enhanced graphics is enabled
        if (CONFIG.enhancedGraphics) {
            this.addEasterDecorations();
        }
    }
};