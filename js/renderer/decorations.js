// Decorative elements system for the game
import { CONFIG } from '../config.js';
import { TextureUtils } from './texture-utils.js';

export const DecorationSystem = {
    // Initialize decorations
    init: function() {
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Add clouds to the sky
        this.addClouds();
        
        // Add butterflies that fly around
        this.addButterflies(currentTheme);
        
        // Add level-specific decorations
        if (currentTheme.uniqueDecoration) {
            this.addUniqueDecorations(currentTheme);
        }
    },
    
    // Animate all decorations
    animate: function() {
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
        
        // Animate unique decorations based on level
        if (this.uniqueDecorations) {
            const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
            
            // Handle special animation for specific decoration types
            switch(currentTheme.uniqueDecoration) {
                case "lanterns":
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
                    break;
                    
                case "balloons":
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
                    break;
                    
                // Add more special cases for other decoration types if needed
                default:
                    // No special animation for other decoration types
                    break;
            }
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
            case "snowmen":
                this.addSnowmenDecorations(decorationGroup, theme);
                break;
            case "iceSculptures":
                this.addIceSculpturesDecorations(decorationGroup, theme);
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
    
    // Add a circle of mushrooms (fairy ring) as a special feature
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
    
    // Add snowmen decorations for Winter Wonderland (level 2)
    addSnowmenDecorations: function(group, theme) {
        const snowmanCount = 15;
        
        for (let i = 0; i < snowmanCount; i++) {
            const snowman = new THREE.Group();
            
            // Create bottom snowball (largest)
            const bottomGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const snowMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFFFFF,
                emissive: 0x555555,
                emissiveIntensity: 0.1
            });
            const bottomBall = new THREE.Mesh(bottomGeometry, snowMaterial);
            bottomBall.position.y = 0.4;
            snowman.add(bottomBall);
            
            // Create middle snowball
            const middleGeometry = new THREE.SphereGeometry(0.35, 16, 16);
            const middleBall = new THREE.Mesh(middleGeometry, snowMaterial);
            middleBall.position.y = 1.0;
            snowman.add(middleBall);
            
            // Create head (smallest snowball)
            const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const headBall = new THREE.Mesh(headGeometry, snowMaterial);
            headBall.position.y = 1.45;
            snowman.add(headBall);
            
            // Create carrot nose
            const noseGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
            const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFF7700 });
            const nose = new THREE.Mesh(noseGeometry, noseMaterial);
            nose.position.set(0, 1.45, 0.25);
            nose.rotation.x = Math.PI / 2;
            snowman.add(nose);
            
            // Create eyes
            const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.08, 1.5, 0.2);
            snowman.add(leftEye);
            
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.08, 1.5, 0.2);
            snowman.add(rightEye);
            
            // Create buttons
            const buttonGeometry = new THREE.SphereGeometry(0.03, 8, 8);
            const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
            
            for (let b = 0; b < 3; b++) {
                const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
                button.position.set(0, 0.95 + b * 0.12, 0.35);
                snowman.add(button);
            }
            
            // Optional scarf for some snowmen
            if (Math.random() > 0.5) {
                const scarfColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
                const scarfGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.4);
                const scarfMaterial = new THREE.MeshLambertMaterial({ 
                    color: scarfColor,
                    emissive: new THREE.Color(scarfColor).multiplyScalar(0.2)
                });
                const scarf = new THREE.Mesh(scarfGeometry, scarfMaterial);
                scarf.position.set(0, 1.2, 0);
                snowman.add(scarf);
                
                // Add hanging part of scarf
                const scarfHangGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
                const scarfHang = new THREE.Mesh(scarfHangGeometry, scarfMaterial);
                scarfHang.position.set(0.25, 1.05, 0.15);
                snowman.add(scarfHang);
            }
            
            // Add stick arms
            const armGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
            const armMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.6, 1.0, 0);
            leftArm.rotation.z = Math.PI / 4;
            snowman.add(leftArm);
            
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.6, 1.0, 0);
            rightArm.rotation.z = -Math.PI / 4;
            snowman.add(rightArm);
            
            // Position snowman randomly in scene
            const radius = 8 + Math.random() * 35;
            const angle = Math.random() * Math.PI * 2;
            snowman.position.set(
                Math.cos(angle) * radius,
                -0.5, // Partially in the snow
                Math.sin(angle) * radius
            );
            
            // Random rotation and slight scale variation
            snowman.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.7 + Math.random() * 0.6;
            snowman.scale.set(scale, scale, scale);
            
            group.add(snowman);
        }
        
        // Add a special easter-themed snowman as a centerpiece
        this.addEasterSnowman(group, theme);
    },
    
    // Add a special Easter-themed snowman
    addEasterSnowman: function(group, theme) {
        const snowman = new THREE.Group();
        
        // Same basic snowman structure
        const bottomGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const snowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            emissive: 0x555555,
            emissiveIntensity: 0.1
        });
        const bottomBall = new THREE.Mesh(bottomGeometry, snowMaterial);
        bottomBall.position.y = 0.5;
        snowman.add(bottomBall);
        
        const middleGeometry = new THREE.SphereGeometry(0.45, 16, 16);
        const middleBall = new THREE.Mesh(middleGeometry, snowMaterial);
        middleBall.position.y = 1.2;
        snowman.add(middleBall);
        
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headBall = new THREE.Mesh(headGeometry, snowMaterial);
        headBall.position.y = 1.8;
        snowman.add(headBall);
        
        // Carrot nose
        const noseGeometry = new THREE.ConeGeometry(0.06, 0.25, 8);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFF7700 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.8, 0.3);
        nose.rotation.x = Math.PI / 2;
        snowman.add(nose);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.85, 0.25);
        snowman.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.85, 0.25);
        snowman.add(rightEye);
        
        // Easter basket
        const basketGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.3, 16);
        const basketMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const basket = new THREE.Mesh(basketGeometry, basketMaterial);
        basket.position.set(0.4, 1.2, 0);
        snowman.add(basket);
        
        // Easter eggs in basket
        const eggColors = [0xFF5555, 0x55FF55, 0x5555FF, 0xFFFF55, 0xFF55FF];
        for (let i = 0; i < 5; i++) {
            const eggGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            eggGeometry.scale(1, 1.3, 1); // Make egg-shaped
            const eggMaterial = new THREE.MeshLambertMaterial({ 
                color: eggColors[i],
                emissive: eggColors[i],
                emissiveIntensity: 0.2
            });
            const egg = new THREE.Mesh(eggGeometry, eggMaterial);
            
            // Position eggs randomly in basket
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.15;
            egg.position.set(
                0.4 + Math.cos(angle) * r,
                1.3 + Math.random() * 0.1,
                Math.sin(angle) * r
            );
            egg.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            snowman.add(egg);
        }
        
        // Bunny ears (Easter themed element)
        const earGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
        earGeometry.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 0.5));
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDDDD });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.15, 2.2, 0);
        leftEar.rotation.z = -Math.PI / 12;
        snowman.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.15, 2.2, 0);
        rightEar.rotation.z = Math.PI / 12;
        snowman.add(rightEar);
        
        // Position special snowman near center
        snowman.position.set(
            (Math.random() - 0.5) * 15,
            -0.6,
            (Math.random() - 0.5) * 15
        );
        
        // Set rotation and scale
        snowman.rotation.y = Math.random() * Math.PI * 2;
        snowman.scale.set(1.2, 1.2, 1.2);
        
        group.add(snowman);
    },
    
    // Add ice sculptures for Frosty Easter (level 5)
    addIceSculpturesDecorations: function(group, theme) {
        const sculptureCount = 12;
        
        // Create Easter-themed ice sculptures
        for (let i = 0; i < sculptureCount; i++) {
            const sculpture = new THREE.Group();
            
            // Choose which type of sculpture to create
            const sculptureType = Math.floor(Math.random() * 3);
            
            // Ice material with slight blue tint and transparency
            const iceMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xDDEEFF,
                transparent: true,
                opacity: 0.7,
                roughness: 0.1,
                transmission: 0.5,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1
            });
            
            switch (sculptureType) {
                case 0: // Easter Bunny sculpture
                    // Body
                    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                    bodyGeometry.scale(1, 1.2, 0.8);
                    const body = new THREE.Mesh(bodyGeometry, iceMaterial);
                    body.position.y = 0.5;
                    sculpture.add(body);
                    
                    // Head
                    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
                    const head = new THREE.Mesh(headGeometry, iceMaterial);
                    head.position.set(0, 1.2, 0.2);
                    sculpture.add(head);
                    
                    // Ears
                    const earGeometry = new THREE.CylinderGeometry(0.06, 0.04, 0.8, 8);
                    earGeometry.applyMatrix4(new THREE.Matrix4().makeScale(0.5, 1, 0.3));
                    
                    const leftEar = new THREE.Mesh(earGeometry, iceMaterial);
                    leftEar.position.set(-0.15, 1.7, 0.1);
                    leftEar.rotation.set(-Math.PI/10, 0, -Math.PI/10);
                    sculpture.add(leftEar);
                    
                    const rightEar = new THREE.Mesh(earGeometry, iceMaterial);
                    rightEar.position.set(0.15, 1.7, 0.1);
                    rightEar.rotation.set(-Math.PI/10, 0, Math.PI/10);
                    sculpture.add(rightEar);
                    break;
                    
                case 1: // Easter Egg sculpture
                    const eggGeometry = new THREE.SphereGeometry(0.7, 16, 16);
                    eggGeometry.scale(1, 1.3, 1);
                    const egg = new THREE.Mesh(eggGeometry, iceMaterial);
                    egg.position.y = 0.7;
                    
                    // Add decorative patterns
                    const patternGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 20);
                    const patternMaterial = new THREE.MeshPhysicalMaterial({
                        color: theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)],
                        transparent: true,
                        opacity: 0.8,
                        roughness: 0.2
                    });
                    
                    const pattern1 = new THREE.Mesh(patternGeometry, patternMaterial);
                    pattern1.position.y = 0.7;
                    pattern1.rotation.x = Math.PI/2;
                    sculpture.add(pattern1);
                    
                    const pattern2 = new THREE.Mesh(patternGeometry, patternMaterial);
                    pattern2.position.y = 0.7;
                    pattern2.rotation.x = Math.PI/4;
                    pattern2.rotation.z = Math.PI/4;
                    pattern2.scale.set(0.8, 0.8, 0.8);
                    sculpture.add(pattern2);
                    
                    sculpture.add(egg);
                    break;
                    
                case 2: // Easter Basket sculpture
                    // Basket
                    const basketGeometry = new THREE.CylinderGeometry(0.6, 0.5, 0.7, 16);
                    const basketRimGeometry = new THREE.TorusGeometry(0.6, 0.1, 8, 24);
                    
                    const basket = new THREE.Mesh(basketGeometry, iceMaterial);
                    basket.position.y = 0.4;
                    sculpture.add(basket);
                    
                    const basketRim = new THREE.Mesh(basketRimGeometry, iceMaterial);
                    basketRim.position.y = 0.75;
                    basketRim.rotation.x = Math.PI/2;
                    sculpture.add(basketRim);
                    
                    // Handle
                    const handleGeometry = new THREE.TorusGeometry(0.4, 0.08, 8, 12, Math.PI);
                    const handle = new THREE.Mesh(handleGeometry, iceMaterial);
                    handle.position.y = 1.1;
                    handle.rotation.x = -Math.PI/2;
                    sculpture.add(handle);
                    
                    // Small Easter eggs in basket
                    for (let j = 0; j < 6; j++) {
                        const smallEggGeometry = new THREE.SphereGeometry(0.15, 8, 8);
                        smallEggGeometry.scale(1, 1.3, 1);
                        const smallEgg = new THREE.Mesh(smallEggGeometry, iceMaterial);
                        
                        // Position eggs randomly in basket
                        const angle = Math.random() * Math.PI * 2;
                        const r = Math.random() * 0.3;
                        smallEgg.position.set(
                            Math.cos(angle) * r,
                            0.6 + Math.random() * 0.2,
                            Math.sin(angle) * r
                        );
                        smallEgg.rotation.set(
                            Math.random() * Math.PI,
                            Math.random() * Math.PI,
                            Math.random() * Math.PI
                        );
                        sculpture.add(smallEgg);
                    }
                    break;
            }
            
            // Add a base for the sculpture
            const baseGeometry = new THREE.CylinderGeometry(0.8, 1.0, 0.2, 16);
            const base = new THREE.Mesh(baseGeometry, iceMaterial);
            base.position.y = -0.1;
            sculpture.add(base);
            
            // Position sculptures around scene
            const radius = 10 + Math.random() * 30;
            const angle = Math.random() * Math.PI * 2;
            sculpture.position.set(
                Math.cos(angle) * radius,
                -0.5,
                Math.sin(angle) * radius
            );
            
            // Random rotation and scale
            sculpture.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.8 + Math.random() * 0.6;
            sculpture.scale.set(scale, scale, scale);
            
            group.add(sculpture);
        }
        
        // Add a central larger ice sculpture display
        this.addCentralIceSculptureDisplay(group, theme);
    },
    
    // Add a central ice sculpture display with multiple elements
    addCentralIceSculptureDisplay: function(group, theme) {
        const display = new THREE.Group();
        
        // Large circular base
        const baseGeometry = new THREE.CylinderGeometry(5, 5.5, 0.3, 24);
        const iceMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xDDEEFF,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            transmission: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const base = new THREE.Mesh(baseGeometry, iceMaterial);
        base.position.y = -0.5;
        display.add(base);
        
        // Central large Easter egg sculpture
        const eggGeometry = new THREE.SphereGeometry(1.5, 24, 24);
        eggGeometry.scale(1, 1.4, 1);
        const egg = new THREE.Mesh(eggGeometry, iceMaterial);
        egg.position.y = 1.5;
        display.add(egg);
        
        // Add decorative spirals
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spiralMaterial = new THREE.MeshPhysicalMaterial({
                color: theme.decorationColors[i % theme.decorationColors.length],
                transparent: true,
                opacity: 0.8,
                roughness: 0.2
            });
            
            for (let j = 0; j < 20; j++) {
                const segmentGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                const segment = new THREE.Mesh(segmentGeometry, spiralMaterial);
                
                const spiralRadius = 1.0 - j * 0.03;
                const heightProgress = j / 20;
                const spiralAngle = angle + heightProgress * Math.PI * 4;
                
                segment.position.set(
                    Math.cos(spiralAngle) * spiralRadius,
                    0.5 + heightProgress * 2.5,
                    Math.sin(spiralAngle) * spiralRadius
                );
                display.add(segment);
            }
        }
        
        // Add small bunny sculptures around the base
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const bunnyGroup = new THREE.Group();
            
            // Body
            const bodyGeometry = new THREE.SphereGeometry(0.3, 12, 12);
            bodyGeometry.scale(1, 1.2, 0.8);
            const body = new THREE.Mesh(bodyGeometry, iceMaterial);
            body.position.y = 0.3;
            bunnyGroup.add(body);
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.2, 12, 12);
            const head = new THREE.Mesh(headGeometry, iceMaterial);
            head.position.set(0, 0.6, 0.1);
            bunnyGroup.add(head);
            
            // Ears
            const earGeometry = new THREE.CylinderGeometry(0.03, 0.02, 0.4, 6);
            
            const leftEar = new THREE.Mesh(earGeometry, iceMaterial);
            leftEar.position.set(-0.08, 0.9, 0);
            leftEar.rotation.z = -Math.PI/12;
            bunnyGroup.add(leftEar);
            
            const rightEar = new THREE.Mesh(earGeometry, iceMaterial);
            rightEar.position.set(0.08, 0.9, 0);
            rightEar.rotation.z = Math.PI/12;
            bunnyGroup.add(rightEar);
            
            // Position bunny around the base
            bunnyGroup.position.set(
                Math.cos(angle) * 3.5,
                -0.25,
                Math.sin(angle) * 3.5
            );
            
            // Face toward center
            bunnyGroup.rotation.y = angle + Math.PI;
            
            display.add(bunnyGroup);
        }
        
        // Position the display near center but slightly offset
        display.position.set(
            (Math.random() - 0.5) * 10,
            0,
            (Math.random() - 0.5) * 10
        );
        
        // Random rotation
        display.rotation.y = Math.random() * Math.PI * 2;
        
        group.add(display);
    },
};