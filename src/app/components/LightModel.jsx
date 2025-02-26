"use client";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls, Html } from "@react-three/drei";
import gsap from "gsap";

// Edison Bulb Scene Component (Three.js content only)
const EdisonBulbScene = ({
  model,
  modelScale = 1,
  modelRotation = [0, 0, 0],
  position = [0, 0, 0],
  color,
  startAnimation,
}) => {
  const { scene } = useGLTF(model);
  const [isOn, setIsOn] = useState(true);
  const groupRef = useRef();
  const filamentRef = useRef();
  const outerShellRef = useRef();
  const ambientLightRef = useRef();
  const tlRef = useRef();

  // Add continuous rotation animation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  useEffect(() => {
    if (!scene) return;

    // Hide all parts initially
    const parts = {
      Frame: scene.getObjectByName("Frame"),
      Holder: scene.getObjectByName("Holder"),
      Stem: scene.getObjectByName("Stem"),
      Flament: scene.getObjectByName("Flament"),
      OuterShell: scene.getObjectByName("OuterShell"),
    };

    Object.values(parts).forEach((part) => {
      if (part && part.material) {
        part.visible = false;
        part.material = part.material.clone();
      }
    });

    if (parts.Frame) {
      parts.Frame.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#292929"),
        roughness: 0.3,
        metalness: 0.7,
      });
    }

    if (parts.Flament) {
      parts.Flament.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ffd700"), // Golden yellow
        emissive: new THREE.Color("#ffb700"), // Amber
        emissiveIntensity: 2,
        metalness: 0.8,
        roughness: 0.2,
        toneMapped: false,
      });
    }

    if (parts.OuterShell) {
      parts.OuterShell.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#fffbeb"), // Very pale yellow
        emissive: new THREE.Color("#ffeeba"), // Warm glow
        emissiveIntensity: 0.5,
        metalness: 0, // Non-metallic
        transmission: 0.95,
        thickness: 0.2,
        roughness: 0.01, // Super smooth
        clearcoat: 1,
        clearcoatRoughness: 0.01, // Smoother clearcoat
        transparent: true,
        opacity: 0.3,
        ior: 1.5,
        blending: THREE.NormalBlending,
        envMapIntensity: 1.5,
      });
    }

    tlRef.current = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      paused: true,
      onStart: () => {},
      onComplete: () => {},
    });

    tlRef.current
      .set(parts.Frame, { visible: true })
      .from(parts.Frame.position, { y: 2, duration: 0.5 })
      .to(parts.Frame.position, { y: 0.15 })
      .set(parts.Holder, { visible: true }, "+=0.2")
      .from(parts.Holder.position, { y: 1.5, duration: 0.5 })
      .set(parts.Stem, { visible: true })
      .from(parts.Stem.position, { y: 1, duration: 0.5 })
      .set(parts.Flament, { visible: true })
      .from(parts.Flament.position, { y: 0.5, duration: 0.5 })
      .to(parts.Flament.material, {
        emissiveIntensity: 15,
        roughness: 0.2,
        duration: 0.5,
        delay: 0.2,
        onUpdate: () => {
          parts.Flament.material.color = new THREE.Color("#ffd700"); // Golden yellow
          parts.Flament.material.emissive = new THREE.Color("#ffb700"); // Amber
        },
      })
      .set(parts.OuterShell, { visible: true })
      .from(parts.OuterShell.position, { y: -1, duration: 0.7 })
      .to(parts.OuterShell.material, {
        emissiveIntensity: 0.5,
        transmission: 0.95,
        roughness: 0.01, // Keep consistent with initial setup
        clearcoat: 1,
        clearcoatRoughness: 0.01, // Keep consistent with initial setup
        opacity: 0.3,
        duration: 5,
        onUpdate: () => {
          parts.OuterShell.material.color = new THREE.Color("#fffbeb"); // Very pale yellow
          parts.OuterShell.material.emissive = new THREE.Color("#ffeeba"); // Warm glow
        },
      });
  }, [scene, color]);

  // Start animation when startAnimation prop changes
  useEffect(() => {
    if (startAnimation && tlRef.current) {
      tlRef.current.play();
    }
  }, [startAnimation]);

  // Continuous animations
  useFrame((state) => {
    if (!groupRef.current || !scene) return;

    // Enhanced filament glow animation
    if (isOn && scene.getObjectByName("Flament")) {
      const baseGlow = 15; // Reduced base glow
      const glowVariation = Math.sin(state.clock.elapsedTime) * 1.5;
      const glowIntensity = baseGlow + glowVariation;

      scene.getObjectByName("Flament").material.emissiveIntensity =
        glowIntensity;

      // Enhance outer shell glow
      if (scene.getObjectByName("OuterShell")) {
        const shellGlow = glowIntensity * 0.1; // Reduced shell glow
        scene.getObjectByName("OuterShell").material.emissiveIntensity =
          shellGlow;
        scene.getObjectByName("OuterShell").material.metalness = 20; // Keep non-metallic
        scene.getObjectByName("OuterShell").material.opacity = 0.3; // Keep opacity constant
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={modelRotation}
      scale={modelScale}
      onClick={() => setIsOn(!isOn)}
    >
      <ambientLight ref={ambientLightRef} intensity={0.3} color="#FDB813" />
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color="#FDB813"
        distance={10}
        decay={2}
      />
      <primitive object={scene} />
    </group>
  );
};

// CFL Bulb Component using GLTF model
const CFLBulb = forwardRef(({ position, rotation, scale }, ref) => {
  const { nodes, materials } = useGLTF("/models/CFLTube.glb");
  const tubeRef = useRef();
  const baseRef = useRef();
  const modelRef = useRef();
  const animationRef = useRef();
  const [isAssembled, setIsAssembled] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Trigger animation at scroll position 1890
      if (currentScrollY >= 1890 && !hasAnimated && modelRef.current) {
        startAnimation();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAnimated]);

  const startAnimation = () => {
    if (
      !hasAnimated &&
      tubeRef.current &&
      baseRef.current &&
      modelRef.current
    ) {
      const tube = tubeRef.current;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      baseRef.current.material.emissive.set("#80ff80");
      tube.material.emissive.set("#80ff80");
      baseRef.current.material.emissiveIntensity = 0;
      tube.material.emissiveIntensity = 0;

      animationRef.current = gsap.timeline();

      animationRef.current
        .to(modelRef.current.rotation, {
          y: modelRef.current.rotation.y + Math.PI * 2,
          duration: 1.5,
          ease: "power2.inOut",
        })
        .to(tube.position, {
          y: tube.position.y - 0.5,
          duration: 1.5,
          ease: "power2.inOut",
          onComplete: () => {
            setIsAssembled(true);
            setHasAnimated(true);
          },
        })
        .to(
          [baseRef.current.material, tube.material],
          {
            emissiveIntensity: 40,
            duration: 1,
            ease: "power2.inOut",
          },
          "-=0.5"
        )
        .to(
          modelRef.current.rotation,
          {
            y: modelRef.current.rotation.y + Math.PI * 4,
            duration: 8,
            ease: "none",
            repeat: -1,
          },
          "<"
        );
    }
  };

  // Expose startAnimation method to parent
  useImperativeHandle(ref, () => ({
    startAnimation,
  }));

  useEffect(() => {
    if (!nodes) return;

    const base = nodes.ElectronicBase;
    const tube = nodes.Tube;

    if (base && tube) {
      baseRef.current = base;
      tubeRef.current = tube;

      if (tube) {
        tube.position.y += 0.5;
        base.material.color = new THREE.Color("#c0c0c0"); 
        // base.material.emissive = new THREE.Color("#c0c0c0"); 
        tube.material.emissive.set("#000000");
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [nodes]);

  return (
    <>
      <group position={position} rotation={rotation} ref={modelRef}>
        <primitive object={nodes.Tube} ref={tubeRef} />
        <primitive object={nodes.ElectronicBase} ref={baseRef} />
      </group>
      <Html>
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,255,0,0.05)",
          }}
        >
          {isAssembled && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-green-100 to-green-200 blur-[40px] animate-pulse opacity-60" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-green-50 to-green-100 blur-[70px] animate-pulse delay-75 opacity-40" />
              <div className="absolute inset-[-20px] rounded-full bg-gradient-to-br from-white/30 via-green-50/30 to-green-100/30 blur-[100px] animate-pulse delay-100" />
              <div className="absolute inset-[-40px] rounded-full bg-gradient-to-br from-white/20 via-green-50/20 to-green-100/20 blur-[150px] animate-pulse delay-150" />
            </div>
          )}
        </div>
      </Html>
    </>
  );
});

