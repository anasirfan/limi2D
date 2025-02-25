'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import Image from 'next/image';
import TimelineBackground from './TimelineBackground';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import HALO from 'vanta/dist/vanta.halo.min';

const lightingEras = [
  {
    era: 'Dawn of Electric Light',
    year: '1880s',
    description: 'The birth of modern illumination with Edison\'s incandescent bulb.',
    features: ['Glass bulb construction', 'Tungsten filament', 'Warm, ambient light'],
    impact: 'Revolutionized indoor lighting and extended productive hours.',
    efficiency: 'Efficiency: 2-3%',
    model: '/models/VintageGlassBulb.glb',
    modelScale: 8,
    modelRotation: [0, 0, 0],
    position: [0, -1, 0],
    type: 'edison',
    color: '#FFD700'
  },
  {
    era: 'Fluorescent Revolution',
    year: '1940s',
    description: 'Introduction of energy-efficient fluorescent lighting technology.',
    features: ['Mercury vapor technology', 'Phosphor coating', 'Longer lifespan'],
    impact: 'Transformed commercial and industrial lighting standards.',
    efficiency: 'Efficiency: 15-20%',
    model: '/models/CFLTube.glb',
    modelScale: 2,
    modelRotation: [0, 0, 0],
    position: [0, -1.2, 0],
    type: 'cfl',
    color: '#66CCCC'
  },
  {
    era: 'LED Innovation',
    year: '2000s',
    description: 'The rise of LED technology bringing unprecedented efficiency.',
    features: ['Semiconductor technology', 'Multiple color options', 'Instant illumination'],
    impact: 'Set new standards for energy efficiency and versatility.',
    efficiency: 'Efficiency: 70-80%',
    model: '/models/LedLight.glb',
    modelScale: 4,
    modelRotation: [0, 0, 0],
    position: [0, -1.2, 0],
    type: 'led',
    color: '#66CC00'
  },
  {
    era: 'Smart Lighting Systems',
    year: '2020s',
    description: 'Integration of IoT and AI in lighting control systems.',
    features: ['Wireless connectivity', 'Motion sensing', 'Color temperature control'],
    impact: 'Enabling intelligent, responsive lighting environments.',
    efficiency: 'Efficiency: 90-95%',
    model: '/models/LedTrianglePanel.glb',
    modelScale: 5,
    modelRotation: [0, 0, 0],
    position: [.3, -8, 0],
    type: 'panel',
    colors: ['#66CC00', '#66CCCC', '#FFD700']
  }
];
const VANTA = dynamic(() => import('vanta/dist/vanta.halo.min'), { ssr: false });
const LightModel = dynamic(() => import('./LightModel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-black/20 rounded-lg flex items-center justify-center text-white/60">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mb-2"></div>
        Loading 3D Model...
      </div>
    </div>
  )
});

