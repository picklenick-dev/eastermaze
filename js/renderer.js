// filepath: c:\Development\easter-labrynth\js\renderer.js
// Main renderer module that coordinates all renderer subsystems
import { CONFIG } from './config.js';
import { CoreRenderer } from './renderer/core.js';
import { GroundSystem } from './renderer/ground.js';
import { DecorationSystem } from './renderer/decorations.js';
import { ParticleSystem } from './renderer/particles.js';
import { TextureUtils } from './renderer/texture-utils.js';

// Export the renderer module with the same interface as before
export const RendererModule = {
    // Initialize the renderer
    init: function() {
        CoreRenderer.init();
    },
    
    // Handle scene rendering
    render: function() {
        CoreRenderer.render();
    },
    
    // Clear the scene between levels
    clearScene: function() {
        CoreRenderer.clearScene();
    },
    
    // Setup lights (delegated to the core renderer)
    setupLights: function() {
        CoreRenderer.setupLights();
    },
    
    // Create ground (delegated to the ground system)
    createGround: function() {
        GroundSystem.init();
    },
    
    // Add Easter decorations (delegated to the decoration system)
    addEasterDecorations: function() {
        DecorationSystem.init();
        ParticleSystem.init();
    },
    
    // Add clouds to the sky (delegated to the decoration system)
    addClouds: function() {
        DecorationSystem.addClouds();
    },
    
    // Add butterflies (delegated to the decoration system)
    addButterflies: function(theme) {
        DecorationSystem.addButterflies(theme);
    },
    
    // Add unique decorations for levels (delegated to the decoration system)
    addUniqueDecorations: function(theme) {
        DecorationSystem.addUniqueDecorations(theme);
    },
    
    // Add particle effects (delegated to the particle system)
    addParticleEffects: function(theme) {
        ParticleSystem.addParticleEffects(theme);
    },
    
    // Animate decorations (delegated to decoration and particle systems)
    animateDecorations: function() {
        if (!CONFIG.enhancedGraphics) return;
        
        DecorationSystem.animate();
        ParticleSystem.animate();
    },
    
    // Handle window resize (delegated to the core renderer)
    handleResize: function() {
        CoreRenderer.handleResize();
    }
};

// Make texture utilities available through the renderer for backward compatibility
RendererModule.createCircleTexture = TextureUtils.createCircleTexture;
RendererModule.createStarTexture = TextureUtils.createStarTexture;