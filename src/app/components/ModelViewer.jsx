'use client';
import { useRef, useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { HexColorPicker } from 'react-colorful';

const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false });
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => mod.OrbitControls), { ssr: false });

const Model = ({ path, scale = 1, rotation = [0, 0, 0], position = [0, 0, 0], era }) => {
  const modelRef = useRef();
  const [triangleColors, setTriangleColors] = useState({});
  const [selectedTriangle, setSelectedTriangle] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (!modelRef.current) return;

    const loadGSAP = async () => {
      const gsap = (await import('gsap')).default;
      
      // Different animations based on era
      switch (era) {
        case 'Dawn of Electric Light':
          // Vintage bulb: warm flickering effect
          gsap.to(modelRef.current.position, {
            y: position[1] + 0.05,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
          });
          break;

        case 'Fluorescent Revolution':
          // CFL: subtle pulsing effect
          gsap.to(modelRef.current.children, {
            intensity: 1.2,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
          break;

        case 'LED Innovation':
          // LED: clean, stable light
          gsap.to(modelRef.current.rotation, {
            y: rotation[1] + Math.PI * 0.1,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "none"
          });
          break;

        case 'Smart Lighting Systems':
          // Modular panel: no default animation, handled by triangle colors
          break;
      }
    };

    loadGSAP();
  }, [era, position, rotation]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
        const loader = new GLTFLoader();
        const gltf = await new Promise((resolve, reject) => {
          loader.load(path, resolve, undefined, reject);
        });

        if (modelRef.current) {
          modelRef.current.add(gltf.scene);
          
          // Apply specific materials based on era
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              switch (era) {
                case 'Dawn of Electric Light':
                  child.material.emissive.set('#ff9c4d');
                  child.material.emissiveIntensity = 0.5;
                  break;
                
                case 'Fluorescent Revolution':
                  child.material.emissive.set('#f0f4ff');
                  child.material.emissiveIntensity = 0.8;
                  break;
                
                case 'LED Innovation':
                  child.material.emissive.set('#ffffff');
                  child.material.emissiveIntensity = 1;
                  break;
                
                case 'Smart Lighting Systems':
                  // For modular panel, each triangle can be controlled individually
                  if (child.name.includes('triangle')) {
                    const color = triangleColors[child.name] || '#ffffff';
                    child.material.emissive.set(color);
                    child.material.emissiveIntensity = 1;
                    
                    // Make triangles interactive
                    child.userData.isTriangle = true;
                  }
                  break;
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    loadModel();
  }, [path, era, triangleColors]);

  const handleTriangleClick = (triangleName) => {
    if (era === 'Smart Lighting Systems') {
      setSelectedTriangle(triangleName);
      setShowColorPicker(true);
    }
  };

  const handleColorChange = (color) => {
    if (selectedTriangle) {
      setTriangleColors(prev => ({
        ...prev,
        [selectedTriangle]: color
      }));
    }
  };

  return (
    <group
      ref={modelRef}
      scale={scale}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        if (e.object.userData.isTriangle) {
          e.stopPropagation();
          handleTriangleClick(e.object.name);
        }
      }}
    >
      {showColorPicker && era === 'Smart Lighting Systems' && (
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-lg z-10">
          <HexColorPicker
            color={triangleColors[selectedTriangle] || '#ffffff'}
            onChange={handleColorChange}
          />
          <button
            onClick={() => setShowColorPicker(false)}
            className="mt-2 w-full px-2 py-1 bg-white/20 rounded text-sm text-white hover:bg-white/30"
          >
            Close
          </button>
        </div>
      )}
    </group>
  );
};

const ModelViewer = ({ modelPath, scale, rotation, position, era }) => {
  return (
    <div className="relative w-full h-full">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none">
        {/* Inner bright glow */}
        <div className="absolute inset-0 rounded-full bg-white opacity-70 blur-[50px] animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-white opacity-50 blur-[80px] animate-pulse delay-75" />
        
        {/* Outer subtle glow */}
        <div className="absolute inset-[-20px] rounded-full bg-white/30 blur-[100px] animate-pulse delay-100" />
        <div className="absolute inset-[-40px] rounded-full bg-white/20 blur-[150px] animate-pulse delay-150" />
      </div>

      {/* Three.js Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 50 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <Model 
            path={modelPath}
            scale={scale}
            rotation={rotation}
            position={position}
            era={era}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ModelViewer;
