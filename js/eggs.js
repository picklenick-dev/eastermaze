// filepath: c:\Development\easter-labrynth\js\eggs.js
// Håndterer påskeegg
import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { PlayerModule } from './player.js';
import { UIModule } from './ui.js';
import { GameModule } from './game.js';
import { SoundModule } from './sound.js';

export const EggModule = {
    eggs: [],
    particleSystems: [],
    
    // Oppretter påskeegg for gjeldende nivå
    createEggs: function() {
        this.eggs = [];
        this.particleSystems = [];
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeSize = currentLevel.mazeDesign.length;
        const mazeDesign = currentLevel.mazeDesign;
        
        currentLevel.eggPositions.forEach(pos => {
            // Sjekk om posisjonen er gyldig (ikke en vegg)
            const x = pos[0];
            const z = pos[1];
            
            // Sjekk om det er en vegg (1) i denne posisjonen
            if (mazeDesign[z] && mazeDesign[z][x] === 1) {
                console.warn(`Egg at position [${x}, ${z}] is inside a wall! Skipping this egg.`);
                return; // Hopp over egget hvis det er i en vegg
            }
            
            // Opprett en gruppe for egget og dets effekter
            const eggGroup = new THREE.Group();
            
            // Opprett et detaljert påskeegg
            this.createFancyEgg(eggGroup);
            
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
            this.addParticleEffect(eggGroup);
            
            // Legg til lyseffekt
            this.addLightEffect(eggGroup);
            
            this.eggs.push(eggGroup);
            CONFIG.scene.add(eggGroup);
        });
        
        CONFIG.totalEggs = this.eggs.length;
        CONFIG.eggsFound = 0;
        UIModule.updateScoreDisplay();
    },
    
    // Oppretter et detaljert påskeegg
    createFancyEgg: function(eggGroup) {
        // Lag en eggform (spiss på toppen, rundere på bunnen)
        const eggGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        eggGeometry.scale(0.8, 1.1, 0.8);
        
        // Velg tilfeldig grunnfarge for egget
        const randomColor = CONFIG.colors.eggColors[Math.floor(Math.random() * CONFIG.colors.eggColors.length)];
        
        // Bruk avanserte materialer med tekstur
        const eggMaterial = new THREE.MeshStandardMaterial({ 
            color: randomColor,
            metalness: 0.5,
            roughness: 0.2,
            emissive: new THREE.Color(randomColor).multiplyScalar(0.2)
        });
        
        const egg = new THREE.Mesh(eggGeometry, eggMaterial);
        egg.position.y = 0.5; // Hev egget litt over bakken
        eggGroup.add(egg);
        
        // Legg til dekorasjoner med ulike mønstre
        this.addEggDecorations(egg, randomColor);
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
    addParticleEffect: function(eggGroup) {
        // Partikkelparametere
        const particleCount = 30;
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
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
    addLightEffect: function(eggGroup) {
        // Punktlys som lyser opp egget
        const light = new THREE.PointLight(0xFFFFFF, 1, 3);
        light.position.set(0, 0.5, 0);
        
        // Start med en tilfeldig farge eller hvit
        const randomColor = Math.random() > 0.5 
            ? 0xFFFFFF 
            : CONFIG.colors.eggColors[Math.floor(Math.random() * CONFIG.colors.eggColors.length)];
        
        light.color.set(randomColor);
        light.userData = {
            initialColor: randomColor,
            pulsePhase: Math.random() * Math.PI * 2 // Tilfeldig startfase
        };
        
        eggGroup.add(light);
    },
    
    // Sjekk om spilleren har plukket opp egg
    checkCollection: function(playerPosition) {
        this.eggs.forEach(egg => {
            if (!egg.userData.collected) {
                const distance = Math.sqrt(
                    Math.pow(playerPosition.x - egg.userData.gridX, 2) + 
                    Math.pow(playerPosition.z - egg.userData.gridZ, 2)
                );
                
                if (distance < 0.7) {
                    egg.userData.collected = true;
                    
                    // Play egg collection sound
                    SoundModule.playCollectEgg();
                    
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
                        this.createCollectionAnimation(egg);
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
    createCollectionAnimation: function(egg) {
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
        
        // Gjør egget usynlig etter en kort forsinkelse
        setTimeout(() => {
            egg.visible = false;
        }, 500);
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