// LED Light Component using GLTF model
const LEDLight = ({ position, rotation, color = "#292929" }) => {
  const { nodes } = useGLTF("/models/LedLight.glb");
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isAssembled, setIsAssembled] = useState(false);
  const modelRef = useRef();
  const holderRef = useRef();
  const chipsRef = useRef();
  const frameRef = useRef();
  const threadsRef = useRef();
  const animationRef = useRef();

  useEffect(() => {
    if (!nodes) return;

    // Setup materials with emission properties
    const setupMaterial = (ref, baseColor = "#ffffff") => {
      if (ref.current) {
        ref.current.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(baseColor),
          emissive: new THREE.Color("#292929"),
          emissiveIntensity: 0,
          metalness: 0.7,
          roughness: 0.2,
          transparent: true,
          opacity: 1
        });
      }
    };

    // Brown wood-like material for ceiling holder
    setupMaterial(holderRef, "#8B4513");  // Saddle brown
    // Metallic silver for threads
    if (threadsRef.current) {
      threadsRef.current.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#C0C0C0"),  // Silver
        emissive: new THREE.Color(color),
        emissiveIntensity: 0,
        metalness: 0.9,  // More metallic
        roughness: 0.1,  // Smoother
        transparent: true,
        opacity: 1,
        envMapIntensity: 1.2  // Enhanced reflections
      });
    }
    setupMaterial(chipsRef, "#ffffff");
    
    // Soft dark green for frame
    if (frameRef.current) {
      frameRef.current.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#292929"),  // Dark forest green
        emissive: new THREE.Color("#292929"),
        emissiveIntensity: 0,
        metalness: 0.4,  // Semi-metallic
        roughness: 0.7,  // More matte finish
        transparent: true,
        opacity: 1,
        clearcoat: 0.3,  // Slight clearcoat for depth
        clearcoatRoughness: 0.8  // Diffused clearcoat
      });
    }
  }, [nodes, color]);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Trigger animation at scroll position 1890
      if (currentScrollY >= 2600 && !hasAnimated && modelRef.current) {
        startAnimation();
      } 
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAnimated]);

  

  const startAnimation = () => {

    if (holderRef.current && chipsRef.current && frameRef.current && threadsRef.current) {
      if (animationRef.current) {
        animationRef.current.kill();
      }

      // Reset all parts
      [holderRef, chipsRef, frameRef, threadsRef].forEach(ref => {
        if (ref.current) {
          ref.current.material.emissiveIntensity = 0;
          ref.current.position.y = 2; // Move all parts up
          ref.current.material.opacity = 0;
        }
      });

      animationRef.current = gsap.timeline({
        defaults: { duration: 0.8, ease: "power2.inOut" }
      });

      // Animate each part sequentially
      animationRef.current
        // Holder animation
        .to(holderRef.current.position, { y: 0.7116711735725403, duration: 1 })
        .to(holderRef.current.material, { opacity: 1 }, "<")
        .to(holderRef.current.material, { emissiveIntensity: 0.3 }, ">")
        
        // Threads animation
        .to(threadsRef.current.position, { y: 0.7116711735725403, duration: 1 }, ">-0.3")
        .to(threadsRef.current.material, { opacity: 1 }, "<")
        .to(threadsRef.current.material, { emissiveIntensity: 0.3 }, ">")
        
        // Frame animation
        .to(frameRef.current.position, { y: 0.2619827091693878, duration: 1 }, ">-0.3")
        .to(frameRef.current.material, { opacity: 1 }, "<")
        .to(frameRef.current.material, { emissiveIntensity: 0.5 }, ">")
        
        // LED Chips animation (with stronger emission)
        .to(chipsRef.current.position, { y: 0.23379462957382202, duration: 1 }, ">-0.3")
        .to(chipsRef.current.material, { opacity: 1 }, "<")
        .to(chipsRef.current.material, { emissiveIntensity: 1.5 }, ">")
        
        // Final rotation
        .to(modelRef.current.rotation, {
          y: modelRef.current.rotation.y + Math.PI * 2,
          duration: 1.5,
          ease: "power2.inOut"
        })
        .to([holderRef, chipsRef, frameRef, threadsRef].map(ref => ref.current.material), {
          emissiveIntensity: ref => ref === chipsRef.current.material ? 2 : 0.5,
          duration: 0.5
        })
        .call(() => {
          setIsAssembled(true);
          setHasAnimated(true);
        });
    }
  };



  return (
    <>
      <group position={position} rotation={rotation} scale={4} ref={modelRef}>
        <primitive object={nodes.Ceiling_Holder} ref={holderRef} />
        <primitive object={nodes.Led_Chips} ref={chipsRef} />
        <primitive object={nodes.Led_Frame} ref={frameRef} />
        <primitive object={nodes.Threads} ref={threadsRef} />
      </group>
      <Html>
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,255,0,0.05)",
          }}
        >
          {isAssembled && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-green-100 to-green-200 blur-[40px] animate-pulse opacity-60" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-green-50 to-green-100 blur-[70px] animate-pulse delay-75 opacity-40" />
              <div className="absolute inset-[-20px] rounded-full bg-gradient-to-br from-white/30 via-green-50/30 to-green-100/30 blur-[100px] animate-pulse delay-100" />
              <div className="absolute inset-[-40px] rounded-full bg-gradient-to-br from-white/20 via-green-50/20 to-green-100/20 blur-[150px] animate-pulse delay-150" />
            </div>
          )}
        </div>
      </Html>
    </>
  );
};

