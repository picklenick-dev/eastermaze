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
        
        // Create wall materials based on graphics setting
        let wallMaterial;
        
        if (CONFIG.enhancedGraphics) {
            // Create textured wall material for enhanced graphics
            const wallTexture = this.createEasterWallTexture();
            
            wallMaterial = new THREE.MeshStandardMaterial({ 
                color: CONFIG.colors.walls,
                map: wallTexture,
                roughness: 0.7,
                metalness: 0.1,
                transparent: true,
                opacity: 1.0
            });
            
            // Create wooden frame texture for top of walls
            const frameTexture = this.createWoodenFrameTexture();
            this.frameTexture = frameTexture;
        } else {
            // Simple material for performance mode
            wallMaterial = new THREE.MeshStandardMaterial({ 
                color: CONFIG.colors.walls,
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
                        this.createEnhancedWall(j, i, mazeSize);
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
    createEnhancedWall: function(x, z, mazeSize) {
        const wallGroup = new THREE.Group();
        wallGroup.position.set(x * 2 - mazeSize, 0, z * 2 - mazeSize);
        
        // Create main wall box
        const wallGeometry = new THREE.BoxGeometry(2, 1.8, 2);
        
        // Create wall texture
        const wallTexture = this.createEasterWallTexture();
        
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.walls,
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
            color: 0x8B4513,
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
            this.addWallDecoration(wallGroup);
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
    createEasterWallTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Base color (light pastel)
        ctx.fillStyle = '#F5E8C0'; // Light beige/cream
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle texture
        ctx.fillStyle = '#EFE0B0';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = 5 + Math.random() * 15;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add Easter egg pattern
        for (let i = 0; i < 8; i++) {
            const x = 32 + (i % 4) * 64;
            const y = 32 + Math.floor(i / 4) * 96;
            
            // Draw egg outline
            ctx.fillStyle = ['#FFB6C1', '#ADD8E6', '#98FB98', '#FFFACD'][i % 4];
            ctx.beginPath();
            ctx.ellipse(x, y, 16, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Add decorative pattern
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
    createWoodenFrameTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Base wood color
        ctx.fillStyle = '#8B4513';
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
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    },
    
    // Add Easter decoration to wall
    addWallDecoration: function(wallGroup) {
        // Choose a random decoration type
        const decorType = Math.floor(Math.random() * 3);
        
        switch (decorType) {
            case 0: // Colorful Easter ribbon
                this.addRibbonDecoration(wallGroup);
                break;
            case 1: // Easter flower
                this.addFlowerDecoration(wallGroup);
                break;
            case 2: // Small Easter basket
                this.addEasterBasket(wallGroup);
                break;
        }
    },
    
    // Add colorful Easter ribbon
    addRibbonDecoration: function(wallGroup) {
        const ribbonGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.05);
        const ribbonColor = [0xFF9999, 0x99FF99, 0x9999FF, 0xFFFF99][Math.floor(Math.random() * 4)];
        
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
    addFlowerDecoration: function(wallGroup) {
        const flowerGroup = new THREE.Group();
        
        // Flower stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x00AA00 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.3;
        flowerGroup.add(stem);
        
        // Flower petals
        const petalCount = 5 + Math.floor(Math.random() * 3);
        const petalColor = [0xFFAAAA, 0xAAFFAA, 0xAAAAFF, 0xFFFFAA][Math.floor(Math.random() * 4)];
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
    addEasterBasket: function(wallGroup) {
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
        
        // Mini Easter eggs in basket
        const eggColors = [0xFF9999, 0x99FF99, 0x9999FF, 0xFFFF99, 0xFF99FF];
        
        for (let i = 0; i < 4; i++) {
            const eggGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            eggGeometry.scale(0.8, 1, 0.8);
            
            const eggMaterial = new THREE.MeshLambertMaterial({ 
                color: eggColors[i % eggColors.length],
                emissive: new THREE.Color(eggColors[i % eggColors.length]).multiplyScalar(0.1)
            });
            
            const egg = new THREE.Mesh(eggGeometry, eggMaterial);
            
            // Position eggs in the basket
            const angle = (i / 4) * Math.PI * 2;
            const radius = 0.1;
            egg.position.set(
                Math.cos(angle) * radius,
                0.08,
                Math.sin(angle) * radius
            );
            
            // Random rotation
            egg.rotation.x = Math.random() * Math.PI;
            egg.rotation.z = Math.random() * Math.PI;
            
            basketGroup.add(egg);
        }
        
        // Position on wall
        basketGroup.position.y = 0.25;
        
        // Choose a random corner
        const side = Math.floor(Math.random() * 4);
        const offset = 0.7;
        
        switch (side) {
            case 0: // Front-right
                basketGroup.position.set(offset, 0.25, offset);
                break;
            case 1: // Front-left
                basketGroup.position.set(-offset, 0.25, offset);
                break;
            case 2: // Back-right
                basketGroup.position.set(offset, 0.25, -offset);
                break;
            case 3: // Back-left
                basketGroup.position.set(-offset, 0.25, -offset);
                break;
        }
        
        // Slightly random rotation
        basketGroup.rotation.y = Math.random() * Math.PI * 2;
        
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