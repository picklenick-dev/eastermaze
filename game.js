// Variabler for Three.js
let scene, camera, renderer;
let player, maze, eggs = [];
let eggsFound = 0, totalEggs = 0;
let isGameOver = false;

// Labyrintdesign (1 er vegg, 0 er sti, 2 er startpunktet)
const mazeDesign = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Egg-posisjoner (x, z)
const eggPositions = [
    [2, 5], [8, 2], [10, 5], [2, 10], [5, 7], [8, 10]
];

// Spillerens posisjon
let playerPosition = { x: 1, z: 1 };

// Bevegelse
const keyState = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Initialisere spillet
function init() {
    // Opprette Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Himmelblå bakgrunn

    // Opprette kamera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);

    // Opprette renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Lys
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Lag bakke (grønt gress)
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x7CFC00 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Opprett labyrint
    createMaze();
    
    // Opprett spiller
    createPlayer();
    
    // Opprett påskeegg
    createEggs();
    
    // Legg til vinn-melding i DOM
    createWinMessage();
    
    // Oppdater score-visning
    updateScoreDisplay();
    
    // Lytt etter tastetrykk
    setupEventListeners();
    
    // Start renderingsløkken
    animate();
}

// Opprett labyrinten
function createMaze() {
    maze = new THREE.Group();
    
    const wallGeometry = new THREE.BoxGeometry(2, 2, 2);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,  // Brun farge
        roughness: 0.7 
    });
    
    for (let i = 0; i < mazeDesign.length; i++) {
        for (let j = 0; j < mazeDesign[i].length; j++) {
            if (mazeDesign[i][j] === 1) {
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(j * 2 - mazeDesign.length, 0, i * 2 - mazeDesign.length);
                maze.add(wall);
            }
        }
    }
    
    scene.add(maze);
}

// Opprett spiller
function createPlayer() {
    // Create a rabbit model using primitive shapes
    player = new THREE.Group();
    
    // Rabbit body
    const bodyGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.1;
    player.add(body);
    
    // Rabbit head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.5, -0.2);
    player.add(head);
    
    // Rabbit ears
    const earGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16);
    const earMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.15, 0.8, -0.2);
    leftEar.rotation.x = -Math.PI / 8;
    leftEar.rotation.z = -Math.PI / 16;
    player.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.15, 0.8, -0.2);
    rightEar.rotation.x = -Math.PI / 8;
    rightEar.rotation.z = Math.PI / 16;
    player.add(rightEar);
    
    // Rabbit face
    const noseGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAACC });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.5, -0.5);
    player.add(nose);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 0.55, -0.45);
    player.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 0.55, -0.45);
    player.add(rightEye);
    
    // Tail
    const tailGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.2, 0.4);
    player.add(tail);
    
    // Add animation properties to player
    player.userData = {
        // Animation properties
        jumpAnimation: {
            active: false,
            progress: 0,
            duration: 0.5, // seconds
            height: 0.3,
            originalY: 0
        },
        // Default direction is forward (negative z)
        direction: new THREE.Vector3(0, 0, -1)
    };
    
    // Plasser spiller på startposisjon
    for (let i = 0; i < mazeDesign.length; i++) {
        for (let j = 0; j < mazeDesign[i].length; j++) {
            if (mazeDesign[i][j] === 2) {
                playerPosition = { x: j, z: i };
                break;
            }
        }
    }
    
    player.position.set(
        playerPosition.x * 2 - mazeDesign.length, 
        0, 
        playerPosition.z * 2 - mazeDesign.length
    );
    
    scene.add(player);
    
    // Plasser kamera bak spilleren
    updateCameraPosition();
}

