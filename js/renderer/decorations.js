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
    
    // Add cherry blossom decorations for Cherry Blossom Garden (level 3)
    addCherryBlossomDecorations: function(group, theme) {
        // Add cherry blossom trees
        const treeCount = 10;
        
        for (let i = 0; i < treeCount; i++) {
            const tree = new THREE.Group();
            
            // Create trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;
            tree.add(trunk);
            
            // Create branches
            const branchCount = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < branchCount; j++) {
                const branchGeometry = new THREE.CylinderGeometry(0.08, 0.12, 1.5, 5);
                const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
                
                // Position branch on trunk
                const height = 0.8 + j * 0.5;
                const angle = (j / branchCount) * Math.PI * 2;
                branch.position.set(
                    Math.cos(angle) * 0.5,
                    height,
                    Math.sin(angle) * 0.5
                );
                
                // Rotate branch outward
                branch.rotation.z = Math.PI / 2 - angle;
                branch.rotation.y = Math.PI / 2;
                
                tree.add(branch);
            }
            
            // Create cherry blossoms using theme colors
            const blossomColors = [0xFFD7E9, 0xFFB7D5, 0xFFA6C9];
            const blossomCount = 100 + Math.floor(Math.random() * 100);
            
            // Create a particle system for the blossoms
            const blossomGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            
            for (let j = 0; j < blossomCount; j++) {
                const blossomMaterial = new THREE.MeshLambertMaterial({ 
                    color: blossomColors[Math.floor(Math.random() * blossomColors.length)],
                    emissive: 0xFFD7E9,
                    emissiveIntensity: 0.2
                });
                const blossom = new THREE.Mesh(blossomGeometry, blossomMaterial);
                
                // Distribute blossoms around the tree
                const radius = 1.2 + Math.random() * 0.8;
                const angle = Math.random() * Math.PI * 2;
                const height = 1 + Math.random() * 2.5;
                
                blossom.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                
                // Random scale for each blossom
                const scale = 0.1 + Math.random() * 0.15;
                blossom.scale.set(scale, scale, scale);
                
                // Add animation data
                blossom.userData = {
                    fallSpeed: 0.005 + Math.random() * 0.01,
                    swayAmount: 0.01 + Math.random() * 0.02,
                    swaySpeed: 0.01 + Math.random() * 0.02,
                    swayPhase: Math.random() * Math.PI * 2,
                    originalY: height,
                    originalX: blossom.position.x,
                    originalZ: blossom.position.z
                };
                
                tree.add(blossom);
            }
            
            // Position tree randomly in the scene
            const radius = 10 + Math.random() * 30;
            const angle = Math.random() * Math.PI * 2;
            tree.position.set(
                Math.cos(angle) * radius,
                -0.5, // Slightly into the ground
                Math.sin(angle) * radius
            );
            
            // Random rotation and scale
            tree.rotation.y = Math.random() * Math.PI * 2;
            const treeScale = 0.8 + Math.random() * 0.6;
            tree.scale.set(treeScale, treeScale, treeScale);
            
            group.add(tree);
        }
        
        // Add fallen blossoms on the ground
        this.addFallenBlossoms(group, theme);
    },
    
    // Add fallen cherry blossoms on the ground
    addFallenBlossoms: function(group, theme) {
        const fallenBlossomCount = 200;
        const blossomGeometry = new THREE.CircleGeometry(0.2, 5);
        const blossomColors = [0xFFD7E9, 0xFFB7D5, 0xFFA6C9];
        
        for (let i = 0; i < fallenBlossomCount; i++) {
            const blossomMaterial = new THREE.MeshBasicMaterial({
                color: blossomColors[Math.floor(Math.random() * blossomColors.length)],
                side: THREE.DoubleSide
            });
            const blossom = new THREE.Mesh(blossomGeometry, blossomMaterial);
            
            // Position on ground in a wide area
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            blossom.position.set(
                Math.cos(angle) * radius,
                0.01, // Just above ground
                Math.sin(angle) * radius
            );
            
            // Rotate to lay flat on ground
            blossom.rotation.x = -Math.PI / 2;
            blossom.rotation.z = Math.random() * Math.PI * 2;
            
            // Vary scale slightly
            const scale = 0.3 + Math.random() * 0.3;
            blossom.scale.set(scale, scale, scale);
            
            group.add(blossom);
        }
    },
    
    // Add extra butterflies decoration for Butterfly Meadow (level 4)
    addExtraButterflies: function(group, theme) {
        const butterflyCount = 30; // More butterflies than the standard set
        
        // Create a butterfly geometry with more elaborate details
        const createFancyButterfly = () => {
            const butterfly = new THREE.Group();
            
            // Create colorful butterfly wings with more detail
            const wingColors = theme.decorationColors;
            const primaryColor = wingColors[Math.floor(Math.random() * wingColors.length)];
            
            // Create wings with more detailed geometry
            const wingGeometry = new THREE.CircleGeometry(0.6, 12);
            
            const wingMaterial = new THREE.MeshLambertMaterial({
                color: primaryColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            
            // Add left wing with more complex shape
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.3, 0, 0);
            leftWing.scale.set(0.7, 1.2, 1);
            leftWing.rotation.z = -Math.PI / 6;
            butterfly.add(leftWing);
            
            // Add right wing with more complex shape
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.3, 0, 0);
            rightWing.scale.set(0.7, 1.2, 1);
            rightWing.rotation.z = Math.PI / 6;
            butterfly.add(rightWing);
            
            // Add wing patterns/spots for more detail
            const addWingPatterns = (wing, isLeft) => {
                const patternCount = 3 + Math.floor(Math.random() * 3);
                const patternGeometry = new THREE.CircleGeometry(0.1, 8);
                
                for (let i = 0; i < patternCount; i++) {
                    // Get a contrasting color for the patterns
                    const patternColor = wingColors[
                        (wingColors.indexOf(primaryColor) + 1 + Math.floor(Math.random() * (wingColors.length - 1))) % wingColors.length
                    ];
                    
                    const patternMaterial = new THREE.MeshBasicMaterial({
                        color: patternColor,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.9
                    });
                    
                    const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
                    
                    // Position pattern on wing
                    const angle = Math.random() * Math.PI / 2;
                    const distance = 0.2 + Math.random() * 0.3;
                    pattern.position.set(
                        isLeft ? -distance : distance,
                        Math.sin(angle) * 0.3,
                        Math.cos(angle) * 0.1
                    );
                    
                    // Vary the size
                    const scale = 0.3 + Math.random() * 0.7;
                    pattern.scale.set(scale, scale, scale);
                    
                    butterfly.add(pattern);
                }
            };
            
            // Add patterns to both wings
            addWingPatterns(leftWing, true);
            addWingPatterns(rightWing, false);
            
            // Add body
            const bodyGeometry = new THREE.CylinderGeometry(0.04, 0.07, 0.5, 8);
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x000000
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.rotation.x = Math.PI / 2;
            butterfly.add(body);
            
            // Add antennae
            const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.005, 0.3, 4);
            const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            
            const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            leftAntenna.position.set(-0.05, 0, 0.2);
            leftAntenna.rotation.x = -Math.PI / 4;
            butterfly.add(leftAntenna);
            
            const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            rightAntenna.position.set(0.05, 0, 0.2);
            rightAntenna.rotation.x = -Math.PI / 4;
            butterfly.add(rightAntenna);
            
            // Add animation data
            butterfly.userData = {
                wingPhase: Math.random() * Math.PI * 2,
                speed: 0.03 + Math.random() * 0.04, // Faster than regular butterflies
                rotationSpeed: 0.02 + Math.random() * 0.02,
                altitude: 1 + Math.random() * 4, // Higher flying
                direction: Math.random() * Math.PI * 2,
                changeDirectionTime: 100 + Math.floor(Math.random() * 150),
                timeToNextChange: Math.floor(Math.random() * 100),
                hoverTime: 0,
                isHovering: false,
                hoverDuration: 100 + Math.floor(Math.random() * 200),
                restTime: 0
            };
            
            return butterfly;
        };
        
        // Create a butterfly swarm formation
        for (let i = 0; i < butterflyCount; i++) {
            const butterfly = createFancyButterfly();
            
            // Position butterflies around the scene with more variety
            butterfly.position.set(
                (Math.random() - 0.5) * 50,
                butterfly.userData.altitude,
                (Math.random() - 0.5) * 50
            );
            
            group.add(butterfly);
        }
        
        // Save reference to the group for animation
        this.extraButterflies = group;
    },
    
    // Add candy decorations for Candy Land theme
    addCandyDecorations: function(group, theme) {
        const candyCount = 35;
        
        // Create different types of candy
        for (let i = 0; i < candyCount; i++) {
            const candyType = Math.floor(Math.random() * 4); // 0-3 different candy types
            const candy = new THREE.Group();
            
            // Use theme colors for the candies
            const candyColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            switch (candyType) {
                case 0: // Lollipop
                    const stickGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
                    const stickMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
                    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
                    stick.position.y = 0.6;
                    stick.rotation.x = Math.PI / 8; // Slight tilt
                    candy.add(stick);
                    
                    const lollipopGeometry = new THREE.SphereGeometry(0.4, 16, 16);
                    const lollipopMaterial = new THREE.MeshLambertMaterial({ 
                        color: candyColor,
                        emissive: new THREE.Color(candyColor).multiplyScalar(0.2)
                    });
                    const lollipop = new THREE.Mesh(lollipopGeometry, lollipopMaterial);
                    lollipop.position.set(0, 1.3, 0);
                    lollipop.rotation.x = Math.PI / 8; // Match stick tilt
                    candy.add(lollipop);
                    
                    // Add spiral pattern to lollipop
                    const spiralGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 24);
                    const spiralMaterial = new THREE.MeshLambertMaterial({ 
                        color: 0xFFFFFF,
                        emissive: 0xFFFFFF,
                        emissiveIntensity: 0.2
                    });
                    const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
                    spiral.position.set(0, 1.3, 0);
                    spiral.rotation.set(Math.PI / 2 + Math.PI / 8, 0, 0);
                    candy.add(spiral);
                    break;
                    
                case 1: // Wrapped candy
                    const candyGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                    const candyMaterial = new THREE.MeshLambertMaterial({ 
                        color: candyColor,
                        emissive: new THREE.Color(candyColor).multiplyScalar(0.2)
                    });
                    const candyCenter = new THREE.Mesh(candyGeometry, candyMaterial);
                    candy.add(candyCenter);
                    
                    // Add wrapper ends
                    const wrapperGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
                    const wrapperMaterial = new THREE.MeshLambertMaterial({ 
                        color: 0xFFFFFF,
                        transparent: true,
                        opacity: 0.7
                    });
                    
                    const leftWrapper = new THREE.Mesh(wrapperGeometry, wrapperMaterial);
                    leftWrapper.position.set(-0.4, 0, 0);
                    leftWrapper.rotation.z = -Math.PI / 2;
                    candy.add(leftWrapper);
                    
                    const rightWrapper = new THREE.Mesh(wrapperGeometry, wrapperMaterial);
                    rightWrapper.position.set(0.4, 0, 0);
                    rightWrapper.rotation.z = Math.PI / 2;
                    candy.add(rightWrapper);
                    break;
                    
                case 2: // Candy cane
                    const caneThickness = 0.07;
                    // Main stick
                    const caneStickGeometry = new THREE.CylinderGeometry(caneThickness, caneThickness, 1.2, 8);
                    const caneStickMaterial = new THREE.MeshLambertMaterial({ 
                        color: 0xFFFFFF,
                        emissive: 0xFFFFFF,
                        emissiveIntensity: 0.1
                    });
                    const caneStick = new THREE.Mesh(caneStickGeometry, caneStickMaterial);
                    caneStick.position.y = 0.6;
                    candy.add(caneStick);
                    
                    // Hook part
                    const caneHookGeometry = new THREE.TorusGeometry(0.25, caneThickness, 8, 12, Math.PI);
                    const caneHookMaterial = new THREE.MeshLambertMaterial({ 
                        color: 0xFFFFFF,
                        emissive: 0xFFFFFF,
                        emissiveIntensity: 0.1
                    });
                    const caneHook = new THREE.Mesh(caneHookGeometry, caneHookMaterial);
                    caneHook.position.set(0, 1.2, 0);
                    caneHook.rotation.y = Math.PI / 2;
                    candy.add(caneHook);
                    
                    // Red stripes
                    const stripesMaterial = new THREE.MeshLambertMaterial({ 
                        color: candyColor,
                        emissive: new THREE.Color(candyColor).multiplyScalar(0.2)
                    });
                    
                    // Add red spiral stripes
                    for (let j = 0; j < 6; j++) {
                        const stripeGeometry = new THREE.TorusGeometry(caneThickness + 0.01, 0.03, 8, 8, Math.PI * 0.15);
                        const stripe = new THREE.Mesh(stripeGeometry, stripesMaterial);
                        stripe.position.set(0, 0.2 + j * 0.2, 0);
                        stripe.rotation.set(Math.PI / 2, 0, j * Math.PI / 3);
                        candy.add(stripe);
                    }
                    
                    // Add stripes to hook
                    for (let j = 0; j < 4; j++) {
                        const hookStripeGeometry = new THREE.TorusGeometry(0.25, 0.03, 8, 8, Math.PI * 0.2);
                        const hookStripe = new THREE.Mesh(hookStripeGeometry, stripesMaterial);
                        hookStripe.position.set(0, 1.2, 0);
                        hookStripe.rotation.set(0, Math.PI / 2 + j * Math.PI / 4, 0);
                        candy.add(hookStripe);
                    }
                    break;
                    
                case 3: // Gumdrop
                    const gumdropGeometry = new THREE.ConeGeometry(0.4, 0.6, 16);
                    const gumdropMaterial = new THREE.MeshLambertMaterial({ 
                        color: candyColor,
                        transparent: true,
                        opacity: 0.9,
                        emissive: new THREE.Color(candyColor).multiplyScalar(0.2)
                    });
                    const gumdrop = new THREE.Mesh(gumdropGeometry, gumdropMaterial);
                    gumdrop.position.y = 0.3;
                    
                    // Add sugar coating effect with tiny white dots
                    const sugarCount = 20 + Math.floor(Math.random() * 20);
                    for (let j = 0; j < sugarCount; j++) {
                        const sugarDotGeometry = new THREE.SphereGeometry(0.02, 4, 4);
                        const sugarDotMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
                        const sugarDot = new THREE.Mesh(sugarDotGeometry, sugarDotMaterial);
                        
                        // Position on surface of gumdrop
                        const angle = Math.random() * Math.PI * 2;
                        const height = Math.random() * 0.6;
                        const radius = 0.4 * (1 - height / 0.6); // Cone gets narrower at top
                        
                        sugarDot.position.set(
                            Math.cos(angle) * radius,
                            height,
                            Math.sin(angle) * radius
                        );
                        
                        gumdrop.add(sugarDot);
                    }
                    
                    candy.add(gumdrop);
                    break;
            }
            
            // Position candy around the scene
            const radius = 10 + Math.random() * 35;
            const angle = Math.random() * Math.PI * 2;
            candy.position.set(
                Math.cos(angle) * radius,
                -0.1, // Slightly above ground
                Math.sin(angle) * radius
            );
            
            // Random rotation and scale
            candy.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.7 + Math.random() * 0.6;
            candy.scale.set(scale, scale, scale);
            
            group.add(candy);
        }
    },
    
    // Add lavender field decorations
    addLavenderDecorations: function(group, theme) {
        const lavenderCount = 50;
        
        // Create lavender plants
        for (let i = 0; i < lavenderCount; i++) {
            const lavender = new THREE.Group();
            
            // Create stem
            const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x4E6846 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.5;
            lavender.add(stem);
            
            // Create lavender flower spikes
            const spikeCount = 3 + Math.floor(Math.random() * 4);
            for (let j = 0; j < spikeCount; j++) {
                const spikeGeometry = new THREE.CylinderGeometry(0.05, 0.02, 0.6, 6);
                const spikeMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x9370DB, // Lavender purple color
                    emissive: 0x9370DB,
                    emissiveIntensity: 0.2
                });
                const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
                
                // Position spike at top of stem
                const angle = (j / spikeCount) * Math.PI * 2;
                const radius = 0.1;
                spike.position.set(
                    Math.cos(angle) * radius,
                    1.0,
                    Math.sin(angle) * radius
                );
                
                // Rotate spikes to point outward slightly
                spike.rotation.x = -Math.PI/10;
                spike.rotation.z = Math.cos(angle) * Math.PI/8;
                spike.rotation.y = Math.sin(angle) * Math.PI/8;
                
                lavender.add(spike);
            }
            
            // Create lavender leaves
            const leafCount = 5 + Math.floor(Math.random() * 5);
            for (let j = 0; j < leafCount; j++) {
                const leafGeometry = new THREE.SphereGeometry(0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
                const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F });
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                
                // Position leaves along stem
                const height = 0.1 + j * 0.15;
                const angle = (j / leafCount) * Math.PI * 2;
                leaf.position.set(
                    Math.cos(angle) * 0.1,
                    height,
                    Math.sin(angle) * 0.1
                );
                
                // Flatten and rotate leaf
                leaf.scale.set(0.5, 0.1, 0.5);
                leaf.rotation.x = Math.PI/2;
                leaf.rotation.y = angle + Math.PI/4;
                
                lavender.add(leaf);
            }
            
            // Position lavender plants in patches around the scene
            const patch = Math.floor(i / 10); // Divide into 5 patches
            const patchAngle = (patch / 5) * Math.PI * 2;
            const patchRadius = 15 + Math.random() * 20;
            const patchX = Math.cos(patchAngle) * patchRadius;
            const patchZ = Math.sin(patchAngle) * patchRadius;
            
            // Position within patch
            const radius = 3 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            lavender.position.set(
                patchX + Math.cos(angle) * radius,
                -0.2, // Slightly embedded in ground
                patchZ + Math.sin(angle) * radius
            );
            
            // Random rotation and scale
            lavender.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.8 + Math.random() * 0.5;
            lavender.scale.set(scale, scale, scale);
            
            group.add(lavender);
        }
        
        // Add butterflies attracted to the lavender
        const butterflyCount = 10;
        for (let i = 0; i < butterflyCount; i++) {
            const butterfly = this.createButterfly(theme);
            
            // Position butterflies near the lavender patches
            const patch = Math.floor(i / 2); // Spread across 5 patches
            const patchAngle = (patch / 5) * Math.PI * 2;
            const patchRadius = 15 + Math.random() * 20;
            const patchX = Math.cos(patchAngle) * patchRadius;
            const patchZ = Math.sin(patchAngle) * patchRadius;
            
            // Position near patch
            butterfly.position.set(
                patchX + (Math.random() - 0.5) * 8,
                1 + Math.random() * 2,
                patchZ + (Math.random() - 0.5) * 8
            );
            
            group.add(butterfly);
        }
    },
    
    // Create a reusable butterfly for various decoration themes
    createButterfly: function(theme) {
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
    },
    
    // Add mint leaf decorations
    addMintLeafDecorations: function(group, theme) {
        const plantCount = 35;
        
        // Create mint plants
        for (let i = 0; i < plantCount; i++) {
            const mint = new THREE.Group();
            
            // Create stem
            const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x5D8A5C });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.4;
            mint.add(stem);
            
            // Create mint leaves
            const leafCount = 6 + Math.floor(Math.random() * 6);
            for (let j = 0; j < leafCount; j++) {
                // Create leaf shape using a custom shape
                const leafShape = new THREE.Shape();
                leafShape.moveTo(0, 0);
                leafShape.bezierCurveTo(0.05, 0.05, 0.1, 0.1, 0.2, 0.1);
                leafShape.bezierCurveTo(0.3, 0.1, 0.4, 0, 0.4, -0.05);
                leafShape.bezierCurveTo(0.4, -0.15, 0.3, -0.2, 0.2, -0.2);
                leafShape.bezierCurveTo(0.1, -0.2, 0, -0.1, 0, 0);
                
                const leafGeometry = new THREE.ShapeGeometry(leafShape);
                const leafMaterial = new THREE.MeshLambertMaterial({
                    color: 0x98FB98, // Pale green
                    side: THREE.DoubleSide,
                    emissive: 0x98FB98,
                    emissiveIntensity: 0.1
                });
                
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                
                // Add some slight variation in leaf color
                if (Math.random() > 0.5) {
                    leaf.material = new THREE.MeshLambertMaterial({
                        color: 0x9CFF9C, // Slightly lighter mint
                        side: THREE.DoubleSide,
                        emissive: 0x9CFF9C,
                        emissiveIntensity: 0.1
                    });
                }
                
                // Position leaves in pairs along stem
                const height = 0.2 + Math.floor(j/2) * 0.2;
                const side = j % 2 === 0 ? -1 : 1; // Alternate sides
                const angle = (Math.floor(j/2) / (leafCount/2)) * Math.PI;
                
                leaf.position.set(
                    Math.sin(angle) * 0.1 * side,
                    height,
                    Math.cos(angle) * 0.1
                );
                
                // Scale and rotate leaf
                leaf.scale.set(0.4, 0.4, 0.4);
                leaf.rotation.set(
                    Math.PI/2 + (Math.random() - 0.5) * Math.PI/6, // Slight random tilt
                    angle + Math.PI/2 + (side * Math.PI/2), // Face outward from stem
                    0
                );
                
                mint.add(leaf);
                
                // Add serrated edges (small bumps) on leaves
                const serratedCount = 5 + Math.floor(Math.random() * 3);
                for (let k = 0; k < serratedCount; k++) {
                    const bumpGeometry = new THREE.SphereGeometry(0.01, 4, 4);
                    const bump = new THREE.Mesh(bumpGeometry, leafMaterial);
                    
                    // Position bumps along the edge of the leaf
                    const bumpAngle = (k / serratedCount) * Math.PI;
                    bump.position.set(
                        Math.cos(bumpAngle) * 0.18,
                        Math.sin(bumpAngle) * 0.06,
                        0
                    );
                    
                    leaf.add(bump);
                }
            }
            
            // Position mint plants around the scene in small clusters
            const clusterIndex = Math.floor(i / 7); // 5 clusters of 7 plants
            const clusterAngle = (clusterIndex / 5) * Math.PI * 2;
            const clusterRadius = 10 + Math.random() * 25;
            const clusterX = Math.cos(clusterAngle) * clusterRadius;
            const clusterZ = Math.sin(clusterAngle) * clusterRadius;
            
            // Position within cluster
            const radius = 1.5 + Math.random() * 3;
            const angle = Math.random() * Math.PI * 2;
            mint.position.set(
                clusterX + Math.cos(angle) * radius,
                -0.1, // Slightly into ground
                clusterZ + Math.sin(angle) * radius
            );
            
            // Random rotation and scale
            mint.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.8 + Math.random() * 0.6;
            mint.scale.set(scale, scale, scale);
            
            group.add(mint);
        }
    },
    
    // Add sunflower decorations
    addSunflowerDecorations: function(group, theme) {
        const sunflowerCount = 25;
        
        // Create sunflowers
        for (let i = 0; i < sunflowerCount; i++) {
            const sunflower = new THREE.Group();
            
            // Create stem
            const stemGeometry = new THREE.CylinderGeometry(0.07, 0.1, 3, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 1;
            sunflower.add(stem);
            
            // Create leaves along stem
            const leafCount = 2 + Math.floor(Math.random() * 3);
            for (let j = 0; j < leafCount; j++) {
                const leafGeometry = new THREE.CircleGeometry(0.4, 8);
                const leafMaterial = new THREE.MeshLambertMaterial({
                    color: 0x556B2F,
                    side: THREE.DoubleSide
                });
                
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                
                // Position leaf along stem
                const height = 0.4 + j * 0.6;
                const angle = (j / leafCount) * Math.PI * 2;
                leaf.position.set(
                    Math.cos(angle) * 0.3,
                    height,
                    Math.sin(angle) * 0.3
                );
                
                // Orient leaf
                leaf.rotation.set(
                    Math.PI/2, // Face upward
                    0,
                    angle + Math.PI/4 // Angle outward
                );
                
                // Slightly elongate the leaf
                leaf.scale.set(1, 0.6, 1);
                
                sunflower.add(leaf);
            }
            
            // Create sunflower head
            const flowerGeometry = new THREE.CircleGeometry(0.6, 16);
            const flowerMaterial = new THREE.MeshLambertMaterial({
                color: 0xFFD700, // Golden yellow
                side: THREE.DoubleSide,
                emissive: 0xFFD700,
                emissiveIntensity: 0.2
            });
            
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            flower.position.set(0, 2.5, 0);
            
            // Adjust flower to face slightly upward
            flower.rotation.set(
                Math.PI/2 + Math.PI/6, // Slightly tilted up
                0,
                Math.random() * Math.PI * 2 // Random rotation around stem
            );
            
            sunflower.add(flower);
            
            // Create center of sunflower (seeds)
            const centerGeometry = new THREE.CircleGeometry(0.3, 16);
            const centerMaterial = new THREE.MeshLambertMaterial({
                color: 0x8B4513, // Brown
                side: THREE.DoubleSide
            });
            
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.copy(flower.position);
            center.position.z += 0.01; // Slightly in front of petals
            center.rotation.copy(flower.rotation);
            
            sunflower.add(center);
            
            // Add seeds in center
            const seedCount = 30 + Math.floor(Math.random() * 20);
            for (let j = 0; j < seedCount; j++) {
                const seedGeometry = new THREE.SphereGeometry(0.02, 4, 4);
                const seedMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
                const seed = new THREE.Mesh(seedGeometry, seedMaterial);
                
                // Position in spiral pattern
                const seedRadius = Math.sqrt(j) * 0.06;
                const seedAngle = j * 0.5;
                const x = Math.cos(seedAngle) * seedRadius;
                const y = Math.sin(seedAngle) * seedRadius;
                
                // Position relative to flower center
                seed.position.copy(center.position);
                
                // Adjust position based on flower rotation
                const rotatedX = x * Math.cos(flower.rotation.z) - y * Math.sin(flower.rotation.z);
                const rotatedY = x * Math.sin(flower.rotation.z) + y * Math.cos(flower.rotation.z);
                
                seed.position.x += rotatedX;
                seed.position.y += rotatedY;
                seed.position.z += 0.02; // Slightly raised from center
                
                sunflower.add(seed);
            }
            
            // Position sunflowers around the scene
            const radius = 15 + Math.random() * 25;
            const angle = Math.random() * Math.PI * 2;
            sunflower.position.set(
                Math.cos(angle) * radius,
                -0.5, // Partially into ground
                Math.sin(angle) * radius
            );
            
            // Random rotation and slight scale variation
            sunflower.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.7 + Math.random() * 0.4;
            sunflower.scale.set(scale, scale, scale);
            
            group.add(sunflower);
        }
    },
    
    // Add lantern decorations
    addLanternDecorations: function(group, theme) {
        const lanternCount = 20;
        
        // Track the created lanterns for animation purposes
        this.lanterns = new THREE.Group();
        
        // Create Paper lanterns
        for (let i = 0; i < lanternCount; i++) {
            const lantern = new THREE.Group();
            
            // Determine lantern color from theme
            const lanternColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            // Create lantern body
            const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const bodyMaterial = new THREE.MeshLambertMaterial({
                color: lanternColor,
                transparent: true,
                opacity: 0.8,
                emissive: lanternColor,
                emissiveIntensity: 0.3
            });
            
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.scale.set(1, 1.2, 1); // Slightly elongated
            lantern.add(body);
            
            // Add top and bottom caps
            const capGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
            const capMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x8B4513, // Brown wood color
                emissive: 0x8B4513,
                emissiveIntensity: 0.1
            });
            
            const topCap = new THREE.Mesh(capGeometry, capMaterial);
            topCap.position.y = 0.6;
            lantern.add(topCap);
            
            const bottomCap = new THREE.Mesh(capGeometry, capMaterial);
            bottomCap.position.y = -0.6;
            lantern.add(bottomCap);
            
            // Add string to hang the lantern
            const stringGeometry = new THREE.CylinderGeometry(0.01, 0.01, 2, 4);
            const stringMaterial = new THREE.MeshBasicMaterial({ color: 0xDDDDDD });
            const string = new THREE.Mesh(stringGeometry, stringMaterial);
            string.position.y = 1.6;
            lantern.add(string);
            
            // Add a light inside the lantern
            const light = new THREE.PointLight(lanternColor, 0.8, 5);
            light.position.set(0, 0, 0);
            lantern.add(light);
            
            // Position lanterns around the scene
            const height = 3 + Math.random() * 3; // Varying heights
            const radius = 15 + Math.random() * 20;
            const angle = Math.random() * Math.PI * 2;
            lantern.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Add animation data
            lantern.userData = {
                originalY: lantern.position.y,
                bobPhase: Math.random() * Math.PI * 2,
                bobSpeed: 0.01 + Math.random() * 0.01,
                bobHeight: 0.1 + Math.random() * 0.1,
                driftDirection: Math.random() * Math.PI * 2,
                driftSpeed: 0.002 + Math.random() * 0.003,
                lightIntensity: 0.8 + Math.random() * 0.4
            };
            
            // Store in the lanterns group for animation
            this.lanterns.add(lantern);
            group.add(lantern);
        }
    },
    
    // Add rainbow banner decorations
    addRainbowBannerDecorations: function(group, theme) {
        const bannerCount = 15;
        
        // Define rainbow colors
        const rainbowColors = [
            0xFF0000, // Red
            0xFF7F00, // Orange
            0xFFFF00, // Yellow
            0x00FF00, // Green
            0x0000FF, // Blue
            0x4B0082, // Indigo
            0x9400D3  // Violet
        ];
        
        // Create banners
        for (let i = 0; i < bannerCount; i++) {
            const banner = new THREE.Group();
            
            // Create poles at each end
            const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
            const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            
            const pole1 = new THREE.Mesh(poleGeometry, poleMaterial);
            pole1.position.set(-2, 1, 0);
            banner.add(pole1);
            
            const pole2 = new THREE.Mesh(poleGeometry, poleMaterial);
            pole2.position.set(2, 1, 0);
            banner.add(pole2);
            
            // Create rainbow banner strips
            const stripHeight = 3 / rainbowColors.length; // Divide full height by number of colors
            for (let j = 0; j < rainbowColors.length; j++) {
                const stripGeometry = new THREE.PlaneGeometry(4, stripHeight);
                const stripMaterial = new THREE.MeshLambertMaterial({
                    color: rainbowColors[j],
                    side: THREE.DoubleSide,
                    emissive: rainbowColors[j],
                    emissiveIntensity: 0.2
                });
                
                const strip = new THREE.Mesh(stripGeometry, stripMaterial);
                
                // Position from top to bottom
                strip.position.set(
                    0, 
                    2 - stripHeight/2 - j * stripHeight, // Start from top
                    0
                );
                
                // Add wave effect to the banner
                const vertices = strip.geometry.attributes.position.array;
                for (let k = 0; k < vertices.length; k += 3) {
                    // Apply wave pattern only to y coordinate
                    const x = vertices[k];
                    vertices[k + 1] += Math.sin(x * 1.5) * 0.1;
                }
                strip.geometry.attributes.position.needsUpdate = true;
                
                banner.add(strip);
            }
            
            // Position banners around the scene
            const radius = 10 + Math.random() * 30;
            const angle = Math.random() * Math.PI * 2;
            banner.position.set(
                Math.cos(angle) * radius,
                0, // Base on ground
                Math.sin(angle) * radius
            );
            
            // Random rotation
            banner.rotation.y = Math.random() * Math.PI * 2;
            
            group.add(banner);
        }
    },
    
    // Add snowmen decorations
    addSnowmenDecorations: function(group, theme) {
        const snowmanCount = 15;
        
        // Create snowmen
        for (let i = 0; i < snowmanCount; i++) {
            const snowman = new THREE.Group();
            
            // Bottom large snowball
            const bottomGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            const snowMaterial = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF,
                emissive: 0xCCCCFF,
                emissiveIntensity: 0.1
            });
            
            const bottom = new THREE.Mesh(bottomGeometry, snowMaterial);
            bottom.position.y = 0.8;
            snowman.add(bottom);
            
            // Middle snowball
            const middleGeometry = new THREE.SphereGeometry(0.6, 16, 16);
            const middle = new THREE.Mesh(middleGeometry, snowMaterial);
            middle.position.y = 2;
            snowman.add(middle);
            
            // Head snowball
            const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const head = new THREE.Mesh(headGeometry, snowMaterial);
            head.position.y = 2.9;
            snowman.add(head);
            
            // Carrot nose
            const noseGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
            const noseMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF7F00,
                emissive: 0xFF7F00,
                emissiveIntensity: 0.2
            });
            
            const nose = new THREE.Mesh(noseGeometry, noseMaterial);
            nose.position.set(0, 2.9, 0.4);
            nose.rotation.x = Math.PI/2;
            snowman.add(nose);
            
            // Coal eyes
            const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.15, 3, 0.35);
            snowman.add(leftEye);
            
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.15, 3, 0.35);
            snowman.add(rightEye);
            
            // Coal buttons
            const buttonGeometry = new THREE.SphereGeometry(0.06, 8, 8);
            const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            
            for (let j = 0; j < 3; j++) {
                const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
                button.position.set(0, 2.2 - j * 0.3, 0.6);
                snowman.add(button);
            }
            
            // Add stick arms
            const armGeometry = new THREE.CylinderGeometry(0.05, 0.03, 1, 4);
            const armMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.7, 2.1, 0);
            leftArm.rotation.z = Math.PI/4;
            snowman.add(leftArm);
            
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.7, 2.1, 0);
            rightArm.rotation.z = -Math.PI/4;
            snowman.add(rightArm);
            
            // Add a hat
            const hatBaseGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16);
            const hatBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const hatBase = new THREE.Mesh(hatBaseGeometry, hatBaseMaterial);
            hatBase.position.y = 3.2;
            snowman.add(hatBase);
            
            const hatTopGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
            const hatTop = new THREE.Mesh(hatTopGeometry, hatBaseMaterial);
            hatTop.position.y = 3.4;
            snowman.add(hatTop);
            
            // Scarf (using a theme color)
            const scarfColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            const scarfGeometry = new THREE.TorusGeometry(0.45, 0.1, 8, 16, Math.PI * 1.5);
            const scarfMaterial = new THREE.MeshLambertMaterial({
                color: scarfColor,
                emissive: scarfColor,
                emissiveIntensity: 0.2
            });
            
            const scarf = new THREE.Mesh(scarfGeometry, scarfMaterial);
            scarf.position.set(0, 2.5, 0);
            scarf.rotation.set(Math.PI/2, 0, Math.PI/4);
            snowman.add(scarf);
            
            // Scarf end piece hanging down
            const scarfEndGeometry = new THREE.PlaneGeometry(0.2, 0.6);
            const scarfEnd = new THREE.Mesh(scarfEndGeometry, scarfMaterial);
            scarfEnd.position.set(0.3, 2.2, 0.3);
            scarfEnd.rotation.set(0, Math.PI/4, 0);
            snowman.add(scarfEnd);
            
            // Position snowmen around the scene
            const radius = 10 + Math.random() * 30;
            const angle = Math.random() * Math.PI * 2;
            snowman.position.set(
                Math.cos(angle) * radius,
                -0.5, // Slightly embedded in snow
                Math.sin(angle) * radius
            );
            
            // Random rotation
            snowman.rotation.y = Math.random() * Math.PI * 2;
            
            // Random scale variation
            const scale = 0.7 + Math.random() * 0.4;
            snowman.scale.set(scale, scale, scale);
            
            group.add(snowman);
        }
    },
    
    // Add ice sculpture decorations
    addIceSculpturesDecorations: function(group, theme) {
        const sculptureCount = 10;
        
        // Create different types of ice sculptures
        for (let i = 0; i < sculptureCount; i++) {
            const sculptureType = Math.floor(Math.random() * 4); // 0-3 different sculpture types
            const sculpture = new THREE.Group();
            
            // Create ice material
            const iceMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xADD8E6, // Light blue
                transparent: true,
                opacity: 0.7,
                roughness: 0.2,
                metalness: 0.1,
                envMapIntensity: 1.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                transmission: 0.9,
                ior: 1.4
            });
            
            switch (sculptureType) {
                case 0: // Swan sculpture
                    // Body
                    const bodyGeometry = new THREE.SphereGeometry(0.6, 16, 16);
                    const body = new THREE.Mesh(bodyGeometry, iceMaterial);
                    body.scale.set(1, 0.7, 1.5);
                    sculpture.add(body);
                    
                    // Neck
                    const neckGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8);
                    const neck = new THREE.Mesh(neckGeometry, iceMaterial);
                    neck.position.set(0, 0.4, -0.5);
                    neck.rotation.x = Math.PI/3;
                    sculpture.add(neck);
                    
                    // Head
                    const headGeometry = new THREE.SphereGeometry(0.2, 12, 12);
                    const head = new THREE.Mesh(headGeometry, iceMaterial);
                    head.position.set(0, 0.9, -0.9);
                    sculpture.add(head);
                    
                    // Beak
                    const beakGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
                    const beak = new THREE.Mesh(beakGeometry, iceMaterial);
                    beak.position.set(0, 0.85, -1.1);
                    beak.rotation.x = -Math.PI/2;
                    sculpture.add(beak);
                    
                    // Wings
                    const wingGeometry = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
                    
                    const leftWing = new THREE.Mesh(wingGeometry, iceMaterial);
                    leftWing.position.set(-0.5, 0.1, 0);
                    leftWing.rotation.set(Math.PI/2, 0, Math.PI/6);
                    leftWing.scale.set(1, 1.2, 0.3);
                    sculpture.add(leftWing);
                    
                    const rightWing = new THREE.Mesh(wingGeometry, iceMaterial);
                    rightWing.position.set(0.5, 0.1, 0);
                    rightWing.rotation.set(Math.PI/2, 0, -Math.PI/6);
                    rightWing.scale.set(1, 1.2, 0.3);
                    sculpture.add(rightWing);
                    break;
                    
                case 1: // Abstract spiral
                    // Base
                    const baseGeometry = new THREE.CylinderGeometry(0.8, 0.9, 0.3, 16);
                    const base = new THREE.Mesh(baseGeometry, iceMaterial);
                    base.position.y = 0.15;
                    sculpture.add(base);
                    
                    // Spiral elements
                    const spiralSegments = 12;
                    const spiralHeight = 2.5;
                    
                    for (let j = 0; j < spiralSegments; j++) {
                        const height = (j / spiralSegments) * spiralHeight;
                        const angle = (j / spiralSegments) * Math.PI * 4;
                        
                        const segmentGeometry = new THREE.SphereGeometry(0.2 - (j * 0.01), 8, 8);
                        const segment = new THREE.Mesh(segmentGeometry, iceMaterial);
                        
                        segment.position.set(
                            Math.cos(angle) * (0.5 - j * 0.03),
                            0.3 + height,
                            Math.sin(angle) * (0.5 - j * 0.03)
                        );
                        
                        sculpture.add(segment);
                    }
                    break;
                    
                case 2: // Crystal formation
                    // Base
                    const crystalBaseGeometry = new THREE.CylinderGeometry(0.7, 0.8, 0.3, 6);
                    const crystalBase = new THREE.Mesh(crystalBaseGeometry, iceMaterial);
                    crystalBase.position.y = 0.15;
                    sculpture.add(crystalBase);
                    
                    // Create crystal spikes
                    const spikeCount = 7 + Math.floor(Math.random() * 5);
                    
                    for (let j = 0; j < spikeCount; j++) {
                        const height = 0.7 + Math.random() * 1.5;
                        const thickness = 0.1 + Math.random() * 0.2;
                        
                        const spikeGeometry = new THREE.ConeGeometry(thickness, height, 6);
                        const spike = new THREE.Mesh(spikeGeometry, iceMaterial);
                        
                        // Position spikes around and on the base
                        const angle = (j / spikeCount) * Math.PI * 2;
                        const radius = 0.4 * Math.random();
                        
                        spike.position.set(
                            Math.cos(angle) * radius,
                            0.3 + height/2,
                            Math.sin(angle) * radius
                        );
                        
                        // Random tilt
                        const tiltAngle = Math.random() * Math.PI/6;
                        const tiltDirection = Math.random() * Math.PI * 2;
                        
                        spike.rotation.set(
                            Math.cos(tiltDirection) * tiltAngle,
                            0,
                            Math.sin(tiltDirection) * tiltAngle
                        );
                        
                        sculpture.add(spike);
                    }
                    break;
                    
                case 3: // Geometric shapes stacked
                    // Base cube
                    const cubeGeometry = new THREE.BoxGeometry(1, 0.4, 1);
                    const cube = new THREE.Mesh(cubeGeometry, iceMaterial);
                    cube.position.y = 0.2;
                    sculpture.add(cube);
                    
                    // Middle sphere
                    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                    const sphere = new THREE.Mesh(sphereGeometry, iceMaterial);
                    sphere.position.y = 0.8;
                    sphere.rotation.y = Math.PI/4; // Slight rotation for interest
                    sculpture.add(sphere);
                    
                    // Top pyramid
                    const pyramidGeometry = new THREE.ConeGeometry(0.4, 0.8, 4);
                    const pyramid = new THREE.Mesh(pyramidGeometry, iceMaterial);
                    pyramid.position.y = 1.6;
                    pyramid.rotation.y = Math.PI/4; // Align with cube edges
                    sculpture.add(pyramid);
                    break;
            }
            
            // Position ice sculptures around the scene
            const radius = 10 + Math.random() * 30;
            const angle = Math.random() * Math.PI * 2;
            sculpture.position.set(
                Math.cos(angle) * radius,
                0, // On ground
                Math.sin(angle) * radius
            );
            
            // Random rotation
            sculpture.rotation.y = Math.random() * Math.PI * 2;
            
            // Scale variation
            const scale = 0.8 + Math.random() * 0.5;
            sculpture.scale.set(scale, scale, scale);
            
            // Add a base platform of ice/snow
            const platformGeometry = new THREE.CylinderGeometry(1.2 * scale, 1.4 * scale, 0.2, 16);
            const platformMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFFFFF,
                emissive: 0xCCCCFF,
                emissiveIntensity: 0.1
            });
            
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.copy(sculpture.position);
            platform.position.y = -0.1;
            
            group.add(platform);
            group.add(sculpture);
        }
    }
};