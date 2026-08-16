
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  // Use a reliable public texture or fallback to a nice procedural material
  // For this implementation, we'll use a sophisticated physical material with high detail
  
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Main Earth Sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#1e3a8a" 
          roughness={0.7} 
          metalness={0.2} 
          emissive="#0a192f"
          emissiveIntensity={0.5}
        />
        
        {/* Data Layer Grid */}
        <mesh scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshPhongMaterial 
            color="#22c55e" 
            opacity={0.1} 
            transparent 
            wireframe 
          />
        </mesh>
      </mesh>
      
      {/* Atmosphere Glow */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          color="#3b82f6" 
          opacity={0.05} 
          transparent 
          side={THREE.BackSide} 
        />
      </mesh>
    </group>
  );
};

const Satellite = ({ orbit, speed, color, name }: { orbit: number, speed: number, color: string, name: string }) => {
  const satRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (satRef.current) {
      satRef.current.position.x = Math.cos(t) * orbit;
      satRef.current.position.z = Math.sin(t) * orbit;
      satRef.current.position.y = Math.sin(t * 0.5) * (orbit * 0.2);
    }
  });

  return (
    <group ref={satRef}>
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
         <Text
          position={[0, 0.2, 0]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </Float>
      {/* Orbit Line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbit - 0.01, orbit + 0.01, 64]} />
        <meshBasicMaterial color="white" opacity={0.1} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export const Earth3D = () => {
  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden bg-[#020617] relative border border-slate-800 shadow-2xl">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          LIVE PLANETARY TELEMETRY
        </h3>
        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">
          Satellite Mesh Network: Active
        </p>
      </div>
      
      <div className="absolute bottom-6 left-6 z-10 grid grid-cols-2 gap-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700">
          <p className="text-[10px] text-slate-500 font-bold uppercase">System Status</p>
          <p className="text-emerald-400 text-sm font-black">OPERATIONAL</p>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Data Stream</p>
          <p className="text-blue-400 text-sm font-black">1.2 TB/SEC</p>
        </div>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <Earth />
        
        <Satellite orbit={3.5} speed={0.4} color="#22c55e" name="SENTINEL-2" />
        <Satellite orbit={4.2} speed={0.2} color="#3b82f6" name="LANDSAT-9" />
        <Satellite orbit={5.0} speed={0.1} color="#f59e0b" name="AQUA" />
      </Canvas>
    </div>
  );
};
