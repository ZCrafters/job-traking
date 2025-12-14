import React, { useEffect, useRef } from 'react';
import Zdog from 'zdog';

/**
 * ZdogIcon Component
 * Animated 3D icons using Zdog library
 */
const ZdogIcon = ({ type = 'briefcase', size = 60, rotating = true, color = '#667eea' }) => {
    const canvasRef = useRef(null);
    const illoRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Create illustration
        const illo = new Zdog.Illustration({
            element: canvasRef.current,
            zoom: size / 60,
            dragRotate: true,
            rotate: { x: -0.2, y: 0 },
        });

        illoRef.current = illo;

        // Create different icon shapes
        switch (type) {
            case 'briefcase':
                // Briefcase body
                new Zdog.Box({
                    addTo: illo,
                    width: 40,
                    height: 30,
                    depth: 15,
                    stroke: false,
                    color: color,
                    fill: true,
                });

                // Handle
                new Zdog.Shape({
                    addTo: illo,
                    path: [
                        { x: -10, y: -15 },
                        { arc: [
                            { x: -10, y: -25 },
                            { x: 0, y: -25 },
                        ]},
                        { arc: [
                            { x: 10, y: -25 },
                            { x: 10, y: -15 },
                        ]},
                    ],
                    closed: false,
                    stroke: 4,
                    color: color,
                });
                break;

            case 'check':
                // Checkmark
                new Zdog.Shape({
                    addTo: illo,
                    path: [
                        { x: -15, y: 0 },
                        { x: -5, y: 10 },
                        { x: 15, y: -10 },
                    ],
                    closed: false,
                    stroke: 6,
                    color: color,
                });

                // Circle
                new Zdog.Ellipse({
                    addTo: illo,
                    diameter: 50,
                    stroke: 4,
                    color: color,
                    fill: false,
                });
                break;

            case 'star':
                // 5-pointed star
                const starPath = [];
                const points = 5;
                const outerRadius = 20;
                const innerRadius = 10;
                
                for (let i = 0; i < points * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI / points) * i - Math.PI / 2;
                    starPath.push({
                        x: Math.cos(angle) * radius,
                        y: Math.sin(angle) * radius,
                    });
                }

                new Zdog.Shape({
                    addTo: illo,
                    path: starPath,
                    closed: true,
                    stroke: 3,
                    color: color,
                    fill: true,
                });
                break;

            case 'rocket':
                // Rocket body
                new Zdog.Shape({
                    addTo: illo,
                    path: [
                        { x: 0, y: -25 },
                        { x: -8, y: 5 },
                        { x: 8, y: 5 },
                    ],
                    closed: true,
                    stroke: 3,
                    color: color,
                    fill: true,
                });

                // Fins
                new Zdog.Shape({
                    addTo: illo,
                    path: [
                        { x: -8, y: 5 },
                        { x: -15, y: 15 },
                        { x: -8, y: 10 },
                    ],
                    closed: true,
                    stroke: 2,
                    color: '#f59e0b',
                    fill: true,
                });

                new Zdog.Shape({
                    addTo: illo,
                    path: [
                        { x: 8, y: 5 },
                        { x: 15, y: 15 },
                        { x: 8, y: 10 },
                    ],
                    closed: true,
                    stroke: 2,
                    color: '#f59e0b',
                    fill: true,
                });

                // Window
                new Zdog.Ellipse({
                    addTo: illo,
                    diameter: 8,
                    translate: { y: -5 },
                    stroke: 2,
                    color: '#fff',
                    fill: true,
                });
                break;

            case 'chart':
                // Bar chart
                const bars = [15, 25, 20, 30];
                bars.forEach((height, i) => {
                    new Zdog.Box({
                        addTo: illo,
                        width: 8,
                        height: height,
                        depth: 8,
                        translate: { x: (i - 1.5) * 12, y: height / 2 - 15 },
                        stroke: false,
                        color: i === 3 ? '#10b981' : color,
                        fill: true,
                    });
                });
                break;

            default:
                // Default: sphere
                new Zdog.Shape({
                    addTo: illo,
                    stroke: 30,
                    color: color,
                });
        }

        // Animation
        let isAnimating = true;
        
        const animate = () => {
            if (!isAnimating) return;
            
            if (rotating) {
                illo.rotate.y += 0.01;
            }
            illo.updateRenderGraph();
            requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            isAnimating = false;
        };
    }, [type, size, rotating, color]);

    return (
        <canvas 
            ref={canvasRef}
            width={size}
            height={size}
            className="inline-block"
        />
    );
};

export default ZdogIcon;