const HeroSection = () => {
  const heroRef = useRef(null);
  const timelineRef = useRef(null);
  const [activeEraIndex, setActiveEraIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  // Set up intersection observer for timeline sections
  useEffect(() => {
    const observers = [];
    const sections = document.querySelectorAll('.timeline-section');
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setActiveEraIndex(index);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Triggers when section is in middle of viewport
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!vantaEffect && typeof window !== 'undefined') {
      setVantaEffect(
        HALO({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: true,
          minHeight: 400.00,
          minWidth: 400.00,
          backgroundColor: 0x292929,
          amplitudeFactor: 2.00,
          xOffset: 0.0,
          yOffset: 0.0,
          size: 1.50
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let ctx;
    
    const initAnimations = async () => {
      if (!mounted || !vantaRef.current) return;

      try {
        const { gsap } = await import('gsap');
        const ScrollTriggerModule = await import('gsap/ScrollTrigger');
        const ScrollTrigger = ScrollTriggerModule.default;

        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          gsap.from('.hero-content', {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power2.out'
          });

          lightingEras.forEach((_, index) => {
            gsap.from(`.era-${index}`, {
              scrollTrigger: {
                trigger: `.era-${index}`,
                start: 'top bottom',
                end: 'center center',
                toggleActions: 'play none none reverse'
              },
              opacity: 0,
              y: 50,
              duration: 1,
              ease: 'power2.out'
            });
          });
        });
      } catch (error) {
        console.error('Error initializing animations:', error);
      }
    };

    initAnimations();

    return () => ctx?.revert();
  }, [mounted]);

  return (
    <>
      <div ref={vantaRef} className="relative min-h-screen flex flex-col items-start justify-center overflow-hidden bg-gradient-to-br from-[#292929] via-[#2d3d33] to-[#54bb74]/20">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#292929]/40 to-[#54bb74]/10"></div>

        {/* Glow effect container */}
        <div className="absolute w-full h-full overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
            {/* White glow for shell */}
            <div className="absolute inset-0 bg-white opacity-40 blur-[100px] animate-pulse" />
            <div className="absolute inset-0 bg-white opacity-30 blur-[150px] animate-pulse delay-100" />
            
            {/* Warm color overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-orange-500 opacity-30 blur-[120px] animate-pulse delay-200" />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-600 opacity-20 blur-[180px] animate-pulse delay-300" />
            
            {/* Additional ambient reflection */}
            <div className="absolute inset-0 bg-white/40 mix-blend-overlay blur-[80px] animate-pulse" />
            <div className="absolute inset-0 bg-yellow-400/20 mix-blend-screen blur-[100px] animate-pulse delay-150" />
          </div>
        </div>

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
              <p className="hero-description text-lg mb-8 leading-relaxed">
                Experience the future of lighting with our innovative smart solutions. Our intelligent design seamlessly adapts to your needs, putting modular innovation and intuitive control at your fingertips. Join us in revolutionizing modern illumination technology and transform your space into something extraordinary.
              </p>
              
              <button className="cta-button px-8 py-4 bg-[#54bb74] text-white rounded-full text-lg font-bold transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#54bb74]/30 hover:bg-[#93cfa2] focus:outline-none focus:ring-2 focus:ring-[#54bb74] focus:ring-opacity-50">
                Explore Smart Lighting
              </button>
            </div>
          </div>
        </div>

        {/* Logo at Bottom */}
        <div className="hero-logo mt-20 w-full max-w-5xl mx-auto px-4 relative z-20">
          <Image
            src="/images/svgLogos/__Primary_Logo_White.svg"
            alt="Limi Logo"
            width={400}
            height={200}
            className="w-full h-auto invert opacity-80"
            priority
          />
        </div>
      </div>

      <div ref={timelineRef} className="min-h-screen relative">
        <TimelineBackground />
        
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-6xl font-bold text-white mb-16 text-center tracking-tight">
            Evolution of <span className="text-gradient">Illumination</span>
          </h2>
          
          <div className="relative min-h-screen">
            {/* Fixed Timeline Years */}
            <div className="absolute left-0 top-0 w-24 h-full">
              {lightingEras.map((era, index) => (
                <div 
                  key={era.year}
                  className="sticky top-32 mb-[600px] last:mb-0"
                >
                  <div className={`w-16 h-16 flex items-center justify-center rounded-full backdrop-blur-sm border transition-all duration-300 ${
                    index === activeEraIndex 
                      ? 'bg-white/20 border-white/40' 
                      : 'bg-white/10 border-white/20'
                  }`}>
                    <span className="text-white font-mono ">{era.year}</span>
                  </div>
                  {index < lightingEras.length - 1 && (
                    <div className="absolute h-[600px] w-px bg-gradient-to-b from-white/20 to-transparent left-8 top-16" />
                  )}
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="ml-32">
              {/* Fixed Model Container */}
              <div className="sticky top-32 h-[400px] w-[calc(50%-1rem)] float-left mr-8">
                {lightingEras.map((era, index) => (
                  <div 
                    key={era.era}
                    className={`era-${index} absolute inset-0 bg-black/20 rounded-2xl p-8 backdrop-blur-sm border border-white/5 transition-all duration-300`}
                    style={{ 
                      opacity: index === activeEraIndex ? 1 : 0,
                      pointerEvents: index === activeEraIndex ? 'auto' : 'none'
                    }}
                  >
                    <Suspense fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
                      </div>
                    }>
                      <LightModel
                        type={era.type}
                        position={era.position}
                        rotation={era.modelRotation}
                        color={era.color}
                        colors={era.colors}
                        scale={era.modelScale}
                      />
                    </Suspense>
                  </div>
                ))}
              </div>

              {/* Scrollable Content */}
              <div className="space-y-[600px]">
                {lightingEras.map((era, index) => (
                  <div 
                    key={era.era} 
                    className="timeline-section relative"
                    data-index={index}
                  >
                    <div className="w-[calc(50%-1rem)] ml-auto">
                      <div className="bg-black/20 rounded-2xl p-8 backdrop-blur-sm border border-white/5">
                        <h3 className="text-3xl font-bold text-white mb-4">{era.era}</h3>
                        <p className="text-white/80 text-lg leading-relaxed mb-6">{era.description}</p>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Features</h4>
                            <ul className="space-y-2">
                              {era.features.map((feature, i) => (
                                <li key={i} className="text-white/70 flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Impact</h4>
                            <p className="text-white/70">{era.impact}</p>
                            
                            <div className="mt-4">
                              <div className="text-sm text-white/60 mb-2">Efficiency Rating</div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-white/50 to-white/30 rounded-full transition-all duration-1000" 
                                  style={{ width: `${parseInt(era.efficiency.split('-')[1])}%` }}
                                />
                              </div>
                              <div className="text-sm text-white/40 mt-1">{era.efficiency}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Bottom Spacer Section */}
                <div className="h-screen flex items-center justify-center">
                  <div className="w-[calc(50%-1rem)] ml-auto">
                    <div className="bg-black/10 rounded-2xl p-8 backdrop-blur-sm border border-white/5 text-center">
                      <h3 className="text-2xl font-bold text-white/60 mb-4">Future of Lighting</h3>
                      <p className="text-white/40">The journey of innovation continues...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Amenti-Bold';
          src: url('/fonts/amenti-clean-modern-sans/Amenti-Bold.otf') format('opentype');
        }
        .timeline-bg {
          background-color: #292929;
        }
      `}</style>
    </>
  );
};

export default HeroSection;
