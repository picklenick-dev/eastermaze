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
            
            // Use theme-specific ground color - FIX: Properly convert hex value to string
            const groundColor = new THREE.Color(currentTheme.groundColor);
            const groundColorHex = 
                Math.floor(groundColor.r * 255).toString(16).padStart(2, '0') + 
                Math.floor(groundColor.g * 255).toString(16).padStart(2, '0') + 
                Math.floor(groundColor.b * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = `#${groundColorHex}`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add some texture variation - darker shade of the ground color
            const darkerShade = new THREE.Color(currentTheme.groundColor).multiplyScalar(0.9);
            const darkerHex = 
                Math.floor(darkerShade.r * 255).toString(16).padStart(2, '0') + 
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
            const groundMaterial = new THREE.MeshStandardMaterial({ 
                // Use theme-specific ground color if available, or fall back to default
                color: currentTheme.groundColor || CONFIG.colors.ground 
            });
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
        
        // Add butterflies that fly around - but not in snow/ice worlds
        if (!currentTheme.isSnowTheme) {
            this.addButterflies(currentTheme);
        }
        
        // Add level-specific decorations
        if (currentTheme.uniqueDecoration) {
            this.addUniqueDecorations(currentTheme);
        }
        
        // Add theme-specific particle effects
        if (currentTheme.particleEffect) {
            this.addParticleEffects(currentTheme);
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
            case "snowflakes":
                this.addSnowflakeDecorations(decorationGroup, theme);
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
            case "icicles":
                this.addIcicleDecorations(decorationGroup, theme);
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
    
    // Implement the missing addExtraButterflies function for Level 4
    addExtraButterflies: function(group, theme) {
        // Create additional butterflies for the butterfly-themed level
        const butterflyCount = 15; // More butterflies than the standard decoration
        
        const createButterfly = () => {
            // Butterfly body
            const bodyGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
                color: theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)]
            });
            
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            
            // Wings - use a simple plane geometry
            const wingGeometry = new THREE.PlaneGeometry(0.5, 0.3);
            const wingMaterial = new THREE.MeshLambertMaterial({ 
                color: theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.25, 0, 0);
            leftWing.rotation.y = Math.PI / 4;
            
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.25, 0, 0);
            rightWing.rotation.y = -Math.PI / 4;
            
            // Create butterfly group
            const butterfly = new THREE.Group();
            butterfly.add(body);
            butterfly.add(leftWing);
            butterfly.add(rightWing);
            
            // Add random animation variables
            butterfly.userData = {
                flapSpeed: 0.05 + Math.random() * 0.1,
                flapPhase: Math.random() * Math.PI * 2,
                altitude: 1 + Math.random() * 5, // Flying height
                hoverSpeed: 0.01 + Math.random() * 0.02,
                hoverPhase: Math.random() * Math.PI * 2,
                direction: Math.random() * Math.PI * 2, // Random flight direction
                speed: 0.01 + Math.random() * 0.03, // Flight speed
                turnSpeed: 0.005 + Math.random() * 0.01,
                timeToNextChange: Math.random() * 200
            };
            
            return butterfly;
        };
        
        // Create specified number of butterflies
        for (let i = 0; i < butterflyCount; i++) {
            const butterfly = createButterfly();
            
            // Position butterflies widely around the scene
            butterfly.position.set(
                (Math.random() - 0.5) * 60, // Wider spread
                butterfly.userData.altitude,
                (Math.random() - 0.5) * 60  // Wider spread
            );
            
            group.add(butterfly);
        }
        
        // Store reference to animate these butterflies
        this.extraButterflies = group;
    },

    addCherryBlossomDecorations: function(group, theme) {
        // Create cherry blossom trees
        const treeCount = 8;
        const treeRadius = 45;
        
        // Create cherry blossom trees around the maze
        for (let i = 0; i < treeCount; i++) {
            const angle = (i / treeCount) * Math.PI * 2;
            const x = Math.cos(angle) * treeRadius;
            const z = Math.sin(angle) * treeRadius;
            
            // Create tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 5, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(0, 2.5, 0);
            trunk.castShadow = true;
            
            // Create tree foliage (pink cherry blossoms)
            const foliageGeometry = new THREE.SphereGeometry(2.5, 8, 8);
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB7C5 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(0, 3, 0);
            foliage.castShadow = true;
            
            // Group the trunk and foliage together
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(foliage);
            tree.position.set(x, 0, z);
            
            // Add animation properties
            tree.userData = {
                swayPhase: Math.random() * Math.PI * 2,
                swaySpeed: 0.01 + Math.random() * 0.01,
                swayAmount: 0.05 + Math.random() * 0.05
            };
            
            group.add(tree);
        }
        
        // Add falling cherry blossom petals
        const petalCount = 100;
        
        // Create a canvas for petal texture if not provided
        const textureSize = 64;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Draw a simple petal shape
        ctx.fillStyle = '#FFDBED';
        ctx.beginPath();
        ctx.arc(textureSize/2, textureSize/2, textureSize/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFB7C5';
        ctx.beginPath();
        ctx.arc(textureSize/2, textureSize/2, textureSize/6, 0, Math.PI * 2);
        ctx.fill();
        
        const petalTexture = new THREE.CanvasTexture(canvas);
        
        // Create individual falling petals
        for (let i = 0; i < petalCount; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: petalTexture,
                transparent: true,
                opacity: 0.8
            });
            
            const petal = new THREE.Sprite(spriteMaterial);
            
            // Randomize size
            const scale = 0.2 + Math.random() * 0.3;
            petal.scale.set(scale, scale, scale);
            
            // Random positioning within a radius
            const radius = Math.random() * 50;
            const angle = Math.random() * Math.PI * 2;
            const height = 5 + Math.random() * 20;
            
            petal.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Add animation properties
            petal.userData = {
                fallSpeed: 0.01 + Math.random() * 0.05,
                driftSpeed: 0.01 + Math.random() * 0.02,
                driftDirection: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.03 + Math.random() * 0.05,
                wobbleAmount: 0.1 + Math.random() * 0.5,
                wobblePhase: Math.random() * Math.PI * 2,
                originalY: height
            };
            
            group.add(petal);
        }
    },

    // Add flower decorations for the first level's Spring Garden theme
    addFlowerDecorations: function(group, theme) {
        const flowerCount = 40;
        
        for (let i = 0; i < flowerCount; i++) {
            const flower = new THREE.Group();
            
            // Create flower center
            const centerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFF44F }); // Yellow center
            const flowerCenter = new THREE.Mesh(centerGeometry, centerMaterial);
            flower.add(flowerCenter);
            
            // Create petals
            const petalCount = 5 + Math.floor(Math.random() * 3); // 5-7 petals
            
            // Use theme decoration colors for petals
            const petalColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            const petalMaterial = new THREE.MeshLambertMaterial({ color: petalColor });
            
            for (let p = 0; p < petalCount; p++) {
                const petalGeometry = new THREE.CircleGeometry(0.2, 8);
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                
                const angle = (p / petalCount) * Math.PI * 2;
                const distance = 0.2;
                
                petal.position.set(
                    Math.cos(angle) * distance,
                    0,
                    Math.sin(angle) * distance
                );
                
                petal.rotation.x = -Math.PI / 2;
                petal.rotation.y = angle;
                
                flower.add(petal);
            }
            
            // Add stem
            const stemHeight = 0.5 + Math.random() * 0.5;
            const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, stemHeight, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x2D9F30 }); // Green stem
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = -stemHeight / 2;
            flower.add(stem);
            
            // Position flower randomly
            const radius = 5 + Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            
            flower.position.set(
                Math.cos(angle) * radius,
                0, // At ground level
                Math.sin(angle) * radius
            );
            
            // Random rotation
            flower.rotation.y = Math.random() * Math.PI * 2;
            
            // Add subtle animation data
            flower.userData = {
                swayPhase: Math.random() * Math.PI * 2,
                swaySpeed: 0.01 + Math.random() * 0.02,
                swayAmount: 0.05 + Math.random() * 0.1
            };
            
            group.add(flower);
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
        
        // Get current level theme based on updated CONFIG.currentLevel
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Update background color to match the current level theme
        CONFIG.scene.background = new THREE.Color(currentTheme.skyColor || CONFIG.colors.sky);
        
        // Update fog if enhanced graphics is enabled
        if (CONFIG.enhancedGraphics) {
            CONFIG.scene.fog = new THREE.FogExp2(currentTheme.fogColor || 0xC2E7FF, currentTheme.fogDensity || 0.03);
        }
        
        // Gjenopprett grunnleggende elementer
        this.setupLights();
        this.createGround();
        
        // Recreate decorations if enhanced graphics is enabled
        if (CONFIG.enhancedGraphics) {
            this.addEasterDecorations();
        }
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
        
        // Animate unique decorations based on theme type
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        if (this.uniqueDecorations && currentTheme.uniqueDecoration) {
            // Handle specific animations for different decoration types
            switch(currentTheme.uniqueDecoration) {
                case "snowflakes":
                    // Animate floating snowflakes
                    this.uniqueDecorations.children.forEach(snowflake => {
                        // Gentle rotation
                        snowflake.rotation.y += snowflake.userData.rotateSpeed;
                        
                        // Bobbing motion
                        snowflake.userData.bobPhase += snowflake.userData.bobSpeed;
                        snowflake.position.y = snowflake.userData.originalY + Math.sin(snowflake.userData.bobPhase) * 0.1;
                        
                        // Gentle drift
                        snowflake.position.x += Math.cos(snowflake.userData.driftDirection) * snowflake.userData.driftSpeed;
                        snowflake.position.z += Math.sin(snowflake.userData.driftDirection) * snowflake.userData.driftSpeed;
                        
                        // Keep within bounds
                        const maxDist = 45;
                        if (snowflake.position.x > maxDist || snowflake.position.x < -maxDist ||
                            snowflake.position.z > maxDist || snowflake.position.z < -maxDist) {
                            // Change direction toward center
                            const targetAngle = Math.atan2(-snowflake.position.z, -snowflake.position.x);
                            const currentAngle = snowflake.userData.driftDirection;
                            snowflake.userData.driftDirection = currentAngle + (targetAngle - currentAngle) * 0.05;
                        }
                    });
                    break;
                    
                case "icicles":
                    // Animate icicles and ice crystals
                    this.uniqueDecorations.children.forEach(icicle => {
                        // Check if it's an ice crystal formation (has multiple children)
                        if (icicle.children.length > 1) {
                            // This is an ice crystal formation
                            // Gentle pulsing/glinting effect
                            icicle.userData.glintPhase += icicle.userData.glintSpeed;
                            
                            // Apply subtle pulse to crystal formation
                            const pulseFactor = 1 + Math.sin(icicle.userData.glintPhase) * icicle.userData.pulseAmount;
                            icicle.scale.set(
                                icicle.scale.x * (1 + (pulseFactor - 1) * 0.1),
                                icicle.scale.y * (1 + (pulseFactor - 1) * 0.1),
                                icicle.scale.z * (1 + (pulseFactor - 1) * 0.1)
                            );
                            
                            // Normalize scale to prevent continuous growth
                            const normalFactor = 1 / (1 + (pulseFactor - 1) * 0.1);
                            icicle.scale.multiplyScalar(normalFactor);
                        } else {
                            // This is a hanging icicle
                            // Simulate dripping/growing effect
                            icicle.userData.drippingPhase += icicle.userData.drippingSpeed;
                            
                            // Subtle stretching effect
                            const stretchFactor = 1 + Math.sin(icicle.userData.drippingPhase) * icicle.userData.growShrinkAmount;
                            if (icicle.children[0]) {
                                icicle.children[0].scale.y = stretchFactor;
                                
                                // Occasionally simulate a drip
                                if (Math.random() < 0.001) {
                                    // Reset phase for next drip
                                    icicle.userData.drippingPhase = 0;
                                }
                            }
                        }
                    });
                    break;
            }
        }

        // Handle falling petals
        if (this.uniqueDecorations) {
            this.uniqueDecorations.children.forEach(element => {
                if (element.userData.fallSpeed) {
                    // Move petal downward
                    element.position.y -= element.userData.fallSpeed;
                    
                    // If fallen below the ground, reset its position
                    if (element.position.y < -0.5) {
                        // Reset to original height
                        element.position.y = element.userData.originalY || 5 + Math.random() * 20;
                        
                        // New random horizontal position
                        const radius = Math.random() * 50;
                        const angle = Math.random() * Math.PI * 2;
                        element.position.x = Math.cos(angle) * radius;
                        element.position.z = Math.sin(angle) * radius;
                    }
                }
            });
        }
    },
    
    // Add snowflake particles for winter-themed levels
    addSnowflakeParticles: function(group, theme) {
        const snowflakeCount = 100;
        const fallSpeedMax = theme.particleEffect === "blizzard" ? 0.08 : 0.04;
        
        // Create a simple snowflake texture
        const textureSize = 32;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        // Draw snowflake
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(textureSize/2, textureSize/2, textureSize/4, 0, Math.PI * 2);
        ctx.fill();
        
        const snowflakeTexture = new THREE.CanvasTexture(canvas);
        
        // Create individual snowflakes
        for (let i = 0; i < snowflakeCount; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: snowflakeTexture,
                transparent: true,
                opacity: 0.8
            });
            
            const snowflake = new THREE.Sprite(spriteMaterial);
            
            // Small size for snowflakes
            const scale = 0.1 + Math.random() * 0.15;
            snowflake.scale.set(scale, scale, scale);
            
            // Random positioning
            const radius = Math.random() * 60;
            const angle = Math.random() * Math.PI * 2;
            const height = 5 + Math.random() * 15;
            
            snowflake.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Add animation properties
            snowflake.userData = {
                fallSpeed: (0.01 + Math.random() * fallSpeedMax),
                driftSpeed: 0.01 + Math.random() * 0.03,
                driftDirection: theme.particleEffect === "blizzard" ? Math.PI * 0.25 : Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.03,
                wobbleAmount: 0.1 + Math.random() * 0.5,
                wobblePhase: Math.random() * Math.PI * 2,
                originalY: height
            };
            
            group.add(snowflake);
        }
    }
};