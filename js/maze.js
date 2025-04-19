// filepath: c:\Development\easter-labrynth\js\maze.js
// Håndterer labyrinten
import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { PlayerModule } from './player.js';

// Håndterer labyrinten
export const MazeModule = {
    maze: null,
    walls: [], // Array for å holde referanser til alle veggene
    
    // Oppretter labyrinten basert på gjeldende nivå
    createMaze: function() {
        this.maze = new THREE.Group();
        this.walls = []; // Reset vegger-array
        
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeDesign = currentLevel.mazeDesign;
        const mazeSize = mazeDesign.length;
        
        // Get current level theme - Fixed to ensure proper theme selection for all levels
        const levelIndex = CONFIG.currentLevel;
        const currentTheme = CONFIG.levelThemes[levelIndex] || CONFIG.levelThemes[1];
        console.log(`Creating maze for level ${levelIndex} with theme: ${currentTheme.name}`);
        
        // Create wall materials based on graphics setting
        let wallMaterial;
        
        if (CONFIG.enhancedGraphics) {
            // Create textured wall material for enhanced graphics
            const wallTexture = this.createEasterWallTexture(currentTheme);
            wallMaterial = new THREE.MeshStandardMaterial({ 
                color: currentTheme.wallColor,
                map: wallTexture,
                roughness: 0.7,
                metalness: 0.1,
                transparent: true,
                opacity: 1.0
            });
            
            // Create wooden frame texture for top of walls
            const frameTexture = this.createWoodenFrameTexture(currentTheme);
            this.frameTexture = frameTexture;
        } else {
            // Simple material for performance mode
            wallMaterial = new THREE.MeshStandardMaterial({ 
                color: currentTheme.wallColor,
                roughness: 0.7,
                transparent: true,
                opacity: 1.0
            });
        }
        
        for (let i = 0; i < mazeDesign.length; i++) {
            for (let j = 0; j < mazeDesign[i].length; j++) {
                if (mazeDesign[i][j] === 1) {
                    if (CONFIG.enhancedGraphics) {
                        // Create enhanced walls
                        this.createEnhancedWall(j, i, mazeSize, currentTheme);
                    } else {
                        // Simple wall geometry
                        const wallGeometry = new THREE.BoxGeometry(2, 2, 2);
                        const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
                        wall.position.set(j * 2 - mazeSize, 0, i * 2 - mazeSize);
                        
                        wall.userData = {
                            gridX: j,
                            gridZ: i
                        };
                        
                        this.walls.push(wall);
                        this.maze.add(wall);
                    }
                }
            }
        }
        
        CONFIG.scene.add(this.maze);
    },
    
    // Create enhanced walls with Easter decorations
    createEnhancedWall: function(x, z, mazeSize, theme) {
        const wallGroup = new THREE.Group();
        wallGroup.position.set(x * 2 - mazeSize, 0, z * 2 - mazeSize);
        
        // Create main wall box
        const wallGeometry = new THREE.BoxGeometry(2, 1.8, 2);
        
        // Create wall texture
        const wallTexture = this.createEasterWallTexture(theme);
        
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: theme.wallColor,
            map: wallTexture,
            roughness: 0.7,
            metalness: 0.1,
            transparent: true,
            opacity: 1.0
        });
        
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.y = -0.1; // Slightly lower to accommodate the frame
        wall.castShadow = CONFIG.enhancedGraphics;
        wall.receiveShadow = CONFIG.enhancedGraphics;
        wallGroup.add(wall);
        
        // Add wooden frame on top
        const frameGeometry = new THREE.BoxGeometry(2.2, 0.3, 2.2);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: theme.frameColor,
            map: this.frameTexture,
            roughness: 0.9,
            metalness: 0.1,
            transparent: true,
            opacity: 1.0
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 0.9;
        frame.castShadow = CONFIG.enhancedGraphics;
        wallGroup.add(frame);
        
        // Add Easter decorations
        if (Math.random() < 0.3) { // Only add decorations to some walls
            this.addWallDecoration(wallGroup, theme);
        }
        
        wallGroup.userData = {
            gridX: x,
            gridZ: z,
            isWall: true
        };
        
        this.walls.push(wallGroup);
        this.maze.add(wallGroup);
    },
    
    // Create Easter-themed wall texture
    createEasterWallTexture: function(theme) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Base color (light pastel)
        ctx.fillStyle = theme.wallBaseTexture; // Use theme-specific base color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle texture
        ctx.fillStyle = theme.wallPatternColor; // Use theme-specific pattern color
        
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 5 + Math.random() * 15;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add Easter-themed decorative patterns
        const patternCount = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < patternCount; i++) {
            const x = 20 + Math.random() * (canvas.width - 40);
            const y = 20 + Math.random() * (canvas.height - 40);
            
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            
            // Different decoration patterns
            switch (i % 3) {
                case 0: // Zigzag
                    ctx.beginPath();
                    for (let j = -15; j <= 15; j += 5) {
                        ctx.moveTo(x - 10, y + j);
                        ctx.lineTo(x + 10, y + j + 2.5);
                    }
                    ctx.stroke();
                    break;
                case 1: // Dots
                    for (let j = 0; j < 8; j++) {
                        const angle = (j / 8) * Math.PI * 2;
                        const dotX = x + Math.cos(angle) * 10;
                        const dotY = y + Math.sin(angle) * 14;
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fill();
                    }
                    break;
                case 2: // Stripes
                    ctx.beginPath();
                    for (let j = -15; j <= 15; j += 7) {
                        ctx.moveTo(x - 12, y + j);
                        ctx.lineTo(x + 12, y + j);
                    }
                    ctx.stroke();
                    break;
            }
        }
        
        // Create and return the texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        return texture;
    },
    
    // Create wooden frame texture
    createWoodenFrameTexture: function(theme) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Base wood color
        const frameColorHex = theme.frameColor.toString(16).padStart(6, '0');
        ctx.fillStyle = `#${frameColorHex}`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add wood grain
        ctx.strokeStyle = '#6B3300';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            
            // Create wavy line for wood grain
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.lineTo(x + Math.sin(y * 0.1) * 3, y);
            }
            
            ctx.stroke();
        }
        
        // Add some lighter streaks
        ctx.strokeStyle = '#A67D5D';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            
            // Create wavy line for wood grain
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.lineTo(x + Math.sin(y * 0.2) * 2, y);
            }
            
            ctx.stroke();
        }
        
        // Create and return the texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        return texture;
    },
    
    // Add Easter decoration to wall
    addWallDecoration: function(wallGroup, theme) {
        // Choose a random decoration type
        const decorType = Math.floor(Math.random() * 3);
        
        switch (decorType) {
            case 0: // Colorful Easter ribbon
                this.addRibbonDecoration(wallGroup, theme);
                break;
            case 1: // Easter flower
                this.addFlowerDecoration(wallGroup, theme);
                break;
            case 2: // Small Easter basket
                this.addEasterBasket(wallGroup, theme);
                break;
        }
    },
    
    // Add colorful Easter ribbon
    addRibbonDecoration: function(wallGroup, theme) {
        const ribbonGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.05);
        
        // Use theme-specific decoration color
        const ribbonColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
        
        const ribbonMaterial = new THREE.MeshLambertMaterial({
            color: ribbonColor,
            emissive: new THREE.Color(ribbonColor).multiplyScalar(0.2)
        });
        
        const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
        
        // Position on wall face
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // Front
                ribbon.position.set(0, 0.3, 1.03);
                break;
            case 1: // Back
                ribbon.position.set(0, 0.3, -1.03);
                ribbon.rotation.y = Math.PI;
                break;
            case 2: // Left
                ribbon.position.set(-1.03, 0.3, 0);
                ribbon.rotation.y = Math.PI / 2;
                break;
            case 3: // Right
                ribbon.position.set(1.03, 0.3, 0);
                ribbon.rotation.y = -Math.PI / 2;
                break;
        }
        
        // Add bow in the middle
        const bowGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const bow = new THREE.Mesh(bowGeometry, ribbonMaterial);
        bow.position.copy(ribbon.position);
        bow.position.y += 0.2;
        
        wallGroup.add(ribbon);
        wallGroup.add(bow);
    },
    
    // Add Easter flower decoration
    addFlowerDecoration: function(wallGroup, theme) {
        const flowerGroup = new THREE.Group();
        
        // Flower stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x00AA00 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.3;
        flowerGroup.add(stem);
        
        // Flower petals
        const petalCount = 5 + Math.floor(Math.random() * 3);
        const petalColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
        const petalMaterial = new THREE.MeshLambertMaterial({ 
            color: petalColor,
            emissive: new THREE.Color(petalColor).multiplyScalar(0.15)
        });
        
        for (let i = 0; i < petalCount; i++) {
            const petalGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            petalGeometry.scale(1, 0.5, 0.5);
            
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            const angle = (i / petalCount) * Math.PI * 2;
            petal.position.set(
                Math.cos(angle) * 0.15,
                0.6,
                Math.sin(angle) * 0.15
            );
            
            petal.rotation.x = Math.PI / 2;
            petal.rotation.z = angle;
            
            flowerGroup.add(petal);
        }
        
        // Flower center
        const centerGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.6;
        flowerGroup.add(center);
        
        // Position on wall
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // Front
                flowerGroup.position.z = 1.03;
                flowerGroup.rotation.x = -Math.PI / 2;
                break;
            case 1: // Back
                flowerGroup.position.z = -1.03;
                flowerGroup.rotation.x = Math.PI / 2;
                break;
            case 2: // Left
                flowerGroup.position.x = -1.03;
                flowerGroup.rotation.z = Math.PI / 2;
                break;
            case 3: // Right
                flowerGroup.position.x = 1.03;
                flowerGroup.rotation.z = -Math.PI / 2;
                break;
        }
        
        wallGroup.add(flowerGroup);
    },
    
    // Add small Easter basket
    addEasterBasket: function(wallGroup, theme) {
        const basketGroup = new THREE.Group();
        
        // Basket base
        const basketGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.15, 8);
        const basketMaterial = new THREE.MeshLambertMaterial({ color: 0xA0522D });
        const basket = new THREE.Mesh(basketGeometry, basketMaterial);
        basketGroup.add(basket);
        
        // Basket handle
        const handleGeometry = new THREE.TorusGeometry(0.15, 0.02, 8, 16, Math.PI);
        const handle = new THREE.Mesh(handleGeometry, basketMaterial);
        handle.position.y = 0.1;
        handle.rotation.x = Math.PI / 2;
        basketGroup.add(handle);
        
        // Add mini eggs in basket
        const eggCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < eggCount; i++) {
            const eggGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            eggGeometry.scale(1, 1.3, 1);
            
            // Use theme-specific decoration color
            const eggColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const eggMaterial = new THREE.MeshLambertMaterial({ 
                color: eggColor,
                emissive: new THREE.Color(eggColor).multiplyScalar(0.2)
            });
            
            const egg = new THREE.Mesh(eggGeometry, eggMaterial);
            
            // Position egg within basket
            const angle = (i / eggCount) * Math.PI * 2;
            const radius = 0.08;
            egg.position.set(
                Math.cos(angle) * radius,
                0.05,
                Math.sin(angle) * radius
            );
            egg.rotation.x = Math.random() * Math.PI / 4;
            egg.rotation.z = Math.random() * Math.PI / 4;
            
            basketGroup.add(egg);
        }
        
        // Position on wall
        const side = Math.floor(Math.random() * 4);
        basketGroup.position.y = 0.3;
        
        switch (side) {
            case 0: // Front
                basketGroup.position.z = 1.03;
                break;
            case 1: // Back
                basketGroup.position.z = -1.03;
                basketGroup.rotation.y = Math.PI;
                break;
            case 2: // Left
                basketGroup.position.x = -1.03;
                basketGroup.rotation.y = Math.PI / 2;
                break;
            case 3: // Right
                basketGroup.position.x = 1.03;
                basketGroup.rotation.y = -Math.PI / 2;
                break;
        }
        
        wallGroup.add(basketGroup);
    },
    
    // Sjekker om vegger er mellom kamera og spiller og justerer gjennomsiktighet
    updateWallVisibility: function() {
        if (!this.maze || !PlayerModule.player) return;
        
        const cameraPosition = CONFIG.camera.position.clone();
        const playerPosition = PlayerModule.player.position.clone();
        
        // Lag en vektor fra kamera til spiller
        const rayDirection = new THREE.Vector3().subVectors(playerPosition, cameraPosition).normalize();
        const raycaster = new THREE.Raycaster(cameraPosition, rayDirection);
        
        // Finn vegger som krysser siktelinjen
        const intersects = raycaster.intersectObjects(this.walls, true);
        
        // Reset alle vegger til normal synlighet først
        this.walls.forEach(wall => {
            if (wall.material) {
                wall.material.opacity = 1.0;
            } else if (wall.children) {
                // For enhanced walls, adjust opacity of all children
                wall.children.forEach(child => {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.opacity = 1.0;
                            });
                        } else {
                            child.material.opacity = 1.0;
                        }
                    }
                });
            }
        });
        
        // Gjør kun den første veggen som er i veien gjennomsiktig (nærmest kameraet)
        if (intersects.length > 0 && intersects[0].object !== PlayerModule.player) {
            // Find the parent wall group if the intersected object is a child
            let wallObj = intersects[0].object;
            while (wallObj.parent && wallObj.parent !== this.maze) {
                wallObj = wallObj.parent;
            }
            
            // Make the wall transparent
            if (wallObj.material) {
                wallObj.material.opacity = 0.3;
            } else if (wallObj.children) {
                // For enhanced walls, adjust opacity of all children
                wallObj.children.forEach(child => {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.opacity = 0.3;
                            });
                        } else {
                            child.material.opacity = 0.3;
                        }
                    }
                });
            }
        }
    },
    
    // Fjerner labyrinten
    removeMaze: function() {
        if (this.maze) {
            CONFIG.scene.remove(this.maze);
            this.walls = [];
        }
    }
};