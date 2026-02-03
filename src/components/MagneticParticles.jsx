import React, { useEffect, useRef } from 'react';

/**
 * GPU-Accelerated Magnetic Particle System
 * Updated: Smaller particles, STRONGER magnetic field
 */
const MagneticParticles = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Settings
        const particleCount = prefersReducedMotion ? 30 : 100;
        const connectionDistance = 150;
        const mouseDistance = 350; // INCREASED magnetic range
        const attractionStrength = 0.15; // STRONGER attraction

        // Initialize particles (SMALLER sizes: 1-3px)
        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                const size = Math.random() * 2 + 1; // 1-3px (back to original)
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: size,
                    color: `rgba(6, 182, 212, ${Math.random() * 0.5 + 0.3})`
                });
            }
        };

        initParticles();

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        });

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            particles.forEach((p, i) => {
                // STRONG Magnetic Attraction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouseDistance && dist > 10) {
                    const forceDirectionX = dx / dist;
                    const forceDirectionY = dy / dist;
                    const force = (mouseDistance - dist) / mouseDistance;

                    // STRONGER pull toward cursor
                    p.vx += forceDirectionX * force * attractionStrength;
                    p.vy += forceDirectionY * force * attractionStrength;
                }

                // Apply velocity
                if (!prefersReducedMotion) {
                    p.x += p.vx;
                    p.y += p.vy;
                }

                // Friction
                p.vx *= 0.94;
                p.vy *= 0.94;

                // Boundaries
                if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
                if (p.x > width) { p.x = width; p.vx *= -0.5; }
                if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
                if (p.y > height) { p.y = height; p.vy *= -0.5; }

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.3 * (1 - dist2 / connectionDistance)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (!prefersReducedMotion) {
            animate();
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="magnetic-particles"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
};

export default MagneticParticles;
