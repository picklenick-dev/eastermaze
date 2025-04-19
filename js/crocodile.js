// Håndterer krokodille-fiender
import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { PlayerModule } from './player.js';
import { UIModule } from './ui.js';
import { GameModule } from './game.js';
import { SoundModule } from './sound.js';

export const CrocodileModule = {
    crocodiles: [],
    
    // Oppretter krokodiller for gjeldende nivå
    createCrocodiles: function() {
        this.crocodiles = [];
        
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeDesign = currentLevel.mazeDesign;
        const mazeSize = mazeDesign.length;
        
        // Finn alle krokodille-posisjoner (verdi 3 i maze-design)
        for (let i = 0; i < mazeDesign.length; i++) {
            for (let j = 0; j < mazeDesign[i].length; j++) {
                if (mazeDesign[i][j] === 3) {
                    // Erstatt krokodille-markøren med åpen bane (verdi 0) i labyrinten
                    mazeDesign[i][j] = 0;
                    
                    // Opprett krokodille på denne posisjonen
                    this.createCrocodile(j, i, mazeSize);
                }
            }
        }
        
        // Hvis det ikke er noen krokodiller i nivådesignet, men vi ønsker å legge til basert på nivå
        if (this.crocodiles.length === 0 && CONFIG.currentLevel > 1) {
            // Legg til krokodiller basert på nivå
            this.addDynamicCrocodiles(mazeDesign, mazeSize);
        }
    },
    
    // Legger til dynamiske krokodiller basert på nivå
    addDynamicCrocodiles: function(mazeDesign, mazeSize) {
        const level = CONFIG.currentLevel;
        const numCrocodiles = Math.min(level - 1, 5); // Gradvis øke antall krokodiller opp til 5
        
        let added = 0;
        let attempts = 0;
        const maxAttempts = 100; // Unngå uendelige løkker
        
        // Finn egnet sted for krokodiller (borte fra startposisjonen)
        while (added < numCrocodiles && attempts < maxAttempts) {
            attempts++;
            
            // Finn et tilfeldig punkt i labyrinten
            const x = Math.floor(Math.random() * (mazeDesign[0].length - 2)) + 1;
            const z = Math.floor(Math.random() * (mazeDesign.length - 2)) + 1;
            
            // Sjekk om det er en åpen plass (0) og ikke ved startposisjonen (2)
            if (mazeDesign[z][x] === 0) {
                // Sjekk avstand fra start (unngå å plassere for nær spillerens startposisjon)
                let tooCloseToStart = false;
                
                for (let i = 0; i < mazeDesign.length; i++) {
                    for (let j = 0; j < mazeDesign[i].length; j++) {
                        if (mazeDesign[i][j] === 2) {
                            const distance = Math.sqrt(Math.pow(x - j, 2) + Math.pow(z - i, 2));
                            
                            // Unngå å plassere krokodiller for nært spillerens startposisjon
                            // Gjør avstanden større på lavere nivåer
                            const minDistance = 7 - (level - 1) * 0.5; // Mindre avstand på høyere nivåer
                            if (distance < minDistance) {
                                tooCloseToStart = true;
                                break;
                            }
                        }
                    }
                    if (tooCloseToStart) break;
                }
                
                if (!tooCloseToStart) {
                    // Opprett krokodille på denne posisjonen
                    this.createCrocodile(x, z, mazeSize);
                    added++;
                }
            }
        }
    },
    
    // Opprett en enkelt krokodille
    createCrocodile: function(x, z, mazeSize) {
        // Opprett krokodille-gruppen
        const crocodile = new THREE.Group();
        
        // Sett posisjon
        crocodile.position.set(
            x * 2 - mazeSize,
            0,
            z * 2 - mazeSize
        );
        
        // Opprett krokodille-modellen
        this.createCrocodileModel(crocodile);
        
        // Juster hastighet basert på nivå (raskere på høyere nivåer)
        const levelSpeedFactor = 1.5 + (CONFIG.currentLevel - 1) * 0.15; // Øker hastigheten med 15% per nivå, starter på 1.5x
        const baseInterval = 800 - (CONFIG.currentLevel - 1) * 50; // Raskere oppdateringsintervall (lavere verdi)
        const intervalRange = 200 - (CONFIG.currentLevel - 1) * 20; // Mindre tilfeldighet på høyere nivåer
        
        // Legg til krokodille-data for AI og kollisjonsdeteksjon
        crocodile.userData = {
            gridX: x,
            gridZ: z,
            moveTime: 0,
            moveInterval: baseInterval + Math.random() * intervalRange, // Justert bevegelsesintervall
            mouthOpen: false,
            mouthAngle: 0,
            mouthDirection: 1, // 1 for åpning, -1 for lukking
            rotationAngle: 0,
            currentPath: null,
            pathIndex: 0,
            lastPathfinding: 0,
            pathfindingInterval: 1000 - (CONFIG.currentLevel - 1) * 30, // Oppdater sti oftere på høyere nivåer
            target: { x: 0, z: 0 },
            speedFactor: levelSpeedFactor, // Hastighetsmodifikator basert på nivå
            
            // Sovende tilstand
            isSleeping: false,
            sleepTime: 0,
            sleepDuration: Math.random() * 4000 + 1000, // Tilfeldig sovetid mellom 1-5 sekunder
            awakeTime: 0,
            awakeDuration: Math.random() * 8000 + 7000, // Tilfeldig våken tid mellom 7-15 sekunder
            sleepZtext: null, // Referanse til Z-teksten som vises når krokodillen sover
            originalHeight: 0 // For å lagre opprinnelig høyde når krokodillen legger seg ned
        };
        
        // Legg til i scene og array
        CONFIG.scene.add(crocodile);
        this.crocodiles.push(crocodile);
    },
    
    // Opprett krokodille-modellen
    createCrocodileModel: function(crocodileGroup) {
        // Farger
        const bodyColor = 0x2D6935; // Mørkegrønn
        const bellyColor = 0xC9E4A7; // Lysegrønn
        
        // Kropp
        const bodyGeometry = new THREE.BoxGeometry(1, 0.4, 1.8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.3;
        crocodileGroup.add(body);
        
        // Buk
        const bellyGeometry = new THREE.BoxGeometry(0.9, 0.1, 1.6);
        const bellyMaterial = new THREE.MeshPhongMaterial({ color: bellyColor });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.position.y = 0.15;
        crocodileGroup.add(belly);
        
        // Hode
        const headGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.8);
        const headMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.4, 0.9);
        crocodileGroup.add(head);
        
        // Munn - øvre del
        const upperJawGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.6);
        const jawMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
        const upperJaw = new THREE.Mesh(upperJawGeometry, jawMaterial);
        upperJaw.position.set(0, 0.4, 1.5);
        upperJaw.userData = { isUpperJaw: true };
        crocodileGroup.add(upperJaw);
        
        // Munn - nedre del
        const lowerJawGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.6);
        const lowerJawMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
        const lowerJaw = new THREE.Mesh(lowerJawGeometry, lowerJawMaterial);
        lowerJaw.position.set(0, 0.25, 1.5);
        lowerJaw.userData = { isLowerJaw: true };
        crocodileGroup.add(lowerJaw);
        
        // Tenner - øvre munn
        const createTeeth = (jaw, y, isUpper) => {
            const toothGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
            const toothMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
            
            const positions = [
                { x: -0.2, z: 0.25 },
                { x: -0.1, z: 0.25 },
                { x: 0.1, z: 0.25 },
                { x: 0.2, z: 0.25 },
                { x: -0.2, z: 0 },
                { x: 0.2, z: 0 }
            ];
            
            for (const pos of positions) {
                const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
                tooth.position.set(pos.x, y, pos.z);
                
                if (isUpper) {
                    tooth.rotation.x = Math.PI;
                }
                
                jaw.add(tooth);
            }
        };
        
        createTeeth(upperJaw, -0.1, true);
        createTeeth(lowerJaw, 0.075, false);
        
        // Øyne
        const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.25, 0.5, 0.8);
        crocodileGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.25, 0.5, 0.8);
        crocodileGroup.add(rightEye);
        
        // Pupiller
        const pupilGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(0, 0, 0.08);
        leftEye.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0, 0, 0.08);
        rightEye.add(rightPupil);
        
        // Hale
        const tailGeometry = new THREE.BoxGeometry(0.4, 0.25, 1.2);
        tailGeometry.translate(0, 0, -0.6); // Flytt origo til bakenden
        const tailMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.3, -0.5);
        tail.userData = { isTail: true };
        crocodileGroup.add(tail);
        
        // Ben
        const legGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.4);
        const legMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
        
        const positions = [
            { x: -0.4, z: 0.6 }, // fremre venstre
            { x: 0.4, z: 0.6 },  // fremre høyre
            { x: -0.4, z: -0.4 }, // bakre venstre
            { x: 0.4, z: -0.4 }   // bakre høyre
        ];
        
        positions.forEach((pos, i) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, 0.15, pos.z);
            leg.userData = { isLeg: true, legIndex: i };
            crocodileGroup.add(leg);
        });
    },
    
    // Fjern alle krokodiller
    removeAllCrocodiles: function() {
        this.crocodiles.forEach(crocodile => {
            CONFIG.scene.remove(crocodile);
        });
        this.crocodiles = [];
    },
    
    // Finn korteste vei fra krokodille til spiller (A* algoritme)
    findPath: function(crocodile, playerPosition, mazeDesign) {
        const startX = Math.round(crocodile.userData.gridX);
        const startZ = Math.round(crocodile.userData.gridZ);
        const targetX = Math.round(playerPosition.x);
        const targetZ = Math.round(playerPosition.z);
        
        // Hvis spiller er veldig nær, returner direkte vei
        if (Math.abs(startX - targetX) + Math.abs(startZ - targetZ) <= 2) {
            return [{ x: targetX, z: targetZ }];
        }
        
        const openSet = [];
        const closedSet = new Set();
        const gScore = {}; // Kostnad fra start til node
        const fScore = {}; // Estimert total kostnad fra start til mål gjennom node
        const cameFrom = {}; // For å rekonstruere veien
        
        // Legg til startpunktet
        const startKey = `${startX},${startZ}`;
        openSet.push({ x: startX, z: startZ, key: startKey });
        gScore[startKey] = 0;
        fScore[startKey] = this.heuristic(startX, startZ, targetX, targetZ);
        
        while (openSet.length > 0) {
            // Finn noden med lavest fScore
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (fScore[openSet[i].key] < fScore[openSet[currentIndex].key]) {
                    currentIndex = i;
                }
            }
            
            const current = openSet[currentIndex];
            
            // Hvis vi har nådd målet
            if (current.x === targetX && current.z === targetZ) {
                return this.reconstructPath(cameFrom, current);
            }
            
            // Fjern current fra openSet og legg til i closedSet
            openSet.splice(currentIndex, 1);
            closedSet.add(current.key);
            
            // Sjekk naboer (opp, ned, venstre, høyre)
            const neighbors = [
                { x: current.x, z: current.z - 1 }, // opp
                { x: current.x, z: current.z + 1 }, // ned
                { x: current.x - 1, z: current.z }, // venstre
                { x: current.x + 1, z: current.z }  // høyre
            ];
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.z}`;
                
                // Fortsett hvis vi allerede har vurdert denne naboen
                if (closedSet.has(neighborKey)) continue;
                
                // Sjekk om naboen er gyldig (innenfor labyrinten og ikke en vegg)
                if (neighbor.x < 0 || neighbor.x >= mazeDesign[0].length ||
                    neighbor.z < 0 || neighbor.z >= mazeDesign.length ||
                    mazeDesign[neighbor.z][neighbor.x] === 1) {
                    continue;
                }
                
                // Beregn gScore for naboen
                const tentativeGScore = gScore[current.key] + 1;
                
                // Legg til naboen i openSet hvis den ikke er der allerede
                const neighborInOpenSet = openSet.find(node => node.key === neighborKey);
                if (!neighborInOpenSet) {
                    openSet.push({ ...neighbor, key: neighborKey });
                } else if (tentativeGScore >= gScore[neighborKey]) {
                    // Hvis denne veien til naboen er dårligere, ignorer den
                    continue;
                }
                
                // Dette er den beste veien så langt, lagre den
                cameFrom[neighborKey] = current;
                gScore[neighborKey] = tentativeGScore;
                fScore[neighborKey] = gScore[neighborKey] + this.heuristic(neighbor.x, neighbor.z, targetX, targetZ);
            }
        }
        
        // Ingen vei funnet
        return null;
    },
    
    // Heuristisk funksjon for A* algoritmen (Manhattan distanse)
    heuristic: function(x1, z1, x2, z2) {
        return Math.abs(x1 - x2) + Math.abs(z1 - z2);
    },
    
    // Rekonstruer veien
    reconstructPath: function(cameFrom, current) {
        const path = [current];
        let currentKey = current.key;
        
        while (cameFrom[currentKey]) {
            current = cameFrom[currentKey];
            currentKey = current.key;
            path.unshift(current);
        }
        
        // Fjern startpunktet fra veien
        path.shift();
        
        return path;
    },
    
    // Oppdater alle krokodiller
    update: function() {
        if (CONFIG.isGameOver || CONFIG.isLevelCompleted || !CONFIG.timerActive) return;
        
        const now = Date.now();
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeDesign = currentLevel.mazeDesign;
        const playerPosition = PlayerModule.playerPosition;
        
        this.crocodiles.forEach(crocodile => {
            // Håndter sovesyklus
            this.updateSleepCycle(crocodile, now);
            
            // Hvis krokodillen sover, ikke gjør noe mer
            if (crocodile.userData.isSleeping) {
                return;
            }
            
            // Animer munn åpning/lukking
            this.animateCrocodileMouth(crocodile);
            
            // Animer hale og ben
            this.animateCrocodileBody(crocodile);
            
            // Beveg krokodillen
            if (now - crocodile.userData.moveTime > crocodile.userData.moveInterval) {
                crocodile.userData.moveTime = now;
                
                // Oppdater sti til spiller
                if (now - crocodile.userData.lastPathfinding > crocodile.userData.pathfindingInterval) {
                    crocodile.userData.lastPathfinding = now;
                    crocodile.userData.currentPath = this.findPath(crocodile, playerPosition, mazeDesign);
                    crocodile.userData.pathIndex = 0;
                }
                
                this.moveCrocodile(crocodile, playerPosition, mazeDesign);
            }
            
            // Sjekk kollisjon med spiller
            this.checkPlayerCollision(crocodile, playerPosition);
        });
    },
    
    // Oppdater krokodillens sovesyklus
    updateSleepCycle: function(crocodile, now) {
        const userData = crocodile.userData;
        
        // Hvis krokodillen sover
        if (userData.isSleeping) {
            // Sjekk om det er på tide å våkne
            if (now - userData.sleepTime > userData.sleepDuration) {
                this.wakeUpCrocodile(crocodile, now);
            }
        } 
        // Hvis krokodillen er våken
        else {
            // Sjekk om det er på tide å sove
            if (now - userData.awakeTime > userData.awakeDuration) {
                this.putCrocodileToSleep(crocodile, now);
            }
        }
    },
    
    // Få krokodillen til å sovne
    putCrocodileToSleep: function(crocodile, now) {
        const userData = crocodile.userData;
        
        // Oppdater tilstand
        userData.isSleeping = true;
        userData.sleepTime = now;
        userData.sleepDuration = Math.random() * 4000 + 1000; // 1-5 sekunder
        
        // Vis visuell indikasjon på at krokodillen sover
        
        // 1. Legg krokodillen ned (senk høyden og roter litt)
        const body = crocodile.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry && !child.userData.isLeg);
        if (body) {
            userData.originalHeight = body.position.y;
            body.position.y = 0.15; // Senk kroppen nærmere bakken
        }
        
        // 2. Lukk øynene (skaler ned pupiller)
        const eyes = crocodile.children.filter(child => 
            child instanceof THREE.Mesh && 
            child.geometry instanceof THREE.SphereGeometry && 
            child.material.color.getHex() === 0xFFFF00
        );
        
        eyes.forEach(eye => {
            const pupil = eye.children[0];
            if (pupil) {
                pupil.scale.set(0.5, 0.1, 1); // Flat pupill = lukket øye
            }
        });
        
        // 3. Legg til "Zzz" over krokodillen
        this.createSleepZText(crocodile);
    },
    
    // Få krokodillen til å våkne
    wakeUpCrocodile: function(crocodile, now) {
        const userData = crocodile.userData;
        
        // Sjekk om det er en spiller nær krokodillen
        const playerPosition = PlayerModule.playerPosition;
        const distance = Math.sqrt(
            Math.pow(crocodile.userData.gridX - playerPosition.x, 2) + 
            Math.pow(crocodile.userData.gridZ - playerPosition.z, 2)
        );
        
        // Hvis spilleren er for nær, forleng sovetid istedenfor å våkne
        if (distance < 1.5) {
            userData.sleepTime = now;
            userData.sleepDuration = Math.random() * 2000 + 2000; // 2-4 sekunder ekstra søvn
            return;
        }
        
        // Oppdater tilstand
        userData.isSleeping = false;
        userData.awakeTime = now;
        userData.awakeDuration = Math.random() * 8000 + 7000; // 7-15 sekunder
        
        // Fjern visuell indikasjon på søvn
        
        // 1. Reis krokodillen opp igjen
        const body = crocodile.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry && !child.userData.isLeg);
        if (body && userData.originalHeight) {
            body.position.y = userData.originalHeight;
        }
        
        // 2. Åpne øynene (gjenopprett pupiller)
        const eyes = crocodile.children.filter(child => 
            child instanceof THREE.Mesh && 
            child.geometry instanceof THREE.SphereGeometry && 
            child.material.color.getHex() === 0xFFFF00
        );
        
        eyes.forEach(eye => {
            const pupil = eye.children[0];
            if (pupil) {
                pupil.scale.set(1, 1, 1); // Normal pupill = åpent øye
            }
        });
        
        // 3. Fjern "Zzz" teksten
        if (userData.sleepZText) {
            crocodile.remove(userData.sleepZText);
            userData.sleepZText = null;
        }
    },
    
    // Opprett "Zzz" tekst over sovende krokodille
    createSleepZText: function(crocodile) {
        const loader = new THREE.FontLoader();
        
        // Bruk en standard font
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
            const textOptions = {
                font: font,
                size: 0.5,
                height: 0.1,
                curveSegments: 12,
                bevelEnabled: false
            };
            
            const textGeometry = new THREE.TextGeometry('Zzz', textOptions);
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            
            // Plasser teksten over krokodillen
            textMesh.position.set(0, 1.5, 0);
            
            // Legg til animasjon
            const animate = function() {
                if (textMesh && textMesh.parent) {
                    textMesh.rotation.y += 0.02;
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
            
            // Lagre referanse til teksten
            crocodile.userData.sleepZText = textMesh;
            crocodile.add(textMesh);
        });
    },
    
    // Animer krokodillemunn
    animateCrocodileMouth: function(crocodile) {
        // Finn kjeven
        const upperJaw = crocodile.children.find(child => child.userData && child.userData.isUpperJaw);
        const lowerJaw = crocodile.children.find(child => child.userData && child.userData.isLowerJaw);
        
        if (upperJaw && lowerJaw) {
            // Oppdater munnvinkel
            crocodile.userData.mouthAngle += 0.05 * crocodile.userData.mouthDirection;
            
            // Bytt retning når vi når grensene
            if (crocodile.userData.mouthAngle >= 0.4) {
                crocodile.userData.mouthDirection = -1;
            } else if (crocodile.userData.mouthAngle <= 0) {
                crocodile.userData.mouthDirection = 1;
            }
            
            // Animer kjever
            upperJaw.rotation.x = -crocodile.userData.mouthAngle / 2;
            lowerJaw.rotation.x = crocodile.userData.mouthAngle;
        }
    },
    
    // Animer krokodille kropp (hale og ben)
    animateCrocodileBody: function(crocodile) {
        // Animer hale
        const tail = crocodile.children.find(child => child.userData && child.userData.isTail);
        if (tail) {
            crocodile.userData.rotationAngle += 0.05;
            tail.rotation.y = Math.sin(crocodile.userData.rotationAngle) * 0.2;
        }
        
        // Animer ben
        crocodile.children.forEach(child => {
            if (child.userData && child.userData.isLeg) {
                const legIndex = child.userData.legIndex;
                // Motsatt fase for diagonalt motsatte ben
                const offset = legIndex * Math.PI/2;
                child.position.y = 0.15 + Math.sin(crocodile.userData.rotationAngle + offset) * 0.05;
            }
        });
    },
    
    // Beveg krokodillen mot spilleren
    moveCrocodile: function(crocodile, playerPosition, mazeDesign) {
        // Hvis vi har en sti å følge
        if (crocodile.userData.currentPath && crocodile.userData.currentPath.length > 0) {
            const pathIndex = crocodile.userData.pathIndex;
            
            if (pathIndex < crocodile.userData.currentPath.length) {
                // Få neste mål på stien
                const target = crocodile.userData.currentPath[pathIndex];
                crocodile.userData.target = target;
                
                // Beregn retning til målet
                const direction = new THREE.Vector2(
                    target.x - crocodile.userData.gridX,
                    target.z - crocodile.userData.gridZ
                );
                
                // Normaliser hvis vi har en retning
                if (direction.length() > 0) {
                    direction.normalize();
                }
                
                // Beveg mot målet - juster hastighet basert på nivå
                const speedFactor = crocodile.userData.speedFactor || 1;
                const moveSpeed = 0.15 * speedFactor;
                const newX = crocodile.userData.gridX + direction.x * moveSpeed;
                const newZ = crocodile.userData.gridZ + direction.y * moveSpeed;
                
                // Sjekk om vi har nådd målet
                const distanceToTarget = Math.sqrt(
                    Math.pow(target.x - newX, 2) + Math.pow(target.z - newZ, 2)
                );
                
                if (distanceToTarget < 0.1) {
                    // Gå til neste punkt på stien
                    crocodile.userData.pathIndex++;
                }
                
                // Sjekk om ny posisjon kolliderer med en vegg
                const gridX = Math.round(newX);
                const gridZ = Math.round(newZ);
                
                if (gridX >= 0 && gridX < mazeDesign[0].length && 
                    gridZ >= 0 && gridZ < mazeDesign.length && 
                    mazeDesign[gridZ][gridX] !== 1) {
                    
                    // Oppdater posisjon i grid
                    crocodile.userData.gridX = newX;
                    crocodile.userData.gridZ = newZ;
                    
                    // Oppdater faktisk posisjon
                    const mazeSize = mazeDesign.length;
                    crocodile.position.set(
                        newX * 2 - mazeSize,
                        0,
                        newZ * 2 - mazeSize
                    );
                    
                    // Roter krokodillen i retning av bevegelsen
                    if (direction.length() > 0) {
                        const angle = Math.atan2(direction.x, direction.y);
                        crocodile.rotation.y = angle;
                    }
                } else {
                    // Hvis veien er blokkert, beregn ny sti
                    crocodile.userData.lastPathfinding = 0; // Dette vil tvinge en ny sti-beregning neste gang
                }
            }
        } else {
            // Beveg direkte mot spilleren hvis vi ikke har en sti
            const direction = new THREE.Vector2(
                playerPosition.x - crocodile.userData.gridX,
                playerPosition.z - crocodile.userData.gridZ
            );
            
            // Normaliser hvis vi har en retning
            if (direction.length() > 0) {
                direction.normalize();
            }
            
            // Beveg mot spilleren - juster hastighet basert på nivå
            const speedFactor = crocodile.userData.speedFactor || 1;
            const moveSpeed = 0.08 * speedFactor;
            const newX = crocodile.userData.gridX + direction.x * moveSpeed;
            const newZ = crocodile.userData.gridZ + direction.y * moveSpeed;
            
            // Sjekk om ny posisjon kolliderer med en vegg
            const gridX = Math.round(newX);
            const gridZ = Math.round(newZ);
            
            if (gridX >= 0 && gridX < mazeDesign[0].length && 
                gridZ >= 0 && gridZ < mazeDesign.length && 
                mazeDesign[gridZ][gridX] !== 1) {
                
                // Oppdater posisjon i grid
                crocodile.userData.gridX = newX;
                crocodile.userData.gridZ = newZ;
                
                // Oppdater faktisk posisjon
                const mazeSize = mazeDesign.length;
                crocodile.position.set(
                    newX * 2 - mazeSize,
                    0,
                    newZ * 2 - mazeSize
                );
                
                // Roter krokodillen i retning av bevegelsen
                if (direction.length() > 0) {
                    const angle = Math.atan2(direction.x, direction.y);
                    crocodile.rotation.y = angle;
                }
            } else {
                // Tvinge en ny sti-beregning siden direkte bevegelse ble blokkert
                crocodile.userData.lastPathfinding = 0;
            }
        }
    },
    
    // Sjekk kollisjon med spiller
    checkPlayerCollision: function(crocodile, playerPosition) {
        // Hvis spilleren er død, ikke sjekk kollisjon
        if (CONFIG.isGameOver) return;
        
        // Hvis krokodillen sover, la spilleren passere trygt
        if (crocodile.userData.isSleeping) {
            return;
        }
        
        // Beregn avstand mellom krokodille og spiller
        const distance = Math.sqrt(
            Math.pow(crocodile.userData.gridX - playerPosition.x, 2) + 
            Math.pow(crocodile.userData.gridZ - playerPosition.z, 2)
        );
        
        // Kollisjon hvis nær nok
        if (distance < 1.0) {
            // Spill krokodille-bit lyd
            SoundModule.playCrocodileBite();
            
            // Vis dødsmeldingen
            UIModule.showCrocodileDeathMessage();
            
            // Sett spilltilstand
            CONFIG.isGameOver = true;
            CONFIG.timerActive = false;
            
            // Animer at krokodillen spiser spilleren
            this.animateEatingPlayer(crocodile);
        }
    },
    
    // Animer at krokodillen spiser spilleren
    animateEatingPlayer: function(crocodile) {
        // Åpne munnen helt
        const upperJaw = crocodile.children.find(child => child.userData && child.userData.isUpperJaw);
        const lowerJaw = crocodile.children.find(child => child.userData && child.userData.isLowerJaw);
        
        if (upperJaw && lowerJaw) {
            // Åpne munnen helt
            upperJaw.rotation.x = -0.5;
            lowerJaw.rotation.x = 1.0;
            
            // Flytt krokodillen til spillerens posisjon
            const player = PlayerModule.player;
            if (player) {
                crocodile.lookAt(player.position);
                
                // Animer krokodillen som "spiser" spilleren
                let step = 0;
                const maxSteps = 20;
                
                const animateEating = () => {
                    step++;
                    
                    if (step <= maxSteps) {
                        // Beveg mot spilleren
                        crocodile.position.lerp(player.position, 0.1);
                        
                        if (step === maxSteps) {
                            // Lukk munnen på slutten
                            upperJaw.rotation.x = -0.1;
                            lowerJaw.rotation.x = 0.2;
                            
                            // Skjul spilleren
                            if (player) {
                                player.visible = false;
                            }
                        }
                        
                        requestAnimationFrame(animateEating);
                    }
                };
                
                animateEating();
            }
        }
    }
};