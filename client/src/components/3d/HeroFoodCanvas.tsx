import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const HeroFoodCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    if (mediaQuery.matches || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffa726, 2.5);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4299e1, 1.5);
    rimLight.position.set(-5, -3, -2);
    scene.add(rimLight);

    // 3. Central Cloche / Gourmet Serving Bell
    const clocheGroup = new THREE.Group();

    // Dish Base / Plate
    const plateGeo = new THREE.CylinderGeometry(2.2, 2.0, 0.15, 64);
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: 0x2A2E3D,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -1.2;
    clocheGroup.add(plate);

    // Plate Inner Rim (Golden accent)
    const rimGeo = new THREE.TorusGeometry(1.9, 0.05, 16, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.9,
      roughness: 0.2
    });
    const goldRim = new THREE.Mesh(rimGeo, goldMat);
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.y = -1.1;
    clocheGroup.add(goldRim);

    // Dome Lid
    const domeGeo = new THREE.SphereGeometry(1.6, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xD4AF37,
      metalness: 0.95,
      roughness: 0.18,
      clearcoat: 1.0,
      reflectivity: 0.9
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = -1.1;
    clocheGroup.add(dome);

    // Dome Handle Ring
    const handleGeo = new THREE.TorusGeometry(0.25, 0.06, 16, 32);
    const handle = new THREE.Mesh(handleGeo, goldMat);
    handle.position.y = 0.6;
    clocheGroup.add(handle);

    scene.add(clocheGroup);

    // 4. Floating Stylized Ingredients (Avocado, Herb Spheres, Citrus Slices, Golden Dust)
    const ingredientsGroup = new THREE.Group();

    // Avocado / Lime (Emerald green ellipsoid)
    const limeGeo = new THREE.SphereGeometry(0.35, 32, 16);
    limeGeo.scale(1, 1.4, 0.9);
    const limeMat = new THREE.MeshStandardMaterial({
      color: 0x38A169,
      roughness: 0.4
    });
    const lime = new THREE.Mesh(limeGeo, limeMat);
    lime.position.set(-2.5, 1.2, 0.5);
    ingredientsGroup.add(lime);

    // Star Anise / Berry (Ruby jewel)
    const berryGeo = new THREE.IcosahedronGeometry(0.28, 1);
    const berryMat = new THREE.MeshPhysicalMaterial({
      color: 0x9B2C2C,
      metalness: 0.3,
      roughness: 0.2,
      transmission: 0.6,
      thickness: 0.5
    });
    const berry = new THREE.Mesh(berryGeo, berryMat);
    berry.position.set(2.4, 1.6, 0.2);
    ingredientsGroup.add(berry);

    // Golden Truffle Sphere
    const truffleGeo = new THREE.DodecahedronGeometry(0.32, 0);
    const truffle = new THREE.Mesh(truffleGeo, goldMat);
    truffle.position.set(-2.2, -0.6, 1.2);
    ingredientsGroup.add(truffle);

    // Fresh Basil / Mint leaf
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.2, 0.4, 0, 0.7);
    leafShape.quadraticCurveTo(-0.2, 0.4, 0, 0);
    const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
    const leafGeo = new THREE.ExtrudeGeometry(leafShape, extrudeSettings);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x48BB78, roughness: 0.3 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(2.2, -0.8, 0.8);
    leaf.rotation.z = 0.5;
    ingredientsGroup.add(leaf);

    scene.add(ingredientsGroup);

    // 5. Floating Amber Particle Sparkles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xE28743,
      size: 0.06,
      transparent: true,
      opacity: 0.75
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / height) * 2 - 1);
      mouseX = x * 0.4;
      mouseY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation toward mouse
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Cloche subtle gentle float
      clocheGroup.rotation.y = Math.sin(elapsedTime * 0.3) * 0.25;
      clocheGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.1;

      // Floating ingredients orbits
      lime.position.y = 1.2 + Math.sin(elapsedTime * 1.2) * 0.15;
      lime.rotation.y = elapsedTime * 0.6;

      berry.position.y = 1.6 + Math.cos(elapsedTime * 1.1) * 0.12;
      berry.rotation.x = elapsedTime * 0.4;

      truffle.position.y = -0.6 + Math.sin(elapsedTime * 0.9 + 1) * 0.1;
      truffle.rotation.z = elapsedTime * 0.5;

      leaf.position.y = -0.8 + Math.cos(elapsedTime * 0.7 + 2) * 0.14;
      leaf.rotation.y = elapsedTime * 0.3;

      // Rotate sparkles
      particles.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!webGLSupported || prefersReducedMotion) {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-8 bg-gradient-to-tr from-amber-500/10 via-rose-500/5 to-transparent rounded-3xl border border-amber-200/40">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-xl shadow-brand-500/20 text-white text-3xl">
            🍽️
          </div>
          <h3 className="font-display text-xl font-bold text-slate-800">Haute Cuisine, Delivered & Reserved</h3>
          <p className="text-sm text-slate-500 max-w-xs">Connecting discerning epicures with Michelin-worthy dining rooms and artisanal cloud kitchens.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[420px] select-none cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D Gourmet Cloche and Floating Ingredients Showcase"
    />
  );
};
