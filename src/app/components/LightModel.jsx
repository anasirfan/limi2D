'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei';

// Edison Bulb Component using GLTF model
const EdisonBulb = ({ position = [10, 10, 0], rotation = [0, 0, 0], color = '#ff8800', scale = 12 }) => {
  const { nodes, materials } = useGLTF('/models/VintageGlassBulb.glb');
  const [isOn, setIsOn] = useState(true);
  const glassRef = useRef();
  const filamentRef = useRef();

  // Fixed material properties
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    transmission: 0.9,
    thickness: 0.2,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.8
  }), []);

  const filamentMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ff8800',
    emissive: '#ff8800',
    emissiveIntensity: 1,
    toneMapped: false
  }), []);

  useEffect(() => {
    if (filamentRef.current) {
      filamentRef.current.material.emissiveIntensity = isOn ? 1 : 0;
    }
  }, [isOn]);

  return (
    <group 
      position={position} 
      rotation={[Math.PI, 0, 0]}  // Flip upright
      scale={scale}
      onClick={() => setIsOn(!isOn)}
    >
      <mesh 
        ref={glassRef}
        geometry={nodes.Glass.geometry}
        material={glassMaterial}
        castShadow
        receiveShadow
      />
      <mesh
        ref={filamentRef}
        geometry={nodes.Filament.geometry}
        material={filamentMaterial}
        castShadow
      />
    </group>
  );
};

// CFL Bulb Component using GLTF model
const CFLBulb = ({ position = [0, 0, 0], rotation = [0, 0, 0], color = '#ffffff' }) => {
  const { nodes, materials } = useGLTF('/models/CFLTube.glb');
  const [isOn, setIsOn] = useState(true);
  const tubeRef = useRef();

  useEffect(() => {
    if (materials.Tube) {
      materials.Tube.emissive = new THREE.Color(color);
    }
  }, [color, materials]);

  useFrame((state) => {
    if (tubeRef.current && isOn) {
      tubeRef.current.material.emissiveIntensity = 
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 0.9;
    }
  });

  return (
    <group position={position} rotation={rotation} onClick={() => setIsOn(!isOn)}>
      <primitive object={nodes.CFLTube} ref={tubeRef} />
    </group>
  );
};

// LED Light Component using GLTF model
const LEDLight = ({ position = [0, 0, 0], rotation = [0, 0, 0], color = '#ffffff' }) => {
  const { nodes, materials } = useGLTF('/models/LedLight.glb');
  const [isOn, setIsOn] = useState(true);
  const ledRef = useRef();

  useEffect(() => {
    if (materials.LED) {
      materials.LED.emissive = new THREE.Color(color);
    }
  }, [color, materials]);

  useFrame(() => {
    if (ledRef.current && isOn) {
      ledRef.current.material.emissiveIntensity = isOn ? 1 : 0;
    }
  });

  return (
    <group position={position} rotation={rotation} onClick={() => setIsOn(!isOn)}>
      <primitive object={nodes.LEDLight} ref={ledRef} />
    </group>
  );
};

// Modular LED Panel Component using GLTF model
const ModularPanel = ({ position = [0, 0, 0], rotation = [0, 0, 0], colors = Array(9).fill('#ffffff') }) => {
  const { nodes, materials } = useGLTF('/models/LedTrianglePanel.glb');
  const [triangleStates, setTriangleStates] = useState(Array(9).fill(true));
  const triangleRefs = useRef(Array(9).fill(null));

  useEffect(() => {
    colors.forEach((color, i) => {
      if (materials[`LED_${i}`]) {
        materials[`LED_${i}`].emissive = new THREE.Color(color);
      }
    });
  }, [colors, materials]);

  const toggleTriangle = (index) => {
    const newStates = [...triangleStates];
    newStates[index] = !newStates[index];
    setTriangleStates(newStates);
  };

  return (
    <group position={position} rotation={rotation}>
      <primitive 
        object={nodes.LEDPanel} 
        onClick={(e) => {
          e.stopPropagation();
          const triangleIndex = e.object.userData.triangleIndex;
          if (typeof triangleIndex === 'number') {
            toggleTriangle(triangleIndex);
          }
        }}
      />
    </group>
  );
};

// Preload all models
useGLTF.preload('/models/VintageGlassBulb.glb');
useGLTF.preload('/models/CFLTube.glb');
useGLTF.preload('/models/LedLight.glb');
useGLTF.preload('/models/LedTrianglePanel.glb');

// Main Light Model Component
const LightModel = ({ type, position = [0, 0, 0], rotation = [0, 0, 0], color = '#ffffff', colors, scale = 4 }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>       // 3D scene with camera at z=5
      <Environment preset="studio" />                // Studio lighting environment
      <OrbitControls 
        enableZoom={false}                          // Disable zooming
        enablePan={false}                           // Disable panning
        enableRotate={true}                         // Enable rotation
        minPolarAngle={Math.PI / 2}                // Lock vertical rotation at equator
        maxPolarAngle={Math.PI / 2}                // Lock vertical rotation at equator
        minAzimuthAngle={-Math.PI / 4}             // Limit horizontal rotation to -45 degrees
        maxAzimuthAngle={Math.PI / 4}              // Limit horizontal rotation to +45 degrees
      />
      <ambientLight intensity={0.5} />              // Soft overall lighting
      <pointLight position={[10, 10, 10]} />        // Main directional light
      
      {type === 'edison' && (
        <EdisonBulb position={position} rotation={rotation} color={color} scale={scale} />
      )}
      {type === 'cfl' && (
        <CFLBulb position={position} rotation={rotation} color={color} />
      )}
      {type === 'led' && (
        <LEDLight position={position} rotation={rotation} color={color} />
      )}
      {type === 'panel' && (
        <ModularPanel position={position} rotation={rotation} colors={colors || Array(9).fill(color)} />
      )}
    </Canvas>
  );
};

export default LightModel;