// Modular LED Panel Component using GLTF model
const ModularPanel = ({
  position,
  rotation,
  colors = Array(9).fill("#ffffff"),
  scale,
}) => {
  const gltf = useGLTF("/models/LedTrianglePanel.glb");
  const [triangleStates, setTriangleStates] = useState(Array(9).fill(true));
  const panelRef = useRef();
  const tlRef = useRef();

  useEffect(() => {
    if (!gltf) return;

    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.name.includes("Triangle")) {
          const index = parseInt(child.name.split("_")[1]);
          if (!isNaN(index) && colors[index]) {
            child.material.emissive = new THREE.Color(colors[index]);
            child.material.emissiveIntensity = triangleStates[index] ? 1 : 0;
          }
        }
      });
    }

    tlRef.current = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      paused: true,
      onStart: () => {},
      onComplete: () => {},
    });

    tlRef.current
      .from(gltf.scene.position, { y: 2, duration: 1 })
      .to(gltf.scene.position, { y: 0, duration: 0.5 });
  }, [gltf, colors, triangleStates]);

  useEffect(() => {
    if (tlRef.current) tlRef.current.play();
  }, []);

  const toggleTriangle = (index) => {
    setTriangleStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      ref={panelRef}
      onClick={(e) => {
        e.stopPropagation();
        const name = e.object.name;
        if (name.includes("Triangle")) {
          const index = parseInt(name.split("_")[1]);
          if (!isNaN(index)) {
            toggleTriangle(index);
          }
        }
      }}
    >
      <primitive object={gltf.scene} />
    </group>
  );
};

