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
        
        const wallGeometry = new THREE.BoxGeometry(2, 2, 2);
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.walls,
            roughness: 0.7,
            transparent: true, // Gjør materiale transparent
            opacity: 1.0 // Start med full synlighet
        });
        
        for (let i = 0; i < mazeDesign.length; i++) {
            for (let j = 0; j < mazeDesign[i].length; j++) {
                if (mazeDesign[i][j] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone()); // Bruk clone() for unikt materiale
                    wall.position.set(j * 2 - mazeSize, 0, i * 2 - mazeSize);
                    // Lagre gridposisjon for senere referanse
                    wall.userData = {
                        gridX: j,
                        gridZ: i
                    };
                    this.walls.push(wall);
                    this.maze.add(wall);
                }
            }
        }
        
        CONFIG.scene.add(this.maze);
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
        const intersects = raycaster.intersectObjects(this.walls);
        
        // Reset alle vegger til normal synlighet først
        this.walls.forEach(wall => {
            wall.material.opacity = 1.0;
        });
        
        // Gjør kun den første veggen som er i veien gjennomsiktig (nærmest kameraet)
        if (intersects.length > 0 && intersects[0].object !== PlayerModule.player) {
            intersects[0].object.material.opacity = 0.3; // Gjør kun den første veggen delvis gjennomsiktig
        }
    },
    
    // Fjern labyrinten fra scenen
    removeMaze: function() {
        if (this.maze) {
            CONFIG.scene.remove(this.maze);
            this.maze = null;
            this.walls = [];
        }
    }
};