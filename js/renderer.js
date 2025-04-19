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
        CONFIG.scene.background = new THREE.Color(currentTheme.skyColor || CONFIG.colors.sky);
        
        // Set up Easter-themed fog in enhanced mode
        if (CONFIG.enhancedGraphics) {
            CONFIG.scene.fog = new THREE.FogExp2(currentTheme.fogColor || 0xC2E7FF, currentTheme.fogDensity || 0.03);
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
            const sunLight = new THREE.DirectionalLight(0xFFFFAA, currentTheme.lightIntensity || 0.9);
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
            
            // Add a secondary light for better color - use fog color for an atmospheric effect
            const fillLightColor = currentTheme.fogColor || 0xC2E7FF;
            const fillLight = new THREE.DirectionalLight(fillLightColor, 0.4);
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
            
            // Use theme-specific ground color
            const groundColorHex = currentTheme.groundColor.toString(16).padStart(6, '0');
            ctx.fillStyle = `#${groundColorHex}`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add some texture variation - darker shade of the ground color
            const darkerShade = new THREE.Color(currentTheme.groundColor).multiplyScalar(0.9);
            const darkerHex = Math.floor(darkerShade.r * 255).toString(16).padStart(2, '0') + 
                             Math.floor(darkerShade.g * 255).toString(16).padStart(2, '0') + 
                             Math.floor(darkerShade.b * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = `#${darkerHex}`;
            
            for (let i = 0; i < 100; i++) {
                const size = 5 + Math.random() * 15;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.beginPath();
                ctx.ellipse(x, y, size, size/2, 0, 0, Math.PI * 2);
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
        
        // Add level-specific decorations
        if (currentTheme.uniqueDecoration) {
            this.addUniqueDecorations(currentTheme);
        }
        
        // Add theme-specific particle effects
        if (currentTheme.particleEffect) {
            this.addParticleEffects(currentTheme);
        }
    },
    
    // Add clouds to the sky
    addClouds: function() {
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        const cloudGroup = new THREE.Group();
        
        // Determine cloud color based on theme
        let cloudColor = 0xFFFFFF; // Default white
        
        // If we're in a themed level with special sky, tint the clouds slightly
        if (currentTheme.skyColor) {
            // Create a mixed color between white and the sky color
            const skyColor = new THREE.Color(currentTheme.skyColor);
            cloudColor = new THREE.Color(0xFFFFFF).lerp(skyColor, 0.2).getHex();
        }
        
        for (let i = 0; i < 12; i++) {
            const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
            
            const cloudMaterial = new THREE.MeshLambertMaterial({
                color: cloudColor,
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
    
    // Add level-specific unique decorations
    addUniqueDecorations: function(theme) {
        const decorationGroup = new THREE.Group();
        
        // Handle different decoration types
        switch(theme.uniqueDecoration) {
            case "flowers":
                this.addFlowerDecorations(decorationGroup, theme);
                break;
            case "mushrooms":
                this.addMushroomDecorations(decorationGroup, theme);
                break;
            case "cherryBlossoms":
                this.addCherryBlossomDecorations(decorationGroup, theme);
                break;
            case "butterflies":
                // Extra butterflies for the butterfly-themed level
                this.addExtraButterflies(decorationGroup, theme);
                break;
            case "candies":
                this.addCandyDecorations(decorationGroup, theme);
                break;
            case "lavender":
                this.addLavenderDecorations(decorationGroup, theme);
                break;
            case "mintLeaves":
                this.addMintLeafDecorations(decorationGroup, theme);
                break;
            case "sunflowers":
                this.addSunflowerDecorations(decorationGroup, theme);
                break;
            case "lanterns":
                this.addLanternDecorations(decorationGroup, theme);
                break;
            case "rainbowBanners":
                this.addRainbowBannerDecorations(decorationGroup, theme);
                break;
        }
        
        CONFIG.scene.add(decorationGroup);
        this.uniqueDecorations = decorationGroup;
    },
    
    // Add flower decorations scattered around the scene (for level 1)
    addFlowerDecorations: function(group, theme) {
        const flowerCount = 40;
        
        for (let i = 0; i < flowerCount; i++) {
            const flowerGroup = new THREE.Group();
            
            // Create stem
            const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x00AA00 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.4;
            flowerGroup.add(stem);
            
            // Create flower head using theme colors
            const flowerColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            const petalGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const petalMaterial = new THREE.MeshLambertMaterial({ 
                color: flowerColor,
                emissive: new THREE.Color(flowerColor).multiplyScalar(0.3)
            });
            
            // Create flower petals
            for (let p = 0; p < 5; p++) {
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                const angle = (p / 5) * Math.PI * 2;
                petal.position.set(
                    Math.cos(angle) * 0.2,
                    0.8,
                    Math.sin(angle) * 0.2
                );
                petal.scale.set(0.7, 0.2, 0.7);
                flowerGroup.add(petal);
            }
            
            // Center of flower
            const centerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.y = 0.8;
            flowerGroup.add(center);
            
            // Position flower randomly in the scene, but not too close to center
            const radius = 10 + Math.random() * 30;
            const angle = Math.random() * Math.PI * 2;
            flowerGroup.position.set(
                Math.cos(angle) * radius,
                -0.4, // Half-buried in the ground
                Math.sin(angle) * radius
            );
            
            // Random rotation and slight scale variation
            flowerGroup.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.8 + Math.random() * 0.5;
            flowerGroup.scale.set(scale, scale, scale);
            
            group.add(flowerGroup);
        }
    },
    
    // Add mushroom decorations for Forest Meadow (level 2)
    addMushroomDecorations: function(group, theme) {
        const mushroomCount = 30;
        
        for (let i = 0; i < mushroomCount; i++) {
            const mushroom = new THREE.Group();
            
            // Create stem
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.5, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.25;
            mushroom.add(stem);
            
            // Create cap
            const capGeometry = new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const capColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            const capMaterial = new THREE.MeshLambertMaterial({ 
                color: capColor,
                emissive: new THREE.Color(capColor).multiplyScalar(0.1)
            });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 0.5;
            cap.scale.set(1.5, 1, 1.5);
            mushroom.add(cap);
            
            // Add spots to cap
            const spotCount = 3 + Math.floor(Math.random() * 5);
            for (let s = 0; s < spotCount; s++) {
                const spotGeometry = new THREE.CircleGeometry(0.05 + Math.random() * 0.05, 8);
                const spotMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
                const spot = new THREE.Mesh(spotGeometry, spotMaterial);
                
                // Position on cap
                const spotAngle = Math.random() * Math.PI * 2;
                const spotRadius = Math.random() * 0.25;
                spot.position.set(
                    Math.cos(spotAngle) * spotRadius,
                    0.51, // Slightly above cap
                    Math.sin(spotAngle) * spotRadius
                );
                spot.rotation.x = -Math.PI / 2; // Face upward
                
                mushroom.add(spot);
            }
            
            // Position mushroom randomly in the scene
            const radius = 8 + Math.random() * 35;
            const angle = Math.random() * Math.PI * 2;
            mushroom.position.set(
                Math.cos(angle) * radius,
                -0.4, // Half-buried in the ground
                Math.sin(angle) * radius
            );
            
            // Random rotation and scale
            mushroom.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.6 + Math.random() * 0.8;
            mushroom.scale.set(scale, scale, scale);
            
            group.add(mushroom);
        }
        
        // Add a mushroom circle (fairy ring) as a special feature
        this.addMushroomCircle(group, theme);
    },
    
    // Add a circle of mushrooms (fairy ring) as a special feature for Forest Meadow (level 2)
    addMushroomCircle: function(group, theme) {
        const circleRadius = 8;
        const mushroomCount = 12;
        
        // Random position for the circle
        const circleX = (Math.random() - 0.5) * 30;
        const circleZ = (Math.random() - 0.5) * 30;
        
        for (let i = 0; i < mushroomCount; i++) {
            const angle = (i / mushroomCount) * Math.PI * 2;
            
            const mushroom = new THREE.Group();
            
            // Create stem
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.5, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.25;
            mushroom.add(stem);
            
            // Create cap
            const capGeometry = new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            // Use a consistent color for the circle
            const capMaterial = new THREE.MeshLambertMaterial({ 
                color: theme.decorationColors[0],
                emissive: new THREE.Color(theme.decorationColors[0]).multiplyScalar(0.2)
            });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 0.5;
            cap.scale.set(1.5, 1, 1.5);
            mushroom.add(cap);
            
            // Position in circle
            mushroom.position.set(
                circleX + Math.cos(angle) * circleRadius,
                -0.4,
                circleZ + Math.sin(angle) * circleRadius
            );
            
            // Face toward center
            mushroom.rotation.y = angle + Math.PI;
            
            // All mushrooms in ring are similar size
            const scale = 0.9 + Math.random() * 0.2;
            mushroom.scale.set(scale, scale, scale);
            
            group.add(mushroom);
        }
    },
    
    // Add theme-specific particle effects
    addParticleEffects: function(theme) {
        const particleGroup = new THREE.Group();
        
        // Handle different particle effect types
        switch(theme.particleEffect) {
            case "pollen":
                this.addPollenParticles(particleGroup, theme);
                break;
            case "leafs":
                this.addFloatingLeafs(particleGroup, theme);
                break;
            case "petals":
                this.addCherryBlossomPetals(particleGroup, theme);
                break;
            case "bubbles":
                this.addFloatingBubbles(particleGroup, theme);
                break;
            case "chocolateSparkles":
                this.addChocolateSparkles(particleGroup, theme);
                break;
            case "purpleSparkles":
                this.addColoredSparkles(particleGroup, theme, theme.decorationColors[0]);
                break;
            case "greenSparkles":
                this.addColoredSparkles(particleGroup, theme, theme.decorationColors[0]);
                break;
            case "goldDust":
                this.addGoldDust(particleGroup, theme);
                break;
            case "embers":
                this.addFloatingEmbers(particleGroup, theme);
                break;
            case "confetti":
                this.addConfetti(particleGroup, theme);
                break;
        }
        
        CONFIG.scene.add(particleGroup);
        this.particles = particleGroup;
    },
    
    // Pollen particles floating in the air (for Spring Garden - level 1)
    addPollenParticles: function(group, theme) {
        const particleCount = 200;
        
        // Create a small sprite material for the pollen
        const pollenTexture = this.createCircleTexture(0xFFFFAA, 32);
        const pollenMaterial = new THREE.SpriteMaterial({
            map: pollenTexture,
            transparent: true,
            opacity: 0.6
        });
        
        for (let i = 0; i < particleCount; i++) {
            const pollen = new THREE.Sprite(pollenMaterial);
            
            // Small random size
            const size = 0.05 + Math.random() * 0.1;
            pollen.scale.set(size, size, size);
            
            // Position randomly in the scene
            const radius = Math.random() * 50;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 5;
            
            pollen.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Add animation data
            pollen.userData = {
                floatSpeed: 0.002 + Math.random() * 0.004,
                driftSpeed: 0.005 + Math.random() * 0.01,
                driftDirection: Math.random() * Math.PI * 2,
                bobPhase: Math.random() * Math.PI * 2
            };
            
            group.add(pollen);
        }
    },
    
    // Floating leaf particles (for Forest Meadow - level 2)
    addFloatingLeafs: function(group, theme) {
        const leafCount = 50;
        
        // Create simple leaf shape
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.bezierCurveTo(0.5, 0.5, 1, -0.5, 1.5, 0);
        leafShape.bezierCurveTo(1, 0.5, 0.5, -0.5, 0, 0);
        
        const leafGeometry = new THREE.ShapeGeometry(leafShape);
        
        // Create leaves with varying shades of green
        for (let i = 0; i < leafCount; i++) {
            // Choose from theme colors or default to green shades
            const leafColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const leafMaterial = new THREE.MeshLambertMaterial({
                color: leafColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            const height = 1 + Math.random() * 5;
            
            leaf.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Random rotation for natural look
            leaf.rotation.x = Math.random() * Math.PI * 2;
            leaf.rotation.y = Math.random() * Math.PI * 2;
            leaf.rotation.z = Math.random() * Math.PI * 2;
            
            // Scale to appropriate size
            const scale = 0.2 + Math.random() * 0.2;
            leaf.scale.set(scale, scale, scale);
            
            // Add animation data for floating movement
            leaf.userData = {
                fallSpeed: 0.005 + Math.random() * 0.01,
                spinSpeed: 0.01 + Math.random() * 0.02,
                driftSpeed: 0.01 + Math.random() * 0.02,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                spinAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize()
            };
            
            group.add(leaf);
        }
    },
    
    // Cherry blossom petals falling (for Pink Bloom - level 3)
    addCherryBlossomPetals: function(group, theme) {
        const petalCount = 150;
        
        // Create a simple petal shape
        const petalShape = new THREE.Shape();
        petalShape.moveTo(0, 0);
        petalShape.bezierCurveTo(0.5, 0.5, 1, 0.5, 1, 0);
        petalShape.bezierCurveTo(1, -0.5, 0.5, -0.5, 0, 0);
        
        const petalGeometry = new THREE.ShapeGeometry(petalShape);
        
        for (let i = 0; i < petalCount; i++) {
            // Use theme colors (pinks)
            const petalColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const petalMaterial = new THREE.MeshLambertMaterial({
                color: petalColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            const height = 1 + Math.random() * 6;
            
            petal.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Random rotation
            petal.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5; // Mostly horizontal
            petal.rotation.y = Math.random() * Math.PI * 2;
            petal.rotation.z = Math.random() * Math.PI * 2;
            
            // Small scale
            const scale = 0.1 + Math.random() * 0.1;
            petal.scale.set(scale, scale, scale);
            
            // Add animation data
            petal.userData = {
                fallSpeed: 0.003 + Math.random() * 0.007,
                spinSpeed: 0.01 + Math.random() * 0.03,
                driftSpeed: 0.007 + Math.random() * 0.01,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                bobPhase: Math.random() * Math.PI * 2
            };
            
            group.add(petal);
        }
    },
    
    // Floating bubbles (for Sky Blue - level 4)
    addFloatingBubbles: function(group, theme) {
        const bubbleCount = 80;
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubbleGeometry = new THREE.SphereGeometry(1, 16, 16);
            
            // Create a semi-transparent bubble material
            const bubbleMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.2,
                shininess: 100,
                specular: 0xFFFFFF,
                side: THREE.DoubleSide
            });
            
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 5;
            
            bubble.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small random size
            const size = 0.1 + Math.random() * 0.3;
            bubble.scale.set(size, size, size);
            
            // Add animation data
            bubble.userData = {
                floatSpeed: 0.01 + Math.random() * 0.02,
                driftSpeed: 0.004 + Math.random() * 0.008,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                maxHeight: 6 + Math.random() * 4
            };
            
            group.add(bubble);
        }
    },
    
    // Chocolate sparkles (for Chocolate Rush - level 5)
    addChocolateSparkles: function(group, theme) {
        const sparkleCount = 100;
        
        // Create sparkle texture
        const sparkleTexture = this.createStarTexture(0xAA6633);
        
        for (let i = 0; i < sparkleCount; i++) {
            // Use theme colors (chocolatey browns)
            const sparkleColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const sparkleMaterial = new THREE.SpriteMaterial({
                map: sparkleTexture,
                color: sparkleColor,
                transparent: true,
                opacity: 0.7
            });
            
            const sparkle = new THREE.Sprite(sparkleMaterial);
            
            // Position randomly closer to the ground
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const height = 0.1 + Math.random() * 2; // Lower to the ground
            
            sparkle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small size
            const size = 0.1 + Math.random() * 0.2;
            sparkle.scale.set(size, size, size);
            
            // Add animation data
            sparkle.userData = {
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.05 + Math.random() * 0.1,
                driftSpeed: 0.003 + Math.random() * 0.006,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height
            };
            
            group.add(sparkle);
        }
    },
    
    // Colored sparkles for various levels (purple, green, etc.)
    addColoredSparkles: function(group, theme, baseColor) {
        const sparkleCount = 120;
        
        // Create sparkle texture using the color
        const sparkleTexture = this.createStarTexture(baseColor);
        
        for (let i = 0; i < sparkleCount; i++) {
            // Use theme colors but focus on the base color
            const useBaseColor = Math.random() < 0.7; // 70% chance to use base color
            const sparkleColor = useBaseColor ? baseColor : theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const sparkleMaterial = new THREE.SpriteMaterial({
                map: sparkleTexture,
                color: sparkleColor,
                transparent: true,
                opacity: 0.8
            });
            
            const sparkle = new THREE.Sprite(sparkleMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 4;
            
            sparkle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small size with variation
            const size = 0.08 + Math.random() * 0.15;
            sparkle.scale.set(size, size, size);
            
            // Add animation data
            sparkle.userData = {
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.07 + Math.random() * 0.1,
                driftSpeed: 0.002 + Math.random() * 0.01,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                floatSpeed: 0.005 + Math.random() * 0.01
            };
            
            group.add(sparkle);
        }
    },
    
    // Gold dust particles (for Golden Summer - level 8)
    addGoldDust: function(group, theme) {
        const particleCount = 200;
        
        // Create a small sprite material for gold dust
        const dustTexture = this.createCircleTexture(0xFFDD55, 16);
        
        for (let i = 0; i < particleCount; i++) {
            // Alternate between gold shades from theme
            const dustColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const dustMaterial = new THREE.SpriteMaterial({
                map: dustTexture,
                color: dustColor,
                transparent: true,
                opacity: 0.6 + Math.random() * 0.4
            });
            
            const dust = new THREE.Sprite(dustMaterial);
            
            // Very small random size
            const size = 0.03 + Math.random() * 0.08;
            dust.scale.set(size, size, size);
            
            // Position randomly in the scene, more concentrated in sunlit areas
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 6;
            
            dust.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Add animation data
            dust.userData = {
                floatSpeed: 0.001 + Math.random() * 0.003,
                driftSpeed: 0.002 + Math.random() * 0.008,
                driftDirection: Math.random() * Math.PI * 2,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.1 + Math.random() * 0.2
            };
            
            group.add(dust);
        }
    },
    
    // Floating embers (for Sunset Glow - level 9)
    addFloatingEmbers: function(group, theme) {
        const emberCount = 80;
        
        // Create ember texture
        const emberTexture = this.createCircleTexture(0xFF5500, 32);
        
        for (let i = 0; i < emberCount; i++) {
            // Use theme colors (oranges and reds)
            const emberColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const emberMaterial = new THREE.SpriteMaterial({
                map: emberTexture,
                color: emberColor,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });
            
            const ember = new THREE.Sprite(emberMaterial);
            
            // Position randomly in the air
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const height = 0.5 + Math.random() * 6;
            
            ember.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small size
            const size = 0.05 + Math.random() * 0.1;
            ember.scale.set(size, size, size);
            
            // Add animation data
            ember.userData = {
                floatSpeed: 0.01 + Math.random() * 0.02,
                driftSpeed: 0.005 + Math.random() * 0.01,
                driftDirection: Math.random() * Math.PI * 2,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.1 + Math.random() * 0.2,
                originalSize: size,
                fadeSpeed: 0.002 + Math.random() * 0.004
            };
            
            group.add(ember);
        }
    },
    
    // Confetti particles (for Rainbow Celebration - level 10)
    addConfetti: function(group, theme) {
        const confettiCount = 200;
        
        // Create small rectangular pieces
        const confettiGeometry = new THREE.PlaneGeometry(0.1, 0.1);
        
        for (let i = 0; i < confettiCount; i++) {
            // Use all rainbow colors from theme
            const confettiColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const confettiMaterial = new THREE.MeshLambertMaterial({
                color: confettiColor,
                side: THREE.DoubleSide
            });
            
            const confetti = new THREE.Mesh(confettiGeometry, confettiMaterial);
            
            // Position randomly in the air
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            const height = 1 + Math.random() * 8;
            
            confetti.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Random rotation
            confetti.rotation.x = Math.random() * Math.PI * 2;
            confetti.rotation.y = Math.random() * Math.PI * 2;
            confetti.rotation.z = Math.random() * Math.PI * 2;
            
            // Add animation data
            confetti.userData = {
                fallSpeed: 0.004 + Math.random() * 0.008,
                spinSpeed: 0.05 + Math.random() * 0.1,
                driftSpeed: 0.01 + Math.random() * 0.02,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                spinAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize()
            };
            
            group.add(confetti);
        }
    },
    
    // Helper to create a circular texture
    createCircleTexture: function(color, size = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw circle
        const radius = size / 2;
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        
        // Fill with gradient
        const gradient = ctx.createRadialGradient(
            radius, radius, 0,
            radius, radius, radius
        );
        
        // Convert hex color to rgb
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        
        gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    },
    
    // Helper to create a star-shaped texture
    createStarTexture: function(color, size = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Convert hex color to rgb
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        
        // Draw star shape
        const centerX = size / 2;
        const centerY = size / 2;
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = size / 5;
        
        ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (spikes * 2)) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        
        // Fill with gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, outerRadius
        );
        
        gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
        gradient.addColorStop(0.7, `rgba(${r},${g},${b},0.5)`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
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
        
        // Animate extra butterflies (specific to Sky Blue theme)
        if (this.extraButterflies) {
            this.extraButterflies.children.forEach(butterfly => {
                // Wing flapping animation - faster and more dramatic
                butterfly.userData.wingPhase += 0.3;
                const wingFlapAmount = Math.sin(butterfly.userData.wingPhase) * Math.PI/3;
                
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
                    // New random direction with more dramatic turns
                    butterfly.userData.direction += (Math.random() - 0.5) * Math.PI;
                    butterfly.userData.timeToNextChange = butterfly.userData.changeDirectionTime;
                }
                
                // More pronounced up and down movement
                butterfly.position.y = butterfly.userData.altitude + Math.sin(butterfly.userData.wingPhase * 0.2) * 0.5;
                
                // Keep butterflies within bounds
                const maxDist = 45;
                if (butterfly.position.x > maxDist || butterfly.position.x < -maxDist ||
                    butterfly.position.z > maxDist || butterfly.position.z < -maxDist) {
                    // Turn back toward center
                    butterfly.userData.direction = Math.atan2(-butterfly.position.z, -butterfly.position.x);
                }
            });
        }
        
        // Animate lanterns (specific to Sunset Glow theme)
        if (this.lanterns) {
            this.lanterns.children.forEach(lantern => {
                // Gentle bobbing motion
                lantern.userData.bobPhase += lantern.userData.bobSpeed;
                lantern.position.y = lantern.userData.originalY + Math.sin(lantern.userData.bobPhase) * lantern.userData.bobHeight;
                
                // Slow drifting movement
                lantern.position.x += Math.cos(lantern.userData.driftDirection) * lantern.userData.driftSpeed;
                lantern.position.z += Math.sin(lantern.userData.driftDirection) * lantern.userData.driftSpeed;
                
                // Gentle rotation
                lantern.rotation.y += 0.002;
                
                // Pulsing light
                if (lantern.children.length > 3) { // The point light is the 4th child (index 3)
                    const light = lantern.children[3];
                    if (light.isLight) {
                        light.intensity = lantern.userData.lightIntensity * (0.8 + Math.sin(lantern.userData.bobPhase * 2) * 0.2);
                    }
                }
                
                // Keep within bounds
                const maxDist = 40;
                if (lantern.position.x > maxDist || lantern.position.x < -maxDist ||
                    lantern.position.z > maxDist || lantern.position.z < -maxDist) {
                    // Gradually turn back toward center
                    const targetAngle = Math.atan2(-lantern.position.z, -lantern.position.x);
                    const currentAngle = lantern.userData.driftDirection;
                    // Slowly adjust direction
                    lantern.userData.driftDirection = currentAngle + (targetAngle - currentAngle) * 0.02;
                }
            });
        }
        
        // Animate balloons (specific to Rainbow Celebration theme)
        if (this.balloons) {
            this.balloons.children.forEach(balloon => {
                // Gentle bobbing motion
                balloon.userData.bobPhase += balloon.userData.bobSpeed;
                balloon.position.y = balloon.userData.originalY + Math.sin(balloon.userData.bobPhase) * balloon.userData.bobHeight;
                
                // Slow drifting movement
                balloon.position.x += Math.cos(balloon.userData.driftDirection) * balloon.userData.driftSpeed;
                balloon.position.z += Math.sin(balloon.userData.driftDirection) * balloon.userData.driftSpeed;
                
                // Gentle rotation
                balloon.rotation.y += 0.003;
                
                // Keep within bounds
                const maxDist = 45;
                if (balloon.position.x > maxDist || balloon.position.x < -maxDist ||
                    balloon.position.z > maxDist || balloon.position.z < -maxDist) {
                    // Change direction gradually
                    const targetAngle = Math.atan2(-balloon.position.z, -balloon.position.x);
                    const currentAngle = balloon.userData.driftDirection;
                    // Slowly adjust direction
                    balloon.userData.driftDirection = currentAngle + (targetAngle - currentAngle) * 0.01;
                }
            });
        }
        
        // Animate particle effects
        if (this.particles) {
            // Get the particles that match the current level's particle effect
            const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
            const particleEffect = currentTheme.particleEffect;
            
            this.particles.children.forEach(particle => {
                switch(particleEffect) {
                    case "pollen":
                        // Gentle floating upward and drifting
                        particle.position.y += particle.userData.floatSpeed;
                        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        
                        // Reset position if too high
                        if (particle.position.y > 6) {
                            particle.position.y = 0;
                            // New random position
                            const radius = Math.random() * 50;
                            const angle = Math.random() * Math.PI * 2;
                            particle.position.x = Math.cos(angle) * radius;
                            particle.position.z = Math.sin(angle) * radius;
                        }
                        break;
                        
                    case "leafs":
                        // Falling leaves with spinning
                        particle.position.y -= particle.userData.fallSpeed;
                        
                        // Apply drift
                        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        
                        // Simplified rotation instead of using rotateOnAxis which can cause errors
                        if (particle.userData.spinAxis) {
                            // Use simple rotation instead of rotateOnAxis
                            particle.rotation.x += particle.userData.spinSpeed * 0.5;
                            particle.rotation.y += particle.userData.spinSpeed;
                            particle.rotation.z += particle.userData.spinSpeed * 0.7;
                        }
                        
                        // Reset if too low
                        if (particle.position.y < -0.5) {
                            particle.position.y = particle.userData.originalY;
                            // New random position
                            const radius = Math.random() * 45;
                            const angle = Math.random() * Math.PI * 2;
                            particle.position.x = Math.cos(angle) * radius;
                            particle.position.z = Math.sin(angle) * radius;
                        }
                        break;
                        
                    case "petals":
                        // Gently falling cherry blossom petals
                        particle.position.y -= particle.userData.fallSpeed;
                        
                        // Apply drift in breeze
                        particle.userData.bobPhase += 0.02;
                        const driftFactor = Math.sin(particle.userData.bobPhase) * 0.5 + 0.5;
                        
                        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed * driftFactor;
                        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed * driftFactor;
                        
                        // Gentle spinning
                        particle.rotation.z += particle.userData.spinSpeed * 0.5;
                        
                        // Reset if too low
                        if (particle.position.y < -0.5) {
                            particle.position.y = particle.userData.originalY;
                            // New random position
                            const radius = Math.random() * 45;
                            const angle = Math.random() * Math.PI * 2;
                            particle.position.x = Math.cos(angle) * radius;
                            particle.position.z = Math.sin(angle) * radius;
                            // New random rotation
                            particle.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                            particle.rotation.z = Math.random() * Math.PI * 2;
                        }
                        break;
                        
                    case "bubbles":
                        // Floating bubbles
                        particle.position.y += particle.userData.floatSpeed;
                        
                        // Apply drift
                        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        
                        // Reset if too high or pop bubbles
                        if (particle.position.y > particle.userData.maxHeight || Math.random() < 0.001) {
                            // Either reset or "pop" (disappear and reappear somewhere else)
                            particle.position.y = particle.userData.originalY;
                            // New random position
                            const radius = Math.random() * 40;
                            const angle = Math.random() * Math.PI * 2;
                            particle.position.x = Math.cos(angle) * radius;
                            particle.position.z = Math.sin(angle) * radius;
                        }
                        break;
                        
                    case "chocolateSparkles":
                    case "purpleSparkles":
                    case "greenSparkles":
                        // Pulsing sparkle effect
                        particle.userData.pulsePhase += particle.userData.pulseSpeed;
                        const pulseFactor = 0.7 + Math.sin(particle.userData.pulsePhase) * 0.3;
                        
                        const size = particle.scale.x; // Original scale
                        particle.scale.set(size * pulseFactor, size * pulseFactor, size * pulseFactor);
                        
                        // Drift slowly
                        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        
                        // Slow rising for some sparkles
                        if (Math.random() < 0.01) {
                            particle.position.y += particle.userData.floatSpeed || 0.01;
                            
                            // Reset if too high
                            if (particle.position.y > 5) {
                                particle.position.y = particle.userData.originalY;
                                // New random position
                                const radius = Math.random() * 45;
                                const angle = Math.random() * Math.PI * 2;
                                particle.position.x = Math.cos(angle) * radius;
                                particle.position.z = Math.sin(angle) * radius;
                            }
                        }
                        break;
                        
                    case "goldDust":
                        // Gold dust particles - gentle floating and twinkling
                        particle.userData.pulsePhase += particle.userData.pulseSpeed;
                        const twinkleFactor = 0.6 + Math.sin(particle.userData.pulsePhase) * 0.4;
                        
                        // Scale pulsing for twinkling effect
                        const goldSize = particle.scale.x; // Current scale
                        particle.scale.set(goldSize * twinkleFactor, goldSize * twinkleFactor, goldSize * twinkleFactor);
                        
                        // Very slow rising
                        particle.position.y += particle.userData.floatSpeed;
                        
                        // Gentle drift
                        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        
                        // Reset if too high
                        if (particle.position.y > 8) {
                            particle.position.y = 0;
                            // New random position
                            const radius = Math.random() * 40;
                            const angle = Math.random() * Math.PI * 2;
                            particle.position.x = Math.cos(angle) * radius;
                            particle.position.z = Math.sin(angle) * radius;
                        }
                        break;
                        
                    case "embers":
                        // Floating embers with flickering
                        particle.userData.pulsePhase += particle.userData.pulseSpeed;
                        const flickerFactor = 0.7 + Math.sin(particle.userData.pulsePhase) * 0.3;
                        
                        // Scale and opacity for flickering effect
                        const emberSize = particle.userData.originalSize * flickerFactor;
                        particle.scale.set(emberSize, emberSize, emberSize);
                        particle.material.opacity = 0.4 + Math.sin(particle.userData.pulsePhase * 1.5) * 0.3;
                        
                        // Rising
                        particle.position.y += particle.userData.floatSpeed;
                        
                        // Drift in air currents
                        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        
                        // Fade and reset if too high
                        if (particle.position.y > 10) {
                            particle.material.opacity -= particle.userData.fadeSpeed;
                            
                            if (particle.material.opacity <= 0.1) {
                                particle.position.y = 0.5 + Math.random() * 2;
                                particle.material.opacity = 0.7;
                                // New random position
                                const radius = Math.random() * 40;
                                const angle = Math.random() * Math.PI * 2;
                                particle.position.x = Math.cos(angle) * radius;
                                particle.position.z = Math.sin(angle) * radius;
                            }
                        }
                        break;
                        
                    case "confetti":
                        // Falling confetti with spinning
                        particle.position.y -= particle.userData.fallSpeed;
                        
                        // Apply drift
                        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
                        
                        // Complex spinning on all axes
                        const confettiAxis = particle.userData.spinAxis;
                        particle.rotateOnAxis(confettiAxis, particle.userData.spinSpeed);
                        
                        // Reset if too low
                        if (particle.position.y < -0.5) {
                            particle.position.y = particle.userData.originalY;
                            // New random position
                            const radius = Math.random() * 45;
                            const angle = Math.random() * Math.PI * 2;
                            particle.position.x = Math.cos(angle) * radius;
                            particle.position.z = Math.sin(angle) * radius;
                            // New random rotation
                            particle.rotation.x = Math.random() * Math.PI * 2;
                            particle.rotation.y = Math.random() * Math.PI * 2;
                            particle.rotation.z = Math.random() * Math.PI * 2;
                        }
                        break;
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