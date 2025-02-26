"use client";
import { useEffect, useRef, useState, Suspense, forwardRef } from "react";
import Image from "next/image";
import TimelineBackground from "./TimelineBackground";
import dynamic from "next/dynamic";
import * as THREE from "three";
import HALO from "vanta/dist/vanta.halo.min";

const lightingEras = [
  {
    era: "Dawn of Electric Light",
    year: "1880s",
    description:
      "The birth of modern illumination with Edison's incandescent bulb.",
    features: [
      "Glass bulb construction",
      "Tungsten filament",
      "Warm, ambient light",
    ],
    impact: "Revolutionized indoor lighting and extended productive hours.",
    efficiency: "Efficiency: 2-3%",
    model: "/models/VintageGlassBulb.glb",
    modelScale: 8,
    modelRotation: [0, 0, 0],
    position: [0, -1, 0],
    type: "edison",
    color: "#FFD700",
  },
  {
    era: "Fluorescent Revolution",
    year: "1940s",
    description:
      "Introduction of energy-efficient fluorescent lighting technology.",
    features: [
      "Mercury vapor technology",
      "Phosphor coating",
      "Longer lifespan",
    ],
    impact: "Transformed commercial and industrial lighting standards.",
    efficiency: "Efficiency: 15-20%",
    model: "/models/CFLTube.glb",
    modelScale: 5,
    modelRotation: [0, 0, 0],
    position: [0, 0, 0],
    type: "cfl",
    color: "#66CCCC",
  },
  {
    era: "LED Innovation",
    year: "2000s",
    description:
      "The rise of LED technology bringing unprecedented efficiency.",
    features: [
      "Semiconductor technology",
      "Multiple color options",
      "Instant illumination",
    ],
    impact: "Set new standards for energy efficiency and versatility.",
    efficiency: "Efficiency: 70-80%",
    model: "/models/LedLight.glb",
    modelScale: 12,
    modelRotation: [0, 0, 0],
    position: [0, -1.3, 0],
    type: "led",
    color: "#66CC00",
  },
  {
    era: "Smart Lighting Systems",
    year: "2020s",
    description: "Integration of IoT and AI in lighting control systems.",
    features: [
      "Wireless connectivity",
      "Motion sensing",
      "Color temperature control",
    ],
    impact: "Enabling intelligent, responsive lighting environments.",
    efficiency: "Efficiency: 90-95%",
    model: "/models/LedTrianglePanel.glb",
    modelScale: 5,
    modelRotation: [0, 0, 0],
    position: [0.3, -8, 0],
    type: "panel",
    colors: ["#66CC00", "#66CCCC", "#FFD700"],
  },
];
const VANTA = dynamic(() => import("vanta/dist/vanta.halo.min"), {
  ssr: false,
});
// Dynamic import of LightModel with forwardRef support
const LightModel = dynamic(
  () => import("./LightModel").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
      </div>
    ),
  }
);