// Custom Intersection Observer Hook
const useIntersectionObserver = (callback, options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);
  const [intersectionRatio, setIntersectionRatio] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        const ratio = entry.intersectionRatio;
        setIsInView(isVisible);
        setIntersectionRatio(ratio);
        callback(isVisible, ratio);
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "-20% 0px",
        ...options,
      }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [callback, options]);

  return [elementRef, isInView, intersectionRatio];
};

// Preload all models
useGLTF.preload("/models/VintageGlassBulb.glb");
useGLTF.preload("/models/CFLTube.glb");
useGLTF.preload("/models/LedLight.glb");
useGLTF.preload("/models/LedTrianglePanel.glb");

// Main component that includes both the 3D scene and CSS effects
const LightModel = forwardRef(function LightModel(
  { type, position, rotation, color, colors, scale },
  ref
) {
  const [showGlow, setShowGlow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const containerRef = useRef(null);

  const handleVisibilityChange = useCallback(
    (isVisible) => {
      if (isVisible) {
        setTimeout(() => {
          setIsVisible(true);
          setStartAnimation(true);
          if (type === "edison") {
            setTimeout(() => {
              setShowGlow(true);
            }, 4000);
          }
        }, 500);
      } else {
        setShowGlow(false);
      }
    },
    [type]
  );

  const [intersectionRef, isInView] = useIntersectionObserver(
    handleVisibilityChange,
    {
      threshold: 0.5,
      rootMargin: "-20% 0px",
    }
  );

  return (
    <div ref={intersectionRef} className="relative w-full h-full">
      {/* Glow effects - Only show for Edison bulb */}
      {type === "edison" && (
        <div
          className={`absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none transition-opacity duration-1000 ${
            showGlow ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Inner bright glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-yellow-100 to-amber-200 opacity-60 blur-[40px] animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-yellow-50 to-amber-100 opacity-40 blur-[70px] animate-pulse delay-75" />

          {/* Outer subtle glow */}
          <div className="absolute inset-[-20px] rounded-full bg-gradient-to-br from-white/30 via-yellow-50/30 to-amber-100/30 blur-[100px] animate-pulse delay-100" />
          <div className="absolute inset-[-40px] rounded-full bg-gradient-to-br from-white/20 via-yellow-50/20 to-amber-100/20 blur-[150px] animate-pulse delay-150" />
        </div>
      )}

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows
        className={`relative z-10 transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {type === "edison" && (
            <EdisonBulbScene
              model="/models/VintageGlassBulb.glb"
              modelScale={scale}
              modelRotation={rotation}
              position={position}
              color={color}
              startAnimation={startAnimation}
            />
          )}
          {type === "cfl" && (
            <CFLBulb
              ref={ref}
              position={position}
              rotation={rotation}
              scale={scale}
            />
          )}
          {type === "led" && (
            <LEDLight position={position} rotation={rotation} color={color} />
          )}
          {type === "panel" && (
            <ModularPanel
              position={position}
              rotation={rotation}
              colors={colors || Array(9).fill(color)}
              scale={scale}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
});

export default LightModel;
