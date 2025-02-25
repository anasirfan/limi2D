'use client';
import { useEffect, useRef } from 'react';

import * as THREE from 'three';

const TimelineBackground = () => {
 
  const trailCanvasRef = useRef(null);

  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef();

  useEffect(() => {
 

    // Setup canvas for mouse trail
    const canvas = trailCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Initialize particles
    const createParticle = (x, y) => ({
      x,
      y,
      size: Math.random() * 2 + 2,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      life: 1,
      color: '#93cfa2'
    });

    // Mouse move handler
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };

      // Add new particles
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push(createParticle(x, y));
      }
    };

    // Animation loop
    const animate = () => {
      // Add fade effect
      ctx.fillStyle = 'rgba(41, 41, 41, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 0.01;

        if (particle.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.life * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        return true;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    canvas.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
    
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div  className="fixed inset-0 -z-10">
      <canvas
        ref={trailCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
};

export default TimelineBackground;