function HeroSection() {
  const timelineRef = useRef(null);
  const [activeEraIndex, setActiveEraIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    const observers = [];
    const sections = document.querySelectorAll(".timeline-section");

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setActiveEraIndex(index);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px", // Triggers when section is in middle of viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    sections.forEach((section) => observer.observe(section));

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!vantaEffect && typeof window !== "undefined") {
      setVantaEffect(
        HALO({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: true,
          minHeight: 400.0,
          minWidth: 400.0,
          backgroundColor: 0x292929,
          amplitudeFactor: 2.0,
          xOffset: 0.0,
          yOffset: 0.0,
          size: 1.5,
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

      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Heading Animation
      const headingTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".timeline-heading-container",
          start: "top center",
          end: "center+=300 center",
          scrub: 1.5,
        },
      });

      // Initial state
      gsap.set(".timeline-heading", { opacity: 0 });
      gsap.set(".timeline-heading span", {
        opacity: 0,
        y: gsap.utils.random(-150, 150, true),
        x: gsap.utils.random(-150, 150, true),
        rotation: gsap.utils.random(-180, 180, true),
      });

      // Animate heading
      headingTl
        .to(".timeline-heading", {
          opacity: 1,
          duration: 0.3,
        })
        .to(".timeline-heading span", {
          opacity: 1,
          duration: 0.5,
          stagger: 0.03,
        })
        .to(
          ".timeline-heading span",
          {
            y: 0,
            x: 0,
            rotation: 0,
            duration: 2,
            stagger: 0.08,
            ease: "power2.inOut",
          },
          "<"
        )
        .to(
          ".timeline-heading .text-7xl",
          {
            letterSpacing: "0.5em",
            duration: 3,
            ease: "power1.inOut",
          },
          "-=1.5"
        )
        .to(
          ".timeline-heading .text-4xl",
          {
            letterSpacing: "0.3em",
            duration: 3,
            ease: "power1.inOut",
          },
          "<"
        )
        .to(
          ".timeline-heading .text-2xl",
          {
            letterSpacing: "0.3em",
            duration: 3,
            ease: "power1.inOut",
          },
          "<"
        );

      // Timeline Content Animation
      const contentTl = gsap.timeline({
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top center",
          end: "top top",
          scrub: 1,
          markers: false,
        },
      });

      contentTl.to(".timeline-content", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
      });

      ctx = contentTl;
    };

    initAnimations();

    return () => {
      if (ctx) {
        ctx.kill();
      }
    };
  }, [mounted]);

  return (
    <>
      <div
        ref={vantaRef}
        className="relative min-h-screen flex flex-col items-start justify-center overflow-hidden bg-gradient-to-br from-[#292929] via-[#2d3d33] to-[#54bb74]/20"
      >
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
                Experience the future of lighting with our innovative smart
                solutions. Our intelligent design seamlessly adapts to your
                needs, putting modular innovation and intuitive control at your
                fingertips. Join us in revolutionizing modern illumination
                technology and transform your space into something
                extraordinary.
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

        <div className="container mx-auto px-4 pt-20">
          {/* Animated Timeline Heading */}
          <div className="timeline-heading-container relative h-[120px] md:h-[200px] mb-8 md:mb-0">
            <div className="timeline-heading opacity-0 absolute top-0 left-0 w-full text-center">
              <div className="text-4xl md:text-7xl font-bold tracking-[1em] md:tracking-[2em] uppercase text-white/80">
                <span className="inline-block">L</span>
                <span className="inline-block">I</span>
                <span className="inline-block">G</span>
                <span className="inline-block">H</span>
                <span className="inline-block">T</span>
                <span className="inline-block">I</span>
                <span className="inline-block">N</span>
                <span className="inline-block">G</span>
              </div>
              <div className="text-2xl md:text-4xl tracking-[0.5em] md:tracking-[1em] uppercase text-white/60 mt-2 md:mt-8">
                <span className="inline-block">T</span>
                <span className="inline-block">H</span>
                <span className="inline-block">R</span>
                <span className="inline-block">O</span>
                <span className="inline-block">U</span>
                <span className="inline-block">G</span>
                <span className="inline-block">H</span>
                <span className="inline-block ml-2 md:ml-8">T</span>
                <span className="inline-block">I</span>
                <span className="inline-block">M</span>
                <span className="inline-block">E</span>
              </div>
              <div className="text-lg md:text-2xl tracking-[0.2em] md:tracking-[1em] uppercase text-white/40 mt-2 md:mt-8">
                <span className="inline-block">A</span>
                <span className="inline-block ml-1 md:ml-4">J</span>
                <span className="inline-block">O</span>
                <span className="inline-block">U</span>
                <span className="inline-block">R</span>
                <span className="inline-block">N</span>
                <span className="inline-block">E</span>
                <span className="inline-block">Y</span>
                <span className="inline-block ml-1 md:ml-8">O</span>
                <span className="inline-block">F</span>
                <span className="inline-block ml-1 md:ml-8">I</span>
                <span className="inline-block">N</span>
                <span className="inline-block">N</span>
                <span className="inline-block">O</span>
                <span className="inline-block">V</span>
                <span className="inline-block">A</span>
                <span className="inline-block">T</span>
                <span className="inline-block">I</span>
                <span className="inline-block">O</span>
                <span className="inline-block">N</span>
              </div>
            </div>
          </div>

          <div className="relative min-h-screen">
            {/* Fixed Timeline Years */}
            <div className="absolute left-0 top-0 w-12 md:w-24 h-full ">
              {lightingEras.map((era, index) => (
                <div
                  key={era.year}
                  className="sticky max-sm:top-32 top-16 md:top-32 mb-[400px] md:mb-[600px] last:mb-0"
                >
                  <div
                    className={`w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-full backdrop-blur-sm border transition-all duration-300 ${
                      index === activeEraIndex
                        ? "bg-white/20 border-white/40"
                        : "bg-white/10 border-white/20"
                    }`}
                  >
                    <span className="text-white font-mono text-sm md:text-base">{era.year}</span>
                  </div>
                  {index < lightingEras.length - 1 && (
                    <div className="absolute h-[400px] md:h-[600px] w-px bg-gradient-to-b from-white/20 to-transparent left-5 md:left-8 top-10 md:top-16" />
                  )}
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="ml-16 md:ml-32">
              {/* Model Container - Sticky on desktop, scrolls with content on mobile */}
              <div className="relative md:sticky max-sm:sticky max-sm:top-32 max-sm:z-20 md:top-32 h-[300px] md:h-[400px] w-full md:w-[calc(50%-1rem)] md:float-left md:mr-8 bg-black/30 rounded-2xl backdrop-blur-sm border border-white/10">
                {lightingEras.map((era, index) => (
                  <div
                    key={era.era}
                    className={`era-${index} absolute inset-0 rounded-2xl p-4 md:p-8 transition-all duration-300`}
                    style={{
                      opacity: index === activeEraIndex ? 1 : 0,
                      pointerEvents: index === activeEraIndex ? "auto" : "none",
                      zIndex: index === activeEraIndex ? 20 : 10,
                      transform: `translateZ(${index === activeEraIndex ? '0px' : '-100px'})`,
                    }}
                  >
                    <Suspense
                      fallback={
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
                        </div>
                      }
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <LightModel
                          type={era.type}
                          position={era.position}
                          rotation={era.modelRotation}
                          color={era.color}
                          colors={era.colors}
                          scale={era.modelScale}
                        />
                      </div>
                    </Suspense>
                  </div>
                ))}
              </div>

              {/* Scrollable Content */}
              <div className="relative mt-8 md:mt-20">
                {/* Single continuous box for descriptions */}
                <div className="absolute right-0 top-0 bottom-0 w-full md:w-[calc(50%-1rem)] bg-gradient-to-br from-[#2C3539]/90 via-[#50C878]/30 to-white/20 rounded-2xl backdrop-blur-lg border border-white/20" />

                {/* Vertical timeline line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#50C878]/30 via-[#50C878]/20 to-transparent hidden md:block" />

                <div className="space-y-[400px] md:space-y-[400px]">
                  {lightingEras.map((era, index) => (
                    <div
                      key={era.era}
                      className="timeline-section relative group max-sm:z-50"
                      data-index={index}
                    >
                      {/* Timeline connector - Hidden on mobile */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:block">
                        {/* Center dot */}
                        <div className="w-4 h-4 rounded-full bg-[#50C878] shadow-[0_0_15px_rgba(80,200,120,0.5)] group-hover:scale-125 transition-transform duration-300" />

                        {/* Horizontal line */}
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 w-[calc(50%-2rem)] h-px bg-gradient-to-r from-[#50C878]/50 to-transparent group-hover:w-[calc(50%-1rem)] transition-all duration-300" />

                        {/* Animated rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="w-8 h-8 rounded-full border border-[#50C878]/20 animate-ping opacity-75" />
                          <div
                            className="absolute inset-0 w-12 h-12 rounded-full border border-[#50C878]/10 animate-ping opacity-50"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="w-full md:w-[calc(50%-1rem)] md:ml-auto">
                        <div className="p-4 md:p-8 bg-black/10 rounded-xl backdrop-blur-sm border border-white/5 transform transition-all duration-300 hover:translate-x-2 hover:bg-black/20">
                          <div className="text-white/90">
                            {/* Era number indicator */}
                            <div className="text-[#50C878]/30 text-8xl font-bold absolute -top-8 -left-4 select-none">
                              {(index + 1).toString().padStart(2, "0")}
                            </div>

                            <h3 className="text-3xl font-bold mb-4 relative">
                              {era.era}
                              <div className="absolute -bottom-1 left-0 w-16 h-px bg-gradient-to-r from-[#50C878]/50 to-transparent group-hover:w-32 transition-all duration-300" />
                            </h3>

                            <p className="text-lg leading-relaxed mb-6">
                              {era.description}
                            </p>

                            <div className="space-y-6">
                              <div className="transform transition-all duration-300 hover:translate-x-1">
                                <h4 className="text-sm font-medium uppercase tracking-wider mb-3 opacity-70">
                                  Features
                                </h4>
                                <ul className="space-y-2">
                                  {era.features.map((feature, i) => (
                                    <li
                                      key={i}
                                      className="flex items-center space-x-2 opacity-80 group/item"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]/50 group-hover/item:scale-150 group-hover/item:bg-[#50C878] transition-all duration-300" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="transform transition-all duration-300 hover:translate-x-1">
                                <h4 className="text-sm font-medium uppercase tracking-wider mb-3 opacity-70">
                                  Impact
                                </h4>
                                <p className="opacity-80">{era.impact}</p>

                                <div className="mt-4">
                                  <div className="text-sm opacity-70 mb-2">
                                    Efficiency Rating
                                  </div>
                                  <div className="h-2 rounded-full overflow-hidden bg-[#2C3539]/30">
                                    <div
                                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#50C878]/50 to-white/30"
                                      style={{
                                        width: `${parseInt(
                                          era.efficiency.split("-")[1]
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                  <div className="text-sm opacity-50 mt-1">
                                    {era.efficiency}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Spacer Section */}
                <div className="h-[48vh] flex items-center justify-center">
                  <div className="w-full md:w-[calc(50%-1rem)] md:ml-auto">
                    <div className="p-8 text-center">
                      <h3 className="text-2xl font-bold text-white/60 mb-4">
                        Future of Lighting
                      </h3>
                      <p className="text-white/40">
                        The journey of innovation continues...
                      </p>
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
          font-family: "Amenti-Bold";
          src: url("/fonts/amenti-clean-modern-sans/Amenti-Bold.otf")
            format("opentype");
        }
        .timeline-bg {
          background-color: #292929;
        }
        .timeline-heading span {
          transform-origin: center;
          display: inline-block;
          will-change: transform, opacity;
        }
        .timeline-heading {
          will-change: opacity, letter-spacing;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .text-gradient {
          background: linear-gradient(to right, #ffffff, #54bb74);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </>
  );
}

export default HeroSection;
