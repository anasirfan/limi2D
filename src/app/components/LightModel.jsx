"use client";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls } from "@react-three/drei";
import { gsap } from "gsap";

// Edison Bulb Scene Component (Three.js content only)
const EdisonBulbScene = ({ model, modelScale = 1, modelRotation = [0, 0, 0], position = [0, 0, 0], color, startAnimation }) => {
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
      Frame: scene.getObjectByName('Frame'),
      Holder: scene.getObjectByName('Holder'),
      Stem: scene.getObjectByName('Stem'),
      Flament: scene.getObjectByName('Flament'),
      OuterShell: scene.getObjectByName('OuterShell')
    };

    Object.values(parts).forEach(part => {
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
        color: new THREE.Color("#ffd700"),  // Golden yellow
        emissive: new THREE.Color("#ffb700"),  // Amber
        emissiveIntensity: 2,
        metalness: 0.8,
        roughness: 0.2,
        toneMapped: false
      });
    }

    if (parts.OuterShell) {
      parts.OuterShell.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#fffbeb"),  // Very pale yellow
        emissive: new THREE.Color("#ffeeba"),  // Warm glow
        emissiveIntensity: 0.5,
        metalness: 0,  // Non-metallic
        transmission: 0.95,
        thickness: 0.2,
        roughness: 0.01,  // Super smooth
        clearcoat: 1,
        clearcoatRoughness: 0.01,  // Smoother clearcoat
        transparent: true,
        opacity: 0.3,
        ior: 1.5,
        blending: THREE.NormalBlending,
        envMapIntensity: 1.5,
      });
    }

    tlRef.current = gsap.timeline({ 
      defaults: { ease: "power2.inOut" },
      paused: true
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
        duration: .5, 
        delay: .2,
        onUpdate: () => {
          parts.Flament.material.color = new THREE.Color("#ffd700");  // Golden yellow
          parts.Flament.material.emissive = new THREE.Color("#ffb700");  // Amber
        }
      })
      .set(parts.OuterShell, { visible: true })
      .from(parts.OuterShell.position, { y: -1, duration: 0.7 })
      .to(parts.OuterShell.material, { 
        emissiveIntensity: 0.5,
        transmission: 0.95,
        roughness: 0.01,  // Keep consistent with initial setup
        clearcoat: 1,
        clearcoatRoughness: 0.01,  // Keep consistent with initial setup
        opacity: 0.3,
        duration: 5,
        onUpdate: () => {
          parts.OuterShell.material.color = new THREE.Color("#fffbeb");  // Very pale yellow
          parts.OuterShell.material.emissive = new THREE.Color("#ffeeba");  // Warm glow
        }
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
    if (isOn && scene.getObjectByName('Flament')) {
      const baseGlow = 15;  // Reduced base glow
      const glowVariation = Math.sin(state.clock.elapsedTime) * 1.5;
      const glowIntensity = baseGlow + glowVariation;
      
      scene.getObjectByName('Flament').material.emissiveIntensity = glowIntensity;
      
      // Enhance outer shell glow
      if (scene.getObjectByName('OuterShell')) {
        const shellGlow = glowIntensity * 0.1;  // Reduced shell glow
        scene.getObjectByName('OuterShell').material.emissiveIntensity = shellGlow;
        scene.getObjectByName('OuterShell').material.metalness = 20;  // Keep non-metallic
        scene.getObjectByName('OuterShell').material.opacity = 0.3;  // Keep opacity constant
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={modelRotation} scale={modelScale} onClick={() => setIsOn(!isOn)}>
      <ambientLight ref={ambientLightRef} intensity={0.3} color="#FDB813" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" distance={10} decay={2} />
      <primitive object={scene} />
    </group>
  );
};

// CFL Bulb Component using GLTF model
const CFLBulb = ({ position, rotation, colors, scale, color }) => {
  const gltf = useGLTF("/models/CFLTube.glb");
  const [isOn, setIsOn] = useState(true);
  const tubeRef = useRef();

  useEffect(() => {
    if (gltf.materials?.Tube) {
      gltf.materials.Tube.emissive = new THREE.Color(color);
    }
  }, [color, gltf.materials]);

  // useFrame((state) => {
  //   if (tubeRef.current && isOn) {
  //     tubeRef.current.material.emissiveIntensity =
  //       Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 0.9;
  //   }
  // });

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={() => setIsOn(!isOn)}
    >
      <primitive object={gltf.scene} ref={tubeRef} />
    </group>
  );
};

// LED Light Component using GLTF model
const LEDLight = ({ position, rotation, colors, scale, color }) => {
  const gltf = useGLTF("/models/LedLight.glb");
  const [isOn, setIsOn] = useState(true);
  const ledRef = useRef();

  useEffect(() => {
    if (gltf.materials?.LED) {
      gltf.materials.LED.emissive = new THREE.Color(color);
    }
  }, [color, gltf.materials]);

  // useFrame(() => {
  //   if (ledRef.current && isOn) {
  //     ledRef.current.material.emissiveIntensity = isOn ? 1 : 0;
  //   }
  // });

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={() => setIsOn(!isOn)}
    >
      <primitive object={gltf.scene} ref={ledRef} />
    </group>
  );
};

// Modular LED Panel Component using GLTF model
const ModularPanel = ({ position, rotation, colors = Array(9).fill("#ffffff"), scale }) => {
  const gltf = useGLTF("/models/LedTrianglePanel.glb");
  const [triangleStates, setTriangleStates] = useState(Array(9).fill(true));
  const panelRef = useRef();

  useEffect(() => {
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
  }, [colors, triangleStates, gltf.scene]);

  const toggleTriangle = (index) => {
    setTriangleStates(prev => {
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

// Preload all models
useGLTF.preload("/models/VintageGlassBulb.glb");
useGLTF.preload("/models/CFLTube.glb");
useGLTF.preload("/models/LedLight.glb");
useGLTF.preload("/models/LedTrianglePanel.glb");

// Main component that includes both the 3D scene and CSS effects
const LightModel = ({ type, position, rotation, color, colors, scale }) => {
  const [showGlow, setShowGlow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start animations when entering viewport
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
          // Turn off glow when leaving viewport
          setShowGlow(false);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "-10% 0px -10% 0px" // Trigger slightly before edges
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [type]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Glow effects - Only show for Edison bulb */}
      {type === "edison" && (
        <div className={`absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none transition-opacity duration-1000 ${showGlow ? 'opacity-100' : 'opacity-0'}`}>
          {/* Inner bright glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-yellow-100 to-amber-200 opacity-60 blur-[40px] animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-yellow-50 to-amber-100 opacity-40 blur-[70px] animate-pulse delay-75" />
          
          {/* Outer subtle glow */}
          <div className="absolute inset-[-20px] rounded-full bg-gradient-to-br from-white/30 via-yellow-50/30 to-amber-100/30 blur-[100px] animate-pulse delay-100" />
          <div className="absolute inset-[-40px] rounded-full bg-gradient-to-br from-white/20 via-yellow-50/20 to-amber-100/20 blur-[150px] animate-pulse delay-150" />
        </div>
      )}

      {/* Three.js Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} shadows className={`relative z-10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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
            <CFLBulb position={position} rotation={rotation} color={color} />
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
};

export default LightModel;