// Opprett påskeegg
function createEggs() {
    const eggGeometry = new THREE.SphereGeometry(0.3, 32, 16);
    
    // First verify that all predefined egg positions are on valid paths
    const validEggPositions = eggPositions.filter(pos => {
        // Check if the position is a wall (1) or not
        return mazeDesign[pos[1]] && mazeDesign[pos[1]][pos[0]] !== 1;
    });
    
    // If we don't have enough valid positions, generate new ones
    if (validEggPositions.length < eggPositions.length) {
        // Find all valid positions (paths, not walls)
        const allValidPositions = [];
        for (let i = 0; i < mazeDesign.length; i++) {
            for (let j = 0; j < mazeDesign[i].length; j++) {
                // If it's a path (0) or starting point (2) but not a wall (1)
                if (mazeDesign[i][j] !== 1) {
                    // Exclude the starting position where the player begins
                    if (!(mazeDesign[i][j] === 2 && 
                          playerPosition.x === j && 
                          playerPosition.z === i)) {
                        allValidPositions.push([j, i]);
                    }
                }
            }
        }
        
        // Shuffle the array to get random positions
        const shuffledPositions = [...allValidPositions].sort(() => 0.5 - Math.random());
        
        // Take the positions we need
        const neededCount = eggPositions.length - validEggPositions.length;
        const additionalPositions = shuffledPositions.slice(0, neededCount);
        
        // Combine validated original positions with new random ones
        validEggPositions.push(...additionalPositions);
    }
    
    validEggPositions.forEach(pos => {
        // Lag et tilfeldig farget påskeegg
        const colors = [0xFF69B4, 0x00FFFF, 0xFFFF00, 0x32CD32, 0xFF4500, 0x9370DB];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const eggMaterial = new THREE.MeshStandardMaterial({ 
            color: randomColor,
            metalness: 0.3,
            roughness: 0.2
        });
        
        const egg = new THREE.Mesh(eggGeometry, eggMaterial);
        
        // Dekorer egget med prikker
        addEggDecorations(egg);
        
        egg.position.set(
            pos[0] * 2 - mazeDesign.length, 
            0, 
            pos[1] * 2 - mazeDesign.length
        );
        
        egg.userData = { collected: false, gridX: pos[0], gridZ: pos[1] };
        eggs.push(egg);
        scene.add(egg);
    });
    
    totalEggs = eggs.length;
    document.getElementById('totalEggs').textContent = totalEggs;
}

// Legg til dekorasjoner på eggene
function addEggDecorations(egg) {
    const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const dotMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    
    // Lag 5-10 tilfeldig plasserte prikker
    const dotCount = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < dotCount; i++) {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        
        // Plasser prikkene på eggets overflate
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        
        dot.position.x = 0.3 * Math.sin(phi) * Math.cos(theta);
        dot.position.y = 0.3 * Math.sin(phi) * Math.sin(theta);
        dot.position.z = 0.3 * Math.cos(phi);
        
        egg.add(dot);
    }
}

// Opprett vinn-melding
function createWinMessage() {
    const winDiv = document.createElement('div');
    winDiv.id = 'win-message';
    winDiv.innerHTML = `
        <h2>Gratulerer!</h2>
        <p>Du har funnet alle påskeeggene!</p>
        <button id="restart-btn">Spill igjen</button>
    `;
    document.body.appendChild(winDiv);
    
    document.getElementById('restart-btn').addEventListener('click', resetGame);
}

// Oppdater score
function updateScoreDisplay() {
    document.getElementById('eggsFound').textContent = eggsFound;
}

// Lytt etter tastetrykk
function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        if (isGameOver) return;
        
        if (e.key in keyState) {
            keyState[e.key] = true;
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.key in keyState) {
            keyState[e.key] = false;
            e.preventDefault();
        }
    });
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Oppdater spillerens posisjon
function updatePlayerPosition() {
    const moveSpeed = 0.1;
    let newX = playerPosition.x;
    let newZ = playerPosition.z;
    let moved = false;
    let direction = new THREE.Vector3(0, 0, 0);
    
    if (keyState.ArrowUp) {
        newZ -= moveSpeed;
        direction.z = -1;
        moved = true;
    }
    if (keyState.ArrowDown) {
        newZ += moveSpeed;
        direction.z = 1;
        moved = true;
    }
    if (keyState.ArrowLeft) {
        newX -= moveSpeed;
        direction.x = -1;
        moved = true;
    }
    if (keyState.ArrowRight) {
        newX += moveSpeed;
        direction.x = 1;
        moved = true;
    }
    
    // If we have movement, update player rotation to face the right direction
    if (moved && (direction.x !== 0 || direction.z !== 0)) {
        player.userData.direction = direction.normalize();
        
        // Calculate the angle to rotate the player
        const angle = Math.atan2(direction.x, direction.z);
        player.rotation.y = angle;
        
        // Start a jump animation if not already jumping
        if (!player.userData.jumpAnimation.active) {
            startJumpAnimation();
        }
    }
    
    // Sjekk kollisjoner
    const gridX = Math.round(newX);
    const gridZ = Math.round(newZ);
    
    if (gridX >= 0 && gridX < mazeDesign[0].length && 
        gridZ >= 0 && gridZ < mazeDesign.length && 
        mazeDesign[gridZ][gridX] !== 1) {
        
        playerPosition.x = newX;
        playerPosition.z = newZ;
        
        player.position.set(
            playerPosition.x * 2 - mazeDesign.length, 
            player.position.y, // Keep current Y position for animation
            playerPosition.z * 2 - mazeDesign.length
        );
        
        updateCameraPosition();
        checkEggCollection();
    }
    
    // Update jump animation
    updateJumpAnimation();
}

