// filepath: c:\Development\easter-labrynth\js\eggs.js
// Håndterer påskeegg
import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { PlayerModule } from './player.js';
import { UIModule } from './ui.js';
import { GameModule } from './game.js';
import { SoundModule } from './sound.js';
import { HighScoreModule } from './highscore.js';

export const EggModule = {
    eggs: [],
    particleSystems: [],
    
    // Oppretter påskeegg for gjeldende nivå
    createEggs: function() {
        this.eggs = [];
        this.particleSystems = [];
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeSize = currentLevel.mazeDesign.length;
        
        currentLevel.eggPositions.forEach(pos => {
            this.createEgg(pos);
        });
        
        CONFIG.totalEggs = this.eggs.length;
        CONFIG.eggsFound = 0;
        UIModule.updateScoreDisplay();
    },
    
    // Oppretter et egg på gitt posisjon
    createEgg: function(pos) {
        if (!pos) return;
        
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeDesign = currentLevel.mazeDesign;
        const mazeSize = mazeDesign.length; // Define mazeSize variable
        
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Sjekk om posisjonen er gyldig
        const x = pos[0];
        const z = pos[1];
        
        if (x >= 0 && x < mazeDesign[0].length && z >= 0 && z < mazeDesign.length) {
            // Sjekk om det er en vegg (1) i denne posisjonen
            if (mazeDesign[z] && mazeDesign[z][x] === 1) {
                console.warn(`Egg at position [${x}, ${z}] is inside a wall! Skipping this egg.`);
                return; // Hopp over egget hvis det er i en vegg
            }
            
            // Opprett en gruppe for egget og dets effekter
            const eggGroup = new THREE.Group();
            
            // Opprett et detaljert påskeegg
            this.createFancyEgg(eggGroup, currentTheme);
            
            eggGroup.position.set(
                pos[0] * 2 - mazeSize, 
                0, 
                pos[1] * 2 - mazeSize
            );
            
            eggGroup.userData = { 
                collected: false, 
                gridX: pos[0], 
                gridZ: pos[1] 
            };
            
            // Legg til partikkeleffekt
            this.addParticleEffect(eggGroup, currentTheme);
            
            // Legg til lyseffekt
            if (CONFIG.enhancedGraphics) {
                this.addLightEffect(eggGroup, currentTheme);
            }
            
            this.eggs.push(eggGroup);
            CONFIG.scene.add(eggGroup);
        }
    },
    
    // Opprett et detaljert påskeegg med tilfeldig farge
    createFancyEgg: function(eggGroup, theme) {
        // Base egg geometry (oval shape)
        const eggGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        eggGeometry.scale(1, 1.3, 1);
        
        // Choose a random color from the theme's decoration colors
        const randomColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
        
        let eggMaterial;
        
        if (CONFIG.enhancedGraphics) {
            // Create a more detailed egg texture with enhanced graphics
            const eggTexture = this.createEggTexture(randomColor);
            
            eggMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xFFFFFF, // Use white as base, texture provides color
                map: eggTexture,
                metalness: 0.1,
                roughness: 0.3,
                emissive: new THREE.Color(randomColor).multiplyScalar(0.05)
            });
        } else {
            // Simple material for performance mode
            eggMaterial = new THREE.MeshStandardMaterial({ 
                color: randomColor,
                metalness: 0.5,
                roughness: 0.2,
                emissive: new THREE.Color(randomColor).multiplyScalar(0.2)
            });
        }
        
        const egg = new THREE.Mesh(eggGeometry, eggMaterial);
        egg.position.y = 0.5; // Hev egget litt over bakken
        
        // Add shadows in enhanced mode
        if (CONFIG.enhancedGraphics) {
            egg.castShadow = true;
            egg.receiveShadow = true;
        }
        
        eggGroup.add(egg);
        
        // Legg til dekorasjoner med ulike mønstre
        if (CONFIG.enhancedGraphics) {
            // More detailed decorations in enhanced mode
            this.addEnhancedEggDecorations(egg, randomColor);
        } else {
            // Simple decorations for performance mode
            this.addEggDecorations(egg, randomColor);
        }
    },
    
    // Create a detailed egg texture (for enhanced graphics)
    createEggTexture: function(baseColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Convert baseColor to RGB values
        const color = new THREE.Color(baseColor);
        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);
        
        // Base egg color (slightly lighter than the base)
        ctx.fillStyle = `rgb(${Math.min(r+30, 255)}, ${Math.min(g+30, 255)}, ${Math.min(b+30, 255)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add various Easter patterns
        const patternType = Math.floor(Math.random() * 5);
        
        switch (patternType) {
            case 0: // Polka dots
                this.drawPolkaDotPattern(ctx, r, g, b, canvas.width, canvas.height);
                break;
            case 1: // Stripes
                this.drawStripePattern(ctx, r, g, b, canvas.width, canvas.height);
                break;
            case 2: // Zigzag
                this.drawZigzagPattern(ctx, r, g, b, canvas.width, canvas.height);
                break;
            case 3: // Flowers
                this.drawFlowerPattern(ctx, r, g, b, canvas.width, canvas.height);
                break;
            case 4: // Swirls
                this.drawSwirlPattern(ctx, r, g, b, canvas.width, canvas.height);
                break;
        }
        
        // Create and return the texture
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    },
    
    // Draw polka dot pattern
    drawPolkaDotPattern: function(ctx, r, g, b, width, height) {
        // Contrast color
        const contrastR = 255 - r;
        const contrastG = 255 - g;
        const contrastB = 255 - b;
        
        ctx.fillStyle = `rgb(${contrastR}, ${contrastG}, ${contrastB})`;
        
        // Draw dots of various sizes
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = 5 + Math.random() * 15;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    // Draw stripe pattern
    drawStripePattern: function(ctx, r, g, b, width, height) {
        // Contrast color
        const contrastR = 255 - r;
        const contrastG = 255 - g;
        const contrastB = 255 - b;
        
        ctx.strokeStyle = `rgb(${contrastR}, ${contrastG}, ${contrastB})`;
        ctx.lineWidth = 8;
        
        // Draw horizontal or vertical stripes
        const isHorizontal = Math.random() > 0.5;
        const spacing = 20 + Math.random() * 20;
        
        if (isHorizontal) {
            for (let y = 0; y < height; y += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        } else {
            for (let x = 0; x < width; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }
    },
    
    // Draw zigzag pattern
    drawZigzagPattern: function(ctx, r, g, b, width, height) {
        // Contrast color
        const contrastR = 255 - r;
        const contrastG = 255 - g;
        const contrastB = 255 - b;
        
        ctx.strokeStyle = `rgb(${contrastR}, ${contrastG}, ${contrastB})`;
        ctx.lineWidth = 3;
        
        // Draw zigzag lines
        const zigHeight = 15 + Math.random() * 15;
        const spacing = 10 + Math.random() * 15;
        
        for (let y = 0; y < height; y += spacing * 2) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            
            let x = 0;
            while (x < width) {
                ctx.lineTo(x + zigHeight, y + spacing);
                x += zigHeight;
                if (x >= width) break;
                
                ctx.lineTo(x + zigHeight, y);
                x += zigHeight;
            }
            
            ctx.stroke();
        }
    },
    
    // Draw flower pattern
    drawFlowerPattern: function(ctx, r, g, b, width, height) {
        // Generate some complementary colors
        const flowerColors = [
            `rgb(255, 255, 180)`, // Yellow
            `rgb(255, 200, 200)`, // Pink
            `rgb(200, 200, 255)`, // Light blue
            `rgb(200, 255, 200)`, // Light green
            `rgb(255, 220, 180)`  // Light orange
        ];
        
        // Draw flowers randomly
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 10 + Math.random() * 20;
            
            // Draw petals
            ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            for (let p = 0; p < 5; p++) {
                const angle = (p / 5) * Math.PI * 2;
                const px = x + Math.cos(angle) * size;
                const py = y + Math.sin(angle) * size;
                
                ctx.beginPath();
                ctx.ellipse(px, py, size/2, size/2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw center
            ctx.fillStyle = "rgb(255, 255, 0)"; // Yellow center
            ctx.beginPath();
            ctx.arc(x, y, size/3, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    // Draw swirl pattern
    drawSwirlPattern: function(ctx, r, g, b, width, height) {
        // Contrast color
        const contrastR = 255 - r;
        const contrastG = 255 - g;
        const contrastB = 255 - b;
        
        ctx.strokeStyle = `rgb(${contrastR}, ${contrastG}, ${contrastB})`;
        ctx.lineWidth = 3;
        
        // Draw swirls
        for (let i = 0; i < 5; i++) {
            const centerX = Math.random() * width;
            const centerY = Math.random() * height;
            const radius = 20 + Math.random() * 40;
            
            ctx.beginPath();
            
            // Draw spiral
            for (let angle = 0; angle < 10 * Math.PI; angle += 0.1) {
                const r = radius * angle / (10 * Math.PI);
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                
                if (angle === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
    },
    
    // Legger til dekorasjoner på eggene
    addEggDecorations: function(egg, baseColor) {
        // Velg tilfeldig dekorasjonsstil (1-3)
        const decorStyle = Math.floor(Math.random() * 3) + 1;
        
        if (decorStyle === 1) {
            // Stil 1: Sirkler/prikker
            this.addSpotDecorations(egg, baseColor);
        } else if (decorStyle === 2) {
            // Stil 2: Striper
            this.addStripeDecorations(egg, baseColor);
        } else {
            // Stil 3: Sikksakk-mønster
            this.addZigzagDecorations(egg, baseColor);
        }
        
        // Legg til en gullkant på toppen av egget
        const rimGeometry = new THREE.TorusGeometry(0.15, 0.03, 16, 32);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700, // Gull
            metalness: 1,
            roughness: 0.2,
            emissive: 0x997700
        });
        
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.y = 0.6;
        rim.rotation.x = Math.PI/2;
        egg.add(rim);
    },
    
    // Legg til prikk-dekorasjoner
    addSpotDecorations: function(egg, baseColor) {
        // Kontrast-farge til basefargen
        const contrastColor = this.getContrastColor(baseColor);
        
        const dotMaterial = new THREE.MeshStandardMaterial({ 
            color: contrastColor,
            metalness: 0.5,
            roughness: 0.3
        });
        
        // Lag 10-15 tilfeldig plasserte prikker
        const dotCount = 10 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < dotCount; i++) {
            // Varier størrelsen på prikkene
            const dotSize = 0.03 + Math.random() * 0.06;
            const dotGeometry = new THREE.SphereGeometry(dotSize, 8, 8);
            
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            
            // Plasser prikkene på eggets overflate med litt forskyvning
            const phi = 0.2 + Math.random() * 2.7; // Unngå topp og bunn
            const theta = Math.random() * Math.PI * 2;
            
            const radius = 0.42; // Litt større enn egget for å sitte på overflaten
            dot.position.x = radius * Math.sin(phi) * Math.cos(theta);
            dot.position.y = radius * Math.cos(phi);
            dot.position.z = radius * Math.sin(phi) * Math.sin(theta);
            
            // Roter prikken for å følge eggets overflate
            dot.lookAt(egg.position);
            
            egg.add(dot);
        }
    },
    
    // Legg til stripe-dekorasjoner
    addStripeDecorations: function(egg, baseColor) {
        const contrastColor = this.getContrastColor(baseColor);
        
        const stripeMaterial = new THREE.MeshStandardMaterial({ 
            color: contrastColor,
            metalness: 0.5,
            roughness: 0.3
        });
        
        // Lag 4-7 striper
        const stripeCount = 4 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < stripeCount; i++) {
            // Varier tykkelsen på stripene
            const stripeThickness = 0.03 + Math.random() * 0.02;
            // Lag stripe som en torus
            const stripeGeometry = new THREE.TorusGeometry(0.4, stripeThickness, 8, 32);
            
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            
            // Plasser stripene jevnt fordelt over egget med litt variasjon
            const angle = (i / stripeCount) * Math.PI + Math.random() * 0.2 - 0.1;
            
            stripe.position.y = -0.1 + 0.6 * Math.sin(angle);
            stripe.rotation.x = Math.PI/2;
            stripe.scale.set(0.8, 0.8, 1); // Juster for å passe egget
            egg.add(stripe);
        }
    },
    
    // Legg til sikksakk-dekorasjoner
    addZigzagDecorations: function(egg, baseColor) {
        const contrastColor = this.getContrastColor(baseColor);
        
        // Bruk tynne bokser for sikksakk-mønster
        const zigzagMaterial = new THREE.MeshStandardMaterial({ 
            color: contrastColor,
            metalness: 0.5,
            roughness: 0.3
        });
        
        // Opprett 2-3 sett med sikksakk-mønstre
        const setCount = 2 + Math.floor(Math.random() * 2);
        
        for (let s = 0; s < setCount; s++) {
            // Roter hvert sett for variasjon
            const setRotation = (s / setCount) * Math.PI;
            
            // Lag 6-8 segmenter per sett
            const zigzagCount = 6 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < zigzagCount; i++) {
                const zigWidth = 0.15;
                const zigHeight = 0.04;
                const zigDepth = 0.03;
                
                const zigGeometry = new THREE.BoxGeometry(zigWidth, zigHeight, zigDepth);
                
                const zig = new THREE.Mesh(zigGeometry, zigzagMaterial);
                
                // Plasser i sikksakk-mønster rundt egget
                const angle = (i / zigzagCount) * Math.PI * 2;
                const height = -0.2 + 0.8 * (i / zigzagCount);
                
                // Alternerende sikksakk-posisjon
                const radius = 0.43;
                
                zig.position.x = radius * Math.cos(angle + setRotation) * (1 + ((i % 2) * 0.2 - 0.1));
                zig.position.y = height;
                zig.position.z = radius * Math.sin(angle + setRotation) * (1 + ((i % 2) * 0.2 - 0.1));
                
                // Vend mot sentrum
                zig.lookAt(new THREE.Vector3(0, height, 0));
                
                egg.add(zig);
            }
        }
    },
    
    // Hjelpe-funksjon for å finne kontrasterende farge
    getContrastColor: function(baseColor) {
        const color = new THREE.Color(baseColor);
        
        // Inverter fargen for kontrast og juster litt
        const inverted = new THREE.Color(
            1 - color.r,
            1 - color.g,
            1 - color.b
        );
        
        // Juster til en passende kontrastfarge
        if (Math.random() > 0.5) {
            return 0xFFFFFF; // Hvit
        } else if (Math.random() > 0.5) {
            return 0xFFD700; // Gull
        } else {
            return inverted.getHex();
        }
    },
    
    // Legg til partikkeleffekt rundt egget
    addParticleEffect: function(eggGroup, theme) {
        // Partikkelparametere
        const particleCount = 30;
        const particleGeometry = new THREE.BufferGeometry();
        
        // Use theme color for particles
        const particleColor = theme ? theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)] : 0xFFFFFF;
        
        const particleMaterial = new THREE.PointsMaterial({
            color: particleColor,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            map: this.createParticleTexture(),
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Opprett partikkelposisjoner
        const positions = new Float32Array(particleCount * 3);
        const velocities = []; // For å lagre partikkelbevegelse
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Start partiklene i en sfære rundt egget
            const radius = 0.5;
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(theta) * Math.cos(phi);
            positions[i3 + 1] = 0.5 + 0.2 * (Math.random() - 0.5); // Y-posisjon
            positions[i3 + 2] = radius * Math.sin(theta) * Math.sin(phi);
            
            // Lagre hastighet for animasjon
            velocities.push({
                x: (Math.random() - 0.5) * 0.01,
                y: 0.005 + Math.random() * 0.01,
                z: (Math.random() - 0.5) * 0.01
            });
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        particleSystem.userData = {
            velocities: velocities,
            initialPositions: positions.slice() // Kopier startposisjoner
        };
        
        eggGroup.add(particleSystem);
        this.particleSystems.push(particleSystem);
    },
    
    // Opprett partikkeltekstur
    createParticleTexture: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        
        const context = canvas.getContext('2d');
        
        // Tegn en glow-effekt
        const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 16, 16);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    },
    
    // Legg til lyseffekt på egget
    addLightEffect: function(eggGroup, theme) {
        // Punktlys som lyser opp egget
        const light = new THREE.PointLight(0xFFFFFF, 1, 3);
        light.position.set(0, 0.5, 0);
        
        // Use theme-specific color for the light
        const themeColor = theme ? theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)] : 0xFFFFFF;
        
        // Start med en tilfeldig farge fra temaet eller hvit
        const randomColor = Math.random() > 0.5 ? 0xFFFFFF : themeColor;
        
        light.color.set(randomColor);
        light.userData = {
            initialColor: randomColor,
            pulsePhase: Math.random() * Math.PI * 2 // Tilfeldig startfase
        };
        
        eggGroup.add(light);
    },
    
    // Enhanced egg decorations for better graphics
    addEnhancedEggDecorations: function(egg, baseColor) {
        // Add glossy finish
        const glossGeometry = new THREE.SphereGeometry(0.41, 32, 32);
        glossGeometry.scale(1, 1.3, 1);
        
        const glossMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            specular: 0xFFFFFF,
            shininess: 100,
            transparent: true,
            opacity: 0.3,
            depthWrite: false
        });
        
        const gloss = new THREE.Mesh(glossGeometry, glossMaterial);
        egg.add(gloss);
        
        // Add 3D elements based on random selection
        const decorType = Math.floor(Math.random() * 3);
        
        switch (decorType) {
            case 0: // Ribbons
                this.add3DRibbons(egg, baseColor);
                break;
            case 1: // Small gems
                this.add3DGems(egg, baseColor);
                break;
            case 2: // Relief patterns
                this.add3DPatterns(egg, baseColor);
                break;
        }
    },
    
    // Add 3D ribbon decorations
    add3DRibbons: function(egg, baseColor) {
        const contrastColor = this.getContrastColor(baseColor);
        
        // Create ribbon material
        const ribbonMaterial = new THREE.MeshStandardMaterial({
            color: contrastColor,
            metalness: 0.3,
            roughness: 0.5,
            emissive: new THREE.Color(contrastColor).multiplyScalar(0.2)
        });
        
        // Add 2-3 ribbons around the egg
        const ribbonCount = 2 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < ribbonCount; i++) {
            // Create a curved ribbon using a torus segment
            const ribbonWidth = 0.06 + Math.random() * 0.04;
            const ribbonGeometry = new THREE.TorusGeometry(0.4, ribbonWidth, 8, 32, Math.PI * 1.5);
            
            const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
            
            // Position ribbons at different heights and rotations
            const height = -0.2 + (i / ribbonCount) * 0.8;
            ribbon.position.y = height;
            ribbon.rotation.x = Math.PI / 2;
            ribbon.rotation.z = Math.random() * Math.PI * 2;
            
            egg.add(ribbon);
            
            // Add a decorative bow at ribbon intersection
            if (Math.random() > 0.5) {
                const bowGeometry = new THREE.SphereGeometry(ribbonWidth * 1.5, 8, 8);
                const bow = new THREE.Mesh(bowGeometry, ribbonMaterial);
                
                // Calculate position on the ribbon
                const angle = Math.random() * Math.PI * 1.5;
                const bowRadius = 0.4;
                bow.position.set(
                    Math.cos(angle) * bowRadius, 
                    height, 
                    Math.sin(angle) * bowRadius
                );
                
                egg.add(bow);
            }
        }
    },
    
    // Add 3D gems/jewels to egg
    add3DGems: function(egg, baseColor) {
        // Create 5-10 small jewels
        const gemCount = 5 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < gemCount; i++) {
            // Use complementary colors for gems
            const gemColorOptions = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
            const gemColor = gemColorOptions[Math.floor(Math.random() * gemColorOptions.length)];
            
            // Random gem size
            const gemSize = 0.05 + Math.random() * 0.05;
            
            // Create gem using icosahedron (diamond-like)
            const gemGeometry = new THREE.IcosahedronGeometry(gemSize, 0);
            
            const gemMaterial = new THREE.MeshPhongMaterial({
                color: gemColor,
                specular: 0xFFFFFF,
                shininess: 100,
                emissive: new THREE.Color(gemColor).multiplyScalar(0.2)
            });
            
            const gem = new THREE.Mesh(gemGeometry, gemMaterial);
            
            // Place gem at random position on egg surface
            const phi = 0.3 + Math.random() * 2.5; // Avoid exact top/bottom
            const theta = Math.random() * Math.PI * 2;
            const radius = 0.42;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            
            gem.position.set(x, y, z);
            
            // Orient gem to face outward
            gem.lookAt(gem.position.clone().multiplyScalar(2));
            
            // Random rotation to add variety
            gem.rotation.z = Math.random() * Math.PI * 2;
            
            egg.add(gem);
        }
    },
    
    // Add 3D patterns as relief
    add3DPatterns: function(egg, baseColor) {
        const patternType = Math.floor(Math.random() * 3);
        const patternColor = this.getContrastColor(baseColor);
        
        const patternMaterial = new THREE.MeshPhongMaterial({
            color: patternColor,
            specular: 0x222222,
            shininess: 30
        });
        
        switch (patternType) {
            case 0: // Spiral pattern
                this.add3DSpiral(egg, patternMaterial);
                break;
            case 1: // Dots pattern
                this.add3DDots(egg, patternMaterial);
                break;
            case 2: // Line pattern
                this.add3DLines(egg, patternMaterial);
                break;
        }
    },
    
    // Add 3D spiral pattern to egg
    add3DSpiral: function(egg, material) {
        const spiralPoints = [];
        const spiralRadius = 0.4;
        const spiralTurns = 3 + Math.floor(Math.random() * 3);
        
        // Create spiral points
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2 * spiralTurns;
            const height = -0.4 + (i / 50) * 0.8;
            const radius = spiralRadius * Math.sin(Math.PI * (i / 50));
            
            spiralPoints.push(new THREE.Vector3(
                radius * Math.cos(angle),
                height,
                radius * Math.sin(angle)
            ));
        }
        
        // Create curve from points
        const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
        
        // Create tube along the curve
        const spiralGeometry = new THREE.TubeGeometry(
            spiralCurve,
            64,
            0.02 + Math.random() * 0.01,
            8,
            false
        );
        
        const spiral = new THREE.Mesh(spiralGeometry, material);
        egg.add(spiral);
    },
    
    // Add 3D dot pattern
    add3DDots: function(egg, material) {
        const dotCount = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < dotCount; i++) {
            const dotSize = 0.03 + Math.random() * 0.03;
            const dotGeometry = new THREE.SphereGeometry(dotSize, 8, 8);
            
            const dot = new THREE.Mesh(dotGeometry, material);
            
            // Place dots in a symmetrical pattern
            const row = Math.floor(i / 5);
            const col = i % 5;
            
            const phi = 0.3 + (row / 5) * 2.5;
            const theta = (col / 5) * Math.PI * 2;
            
            const radius = 0.42;
            dot.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            
            // Make dot face outward
            dot.lookAt(new THREE.Vector3(0, 0, 0));
            
            egg.add(dot);
        }
    },
    
    // Add 3D line pattern
    add3DLines: function(egg, material) {
        const lineCount = 6 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < lineCount; i++) {
            // Either horizontal or vertical lines
            const isHorizontal = i % 2 === 0;
            
            const lineGeometry = new THREE.CylinderGeometry(
                0.01, 0.01, 
                isHorizontal ? 0.8 : 0.5, 
                8
            );
            
            const line = new THREE.Mesh(lineGeometry, material);
            
            if (isHorizontal) {
                // Horizontal rings around egg
                const height = -0.3 + (i / lineCount) * 0.8;
                line.position.y = height;
                line.rotation.x = Math.PI / 2;
                line.scale.x = 0.8;
                line.scale.z = 0.8;
            } else {
                // Vertical lines from top to bottom
                const angle = (i / lineCount) * Math.PI;
                line.position.x = 0.3 * Math.cos(angle);
                line.position.z = 0.3 * Math.sin(angle);
                line.rotation.x = 0;
                line.rotation.z = Math.PI / 2;
            }
            
            egg.add(line);
        }
    },
    
    // Sjekk om spilleren har plukket opp egg
    checkCollection: function(playerPosition) {
        this.eggs.forEach(egg => {
            if (!egg.userData.collected) {
                const distance = Math.sqrt(
                    Math.pow(playerPosition.x - egg.userData.gridX, 2) + 
                    Math.pow(playerPosition.z - egg.userData.gridZ, 2)
                );
                
                // Increased collection radius from 0.7 to 0.9 to make egg collection more reliable
                if (distance < 0.9) {
                    egg.userData.collected = true;
                    
                    // Play egg collection sound
                    SoundModule.playCollectEgg();
                    
                    // Add points for egg collection with combo
                    const points = HighScoreModule.addEggPoints();
                    
                    // Store the egg position before removing it
                    const eggPosition = {
                        x: egg.position.x,
                        y: egg.position.y,
                        z: egg.position.z
                    };
                    
                    // Make the rabbit hold the egg before it disappears
                    PlayerModule.holdEggAnimation(egg);
                    
                    // Immediately make the original egg invisible
                    egg.visible = false;
                    
                    // Create collection animation particles at the original egg position
                    setTimeout(() => {
                        // Move egg back to original position for animation
                        egg.position.set(eggPosition.x, eggPosition.y, eggPosition.z);
                        
                        // Create collection animation particles 
                        this.createCollectionAnimation(egg, points);
                    }, 1000);
                    
                    CONFIG.eggsFound++;
                    UIModule.updateScoreDisplay();
                    
                    // Sjekk om alle egg er funnet
                    if (CONFIG.eggsFound === CONFIG.totalEggs) {
                        this.handleLevelCompletion();
                    }
                }
            }
        });
    },
    
    // Opprett en oppsamlingsanimasjon når egget samles
    createCollectionAnimation: function(egg, points) {
        // Opprett en 'starburst' effekt
        const burstGeometry = new THREE.BufferGeometry();
        const burstCount = 20;
        const positions = new Float32Array(burstCount * 3);
        const velocities = [];
        
        for (let i = 0; i < burstCount; i++) {
            const i3 = i * 3;
            positions[i3] = 0;
            positions[i3 + 1] = 0.5;
            positions[i3 + 2] = 0;
            
            // Tilfeldige retninger for partikler
            const angle = Math.random() * Math.PI * 2;
            const elevation = Math.random() * Math.PI;
            const speed = 0.05 + Math.random() * 0.1;
            
            velocities.push({
                x: speed * Math.sin(elevation) * Math.cos(angle),
                y: speed * Math.cos(elevation),
                z: speed * Math.sin(elevation) * Math.sin(angle)
            });
        }
        
        burstGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const burstMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            transparent: true,
            opacity: 1,
            map: this.createParticleTexture(),
            blending: THREE.AdditiveBlending
        });
        
        const burst = new THREE.Points(burstGeometry, burstMaterial);
        burst.userData = {
            velocities: velocities,
            age: 0,
            maxAge: 50 // Levetid for animasjonen
        };
        
        egg.add(burst);
        
        // Add points text that floats upward
        if (points > 0) {
            const comboMultiplier = CONFIG.comboMultiplier;
            const scoreColor = comboMultiplier > 1 ? 0xFFD700 : 0xFFFFFF; // Gold for combo
            this.createScoreText(egg, points, scoreColor);
        }
        
        // Gjør egget usynlig etter en kort forsinkelse
        setTimeout(() => {
            egg.visible = false;
        }, 500);
    },
    
    // Create floating score text when egg is collected
    createScoreText: function(egg, points, color = 0xFFFFFF) {
        if (!CONFIG.enhancedGraphics) return; // Skip if not in enhanced mode
        
        // Create canvas for the points text
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw points text with combo info if applicable
        const comboMultiplier = CONFIG.comboMultiplier;
        
        ctx.fillStyle = `rgb(${color >> 16 & 255}, ${color >> 8 & 255}, ${color & 255})`;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (comboMultiplier > 1) {
            // Show combo multiplier and points
            ctx.fillText(`+${points}`, canvas.width / 2, canvas.height / 2 - 10);
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`x${comboMultiplier.toFixed(1)} Combo!`, canvas.width / 2, canvas.height / 2 + 12);
        } else {
            // Just show points with larger font when no combo
            ctx.font = 'bold 32px Arial';
            ctx.fillText(`+${points}`, canvas.width / 2, canvas.height / 2);
        }
        
        // Create sprite with the text
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.position.y = 1;
        sprite.scale.set(1, 0.5, 1);
        
        // Add animation data
        sprite.userData = {
            age: 0,
            maxAge: 60,
            initialY: sprite.position.y
        };
        
        egg.add(sprite);
    },
    
    // Oppdater eggenes rotasjon og effekter
    update: function() {
        // Oppdater egg-rotasjon
        this.eggs.forEach(egg => {
            if (!egg.userData.collected) {
                // Roter egget
                egg.rotation.y += 0.01;
                
                // Animer lys (pulsering)
                const light = egg.children.find(child => child instanceof THREE.PointLight);
                if (light) {
                    const pulse = Math.sin(light.userData.pulsePhase) * 0.5 + 0.5;
                    light.userData.pulsePhase += 0.05;
                    
                    // Juster lysstyrke
                    light.intensity = 0.5 + pulse * 0.5;
                    
                    // Pulse fargen mellom hvit og eggfargen
                    const initialColor = new THREE.Color(light.userData.initialColor);
                    const white = new THREE.Color(0xFFFFFF);
                    light.color.copy(initialColor).lerp(white, pulse * 0.5);
                }
            } else {
                // Håndter oppsamlingsanimasjonen hvis egget er samlet
                const burst = egg.children.find(child => 
                    child instanceof THREE.Points && child.userData.age !== undefined);
                    
                if (burst) {
                    burst.userData.age++;
                    
                    // Oppdater partikkelposisjoner
                    const positions = burst.geometry.attributes.position.array;
                    
                    for (let i = 0; i < burst.userData.velocities.length; i++) {
                        const i3 = i * 3;
                        const vel = burst.userData.velocities[i];
                        
                        positions[i3] += vel.x;
                        positions[i3 + 1] += vel.y;
                        positions[i3 + 2] += vel.z;
                        
                        // Legg til litt gravitasjon
                        vel.y -= 0.002;
                    }
                    
                    burst.geometry.attributes.position.needsUpdate = true;
                    
                    // Reduser gjennomsiktighet mot slutten av animasjonen
                    if (burst.userData.age > burst.userData.maxAge * 0.7) {
                        const opacity = 1 - ((burst.userData.age - burst.userData.maxAge * 0.7) / 
                                           (burst.userData.maxAge * 0.3));
                        burst.material.opacity = Math.max(0, opacity);
                    }
                    
                    // Fjern animasjonen når den er ferdig
                    if (burst.userData.age >= burst.userData.maxAge) {
                        egg.remove(burst);
                    }
                }
            }
        });
        
        // Oppdater partikkeleffekter
        this.particleSystems.forEach(particles => {
            const positions = particles.geometry.attributes.position.array;
            const initialPositions = particles.userData.initialPositions;
            
            // Ikke animer partikler for oppsamlede egg
            if (particles.parent && particles.parent.userData.collected) return;
            
            for (let i = 0; i < particles.userData.velocities.length; i++) {
                const i3 = i * 3;
                const vel = particles.userData.velocities[i];
                
                // Oppdater posisjon
                positions[i3] += vel.x;
                positions[i3 + 1] += vel.y;
                positions[i3 + 2] += vel.z;
                
                // Beveg i spiral-mønster
                vel.x = Math.sin(particles.parent.rotation.y + i * 0.1) * 0.007;
                vel.z = Math.cos(particles.parent.rotation.y + i * 0.1) * 0.007;
                
                // Sett partikler tilbake hvis de beveger seg for langt
                const distance = Math.sqrt(
                    Math.pow(positions[i3] - initialPositions[i3], 2) +
                    Math.pow(positions[i3 + 1] - initialPositions[i3 + 1], 2) +
                    Math.pow(positions[i3 + 2] - initialPositions[i3 + 2], 2)
                );
                
                if (distance > 1) {
                    // Reset til startposisjon med litt tilfeldighet
                    positions[i3] = initialPositions[i3] + (Math.random() - 0.5) * 0.1;
                    positions[i3 + 1] = initialPositions[i3 + 1] + (Math.random() - 0.5) * 0.1;
                    positions[i3 + 2] = initialPositions[i3 + 2] + (Math.random() - 0.5) * 0.1;
                }
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
        });
    },
    
    // Håndter nivåfullføring
    handleLevelCompletion: function() {
        CONFIG.isLevelCompleted = true;
        
        // Play level completion sound
        SoundModule.playLevelComplete();
        
        if (CONFIG.currentLevel < CONFIG.totalLevels) {
            // Automatisk last neste nivå når alle egg er funnet
            GameModule.loadNextLevel();
        } else {
            // Play game completion sound if this was the final level
            SoundModule.playGameComplete();
            
            // Vis spill-fullført melding hvis dette var siste nivå
            UIModule.showGameCompletedMessage();
            CONFIG.isGameOver = true;
        }
    },
    
    // Fjern egg fra scenen
    removeAllEggs: function() {
        this.eggs.forEach(egg => {
            CONFIG.scene.remove(egg);
        });
        this.eggs = [];
        this.particleSystems = [];
    }
};