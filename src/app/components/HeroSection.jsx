'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const HeroSection = () => {
  const heroRef = useRef(null);
  const vantaRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle Vanta.js initialization
  useEffect(() => {
    if (!mounted) return;

    const initVanta = async () => {
      try {
        if (!vantaRef.current && heroRef.current) {
          const VANTA = (await import('vanta/dist/vanta.halo.min')).default;
          vantaRef.current = VANTA({
            el: heroRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: true,
            minHeight: 200.00,
            minWidth: 200.00,
            baseColor: 0x292929,
            backgroundColor: 0x292929,
            amplitudeFactor: 0.80,
            size: 1.50,
            opacity: 0.2
          });
        }
      } catch (error) {
        console.error('Failed to initialize Vanta:', error);
      }
    };

    initVanta();

    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, [mounted]);

  // Handle GSAP animations
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" }});
      
      tl.fromTo(".hero-content", 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0,
          duration: 1,
        }
      )
      .fromTo(".hero-logo",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1 },
        "-=0.5"
      );
    });

    return () => ctx.revert();
  }, [mounted]);

  return (
    <div ref={heroRef} className="relative min-h-screen flex flex-col items-start justify-center overflow-hidden bg-gradient-to-br from-[#292929] via-[#2d3d33] to-[#54bb74]/20" style={{ fontFamily: 'Amenti-Bold, sans-serif' }}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#292929]/40 to-[#54bb74]/10"></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 hero-content relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Heading */}
          <div className="text-white self-end -mb-6">
            <h1 className="text-3xl md:text-6xl font-bold mb-6">
              From Standard to Smart
            </h1>
          </div>
          
          {/* Right Side - Description and CTA */}
          <div className="text-white/80">
            <p className="text-lg mb-8 leading-relaxed">
              Experience the future of lighting with our innovative smart solutions. Our intelligent design seamlessly adapts to your needs, putting modular innovation and intuitive control at your fingertips. Join us in revolutionizing modern illumination technology and transform your space into something extraordinary.
            </p>
            
            <button className="px-8 py-4 bg-[#54bb74] text-white rounded-full text-lg font-bold transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#54bb74]/30 hover:bg-[#93cfa2] focus:outline-none focus:ring-2 focus:ring-[#54bb74] focus:ring-opacity-50">
              Explore Smart Lighting
            </button>
          </div>
        </div>
      </div>

      {/* Logo at Bottom */}
      <div className="hero-logo mt-20 w-full max-w-5xl mx-auto px-4 relative z-20">
        <Image
          src="/images/svgLogos/__Icon_Wordmark_Black.svg"
          alt="Limi Logo"
          width={400}
          height={200}
          className="w-full h-auto invert opacity-80"
          priority
        />
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Amenti-Bold';
          src: url('/fonts/amenti-clean-modern-sans/Amenti-Bold.otf') format('opentype');
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