// Start jump animation
function startJumpAnimation() {
    player.userData.jumpAnimation.active = true;
    player.userData.jumpAnimation.progress = 0;
    player.userData.jumpAnimation.originalY = player.position.y;
}

// Update jump animation
function updateJumpAnimation() {
    const animation = player.userData.jumpAnimation;
    
    if (animation.active) {
        animation.progress += 0.05; // Increment progress
        
        if (animation.progress >= animation.duration) {
            // End animation
            player.position.y = animation.originalY;
            animation.active = false;
        } else {
            // Calculate jump height using a sine wave for a natural hopping motion
            const jumpHeight = animation.height * Math.sin((animation.progress / animation.duration) * Math.PI);
            player.position.y = animation.originalY + jumpHeight;
        }
    }
}

// Oppdater kameraets posisjon
function updateCameraPosition() {
    // Sett kameraet litt bak og over spilleren
    camera.position.set(
        player.position.x, 
        5, 
        player.position.z + 5
    );
    
    camera.lookAt(player.position);
}

// Sjekk om spilleren har plukket opp egg
function checkEggCollection() {
    eggs.forEach(egg => {
        if (!egg.userData.collected) {
            const distance = Math.sqrt(
                Math.pow(playerPosition.x - egg.userData.gridX, 2) + 
                Math.pow(playerPosition.z - egg.userData.gridZ, 2)
            );
            
            if (distance < 0.7) {
                egg.userData.collected = true;
                egg.visible = false;
                eggsFound++;
                updateScoreDisplay();
                
                if (eggsFound === totalEggs) {
                    gameWon();
                }
            }
        }
    });
}

// Når spilleren vinner
function gameWon() {
    isGameOver = true;
    document.getElementById('win-message').style.display = 'block';
}

// Reset spillet
function resetGame() {
    // Fjern eksisterende egg
    eggs.forEach(egg => {
        scene.remove(egg);
    });
    eggs = [];
    
    // Reset variabler
    eggsFound = 0;
    isGameOver = false;
    
    // Skjul vinn-melding
    document.getElementById('win-message').style.display = 'none';
    
    // Opprett nye egg
    createEggs();
    
    // Reset spiller til startposisjon
    for (let i = 0; i < mazeDesign.length; i++) {
        for (let j = 0; j < mazeDesign[i].length; j++) {
            if (mazeDesign[i][j] === 2) {
                playerPosition = { x: j, z: i };
                break;
            }
        }
    }
    
    player.position.set(
        playerPosition.x * 2 - mazeDesign.length, 
        0, 
        playerPosition.z * 2 - mazeDesign.length
    );
    
    // Reset player rotation and animation state
    player.rotation.y = 0; // Reset rotation to face forward
    player.userData.direction = new THREE.Vector3(0, 0, -1); // Reset direction
    player.userData.jumpAnimation.active = false; // Stop any jump animation
    player.userData.jumpAnimation.progress = 0;
    
    updateCameraPosition();
    updateScoreDisplay();
}

// Animasjonsløkke
function animate() {
    requestAnimationFrame(animate);
    
    // Roter egg for visuell effekt
    eggs.forEach(egg => {
        if (!egg.userData.collected) {
            egg.rotation.y += 0.01;
        }
    });
    
    updatePlayerPosition();
    renderer.render(scene, camera);
}

// Start spillet når siden er lastet
window.onload = init;