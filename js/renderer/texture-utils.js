// Texture utility functions
import { CONFIG } from '../config.js';

export const TextureUtils = {
    // Helper to create a circular texture
    createCircleTexture: function(color, size = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw circle
        const radius = size / 2;
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        
        // Fill with gradient
        const gradient = ctx.createRadialGradient(
            radius, radius, 0,
            radius, radius, radius
        );
        
        // Convert hex color to rgb
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        
        gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    },
    
    // Helper to create a star-shaped texture
    createStarTexture: function(color, size = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Convert hex color to rgb
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        
        // Draw star shape
        const centerX = size / 2;
        const centerY = size / 2;
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = size / 5;
        
        ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (spikes * 2)) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        
        // Fill with gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, outerRadius
        );
        
        gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
        gradient.addColorStop(0.7, `rgba(${r},${g},${b},0.5)`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
};