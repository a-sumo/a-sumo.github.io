import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type VizMode = "arrows" | "particles" | "trails";

interface VectorFieldVizProps {
  fieldType?: "dipole" | "vortex" | "uniform" | "sink";
}

// Vector field functions
const vectorFields = {
  dipole: (x: number, y: number) => {
    // Magnetic dipole field
    const r = Math.sqrt(x * x + y * y);
    if (r < 0.1) return { x: 0, y: 0 };
    const r3 = r * r * r;
    const mx = 0, my = 1; // dipole moment pointing up
    const dot = mx * x + my * y;
    return {
      x: (3 * dot * x / (r * r) - mx) / r3,
      y: (3 * dot * y / (r * r) - my) / r3,
    };
  },
  vortex: (x: number, y: number) => {
    const r = Math.sqrt(x * x + y * y);
    if (r < 0.1) return { x: 0, y: 0 };
    const strength = 1 / (1 + r * 0.5);
    return { x: -y * strength, y: x * strength };
  },
  uniform: (_x: number, _y: number) => ({ x: 1, y: 0.3 }),
  sink: (x: number, y: number) => {
    const r = Math.sqrt(x * x + y * y);
    if (r < 0.1) return { x: 0, y: 0 };
    return { x: -x / (r * r), y: -y / (r * r) };
  },
};

type FieldType = "dipole" | "vortex" | "uniform" | "sink";

const fieldLabels: Record<FieldType, string> = {
  dipole: "Magnetic Dipole",
  vortex: "Vortex",
  uniform: "Uniform Flow",
  sink: "Sink",
};

export default function VectorFieldViz({
  fieldType: initialFieldType = "dipole",
}: VectorFieldVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<{ pos: THREE.Vector2; vel: THREE.Vector2; trail: THREE.Vector2[] }[]>([]);
  const arrowsGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const trailsGroupRef = useRef<THREE.Group | null>(null);
  const sizeRef = useRef({ width: 700, height: 450 });

  const [mode, setMode] = useState<VizMode>("particles");
  const [fieldType, setFieldType] = useState<FieldType>(initialFieldType);
  const [isLoaded, setIsLoaded] = useState(false);
  const [blendProgress, setBlendProgress] = useState(0); // 0-1 for carousel position
  const timeRef = useRef(0);
  const fieldTypeRef = useRef<FieldType>(initialFieldType);
  const prevFieldTypeRef = useRef<FieldType>(initialFieldType);
  const blendFactorRef = useRef(1); // 1 = fully on new field
  const transitionStartRef = useRef(0);

  const fieldTypes: FieldType[] = ["dipole", "vortex", "uniform", "sink"];
  const updateParticlesRef = useRef<() => void>(() => {});

  // Carousel drag state
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartRef = useRef<{ y: number; index: number } | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (clientY: number) => {
    dragStartRef.current = { y: clientY, index: fieldTypes.indexOf(fieldType) };
    setDragOffset(0);
  };

  const handleDragMove = (clientY: number) => {
    if (!dragStartRef.current) return;
    const delta = clientY - dragStartRef.current.y;
    setDragOffset(delta);
  };

  const handleDragEnd = () => {
    if (!dragStartRef.current) return;
    const threshold = 30; // px to trigger change
    const currentIndex = dragStartRef.current.index;

    if (dragOffset < -threshold && currentIndex < fieldTypes.length - 1) {
      setFieldType(fieldTypes[currentIndex + 1]);
    } else if (dragOffset > threshold && currentIndex > 0) {
      setFieldType(fieldTypes[currentIndex - 1]);
    }

    dragStartRef.current = null;
    setDragOffset(0);
  };

  // Interpolate between two fields
  const getBlendedField = (x: number, y: number) => {
    const prevField = vectorFields[prevFieldTypeRef.current];
    const nextField = vectorFields[fieldTypeRef.current];
    const t = blendFactorRef.current;

    const prev = prevField(x, y);
    const next = nextField(x, y);

    return {
      x: prev.x * (1 - t) + next.x * t,
      y: prev.y * (1 - t) + next.y * t,
    };
  };

  // Animate blend factor
  useEffect(() => {
    let animationId: number | null = null;
    let cancelled = false;

    if (fieldType !== prevFieldTypeRef.current) {
      prevFieldTypeRef.current = fieldTypeRef.current;
      fieldTypeRef.current = fieldType;
      blendFactorRef.current = 0;
      transitionStartRef.current = performance.now();

      // Clear trails for clean transition
      particlesRef.current.forEach(p => {
        p.trail = [];
        p.vel.set(0, 0);
      });

      // Animate blend
      const animate = () => {
        if (cancelled) return;

        const elapsed = performance.now() - transitionStartRef.current;
        const duration = 400; // ms
        const t = Math.min(elapsed / duration, 1);
        // Ease out cubic
        blendFactorRef.current = 1 - Math.pow(1 - t, 3);

        if (t < 1) {
          animationId = requestAnimationFrame(animate);
        } else {
          prevFieldTypeRef.current = fieldType;
        }
      };
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      cancelled = true;
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [fieldType]);

  // Initialize Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    // Get container size
    const containerWidth = Math.min(containerRef.current.parentElement?.clientWidth || 700, 800);
    const width = containerWidth;
    const height = Math.round(containerWidth * 0.6);
    sizeRef.current = { width, height };

    // Scene (transparent background - CSS handles the background)
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera (orthographic for 2D)
    const aspect = width / height;
    const frustumSize = 5;
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect,
      frustumSize * aspect,
      frustumSize,
      -frustumSize,
      0.1,
      100
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    // Renderer (alpha for transparent background)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Groups
    arrowsGroupRef.current = new THREE.Group();
    particlesGroupRef.current = new THREE.Group();
    trailsGroupRef.current = new THREE.Group();
    scene.add(arrowsGroupRef.current);
    scene.add(particlesGroupRef.current);
    scene.add(trailsGroupRef.current);

    // Initialize arrows
    createArrowsForField(vectorFields[initialFieldType]);

    // Initialize particles
    initParticles();

    // Mark as loaded and do initial render
    setIsLoaded(true);
    renderer.render(scene, camera);

    return () => {
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // Only run once on mount - field changes are handled by refs

  // Create arrow grid with mesh-based thick arrows
  const createArrowsForField = (fieldFn: (x: number, y: number) => { x: number; y: number }) => {
    if (!arrowsGroupRef.current) return;

    // Dispose old geometries
    arrowsGroupRef.current.children.forEach(child => {
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    });
    arrowsGroupRef.current.clear();

    const gridSize = 14;
    const spacing = 0.55;
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });

    for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
      for (let j = -gridSize / 2; j <= gridSize / 2; j++) {
        const x = i * spacing;
        const y = j * spacing;
        const field = fieldFn(x, y);
        const mag = Math.sqrt(field.x * field.x + field.y * field.y);

        if (mag < 0.01) continue;

        // Normalize direction
        const nx = field.x / mag;
        const ny = field.y / mag;

        // Perpendicular for thickness
        const px = -ny;
        const py = nx;

        // Arrow dimensions - scale with magnitude but with good minimums
        const shaftLength = Math.max(0.15, Math.min(mag * 0.4, 0.4));
        const shaftThickness = 0.03;
        const headLength = 0.14;
        const headBase = 0.1;

        // Arrow shaft as quad (2 triangles)
        const shaftEndX = x + nx * shaftLength;
        const shaftEndY = y + ny * shaftLength;
        const shaftVerts = new Float32Array([
          x - px * shaftThickness, y - py * shaftThickness, 0,
          x + px * shaftThickness, y + py * shaftThickness, 0,
          shaftEndX + px * shaftThickness, shaftEndY + py * shaftThickness, 0,
          x - px * shaftThickness, y - py * shaftThickness, 0,
          shaftEndX + px * shaftThickness, shaftEndY + py * shaftThickness, 0,
          shaftEndX - px * shaftThickness, shaftEndY - py * shaftThickness, 0,
        ]);
        const shaftGeom = new THREE.BufferGeometry();
        shaftGeom.setAttribute('position', new THREE.BufferAttribute(shaftVerts, 3));
        const shaft = new THREE.Mesh(shaftGeom, arrowMaterial);
        arrowsGroupRef.current!.add(shaft);

        // Arrow head as triangle (fixed size)
        const tipX = shaftEndX + nx * headLength;
        const tipY = shaftEndY + ny * headLength;

        const headVerts = new Float32Array([
          tipX, tipY, 0,
          shaftEndX - px * headBase, shaftEndY - py * headBase, 0,
          shaftEndX + px * headBase, shaftEndY + py * headBase, 0,
        ]);
        const headGeom = new THREE.BufferGeometry();
        headGeom.setAttribute('position', new THREE.BufferAttribute(headVerts, 3));
        const head = new THREE.Mesh(headGeom, arrowMaterial);
        arrowsGroupRef.current!.add(head);
      }
    }
  };

  // Initialize particles
  const initParticles = () => {
    particlesRef.current = [];
    const numParticles = 150;

    for (let i = 0; i < numParticles; i++) {
      particlesRef.current.push({
        pos: new THREE.Vector2(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6
        ),
        vel: new THREE.Vector2(0, 0),
        trail: [],
      });
    }
  };

  // Update particles - always use refs to avoid stale closures
  updateParticlesRef.current = () => {
    if (!particlesGroupRef.current || !trailsGroupRef.current) return;

    // Dispose old geometries to prevent memory leak
    particlesGroupRef.current.children.forEach(child => {
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    });
    trailsGroupRef.current.children.forEach(child => {
      if ((child as THREE.Line).geometry) (child as THREE.Line).geometry.dispose();
    });

    particlesGroupRef.current.clear();
    trailsGroupRef.current.clear();

    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b35 }); // Orange
    const particleGeometry = new THREE.CircleGeometry(0.05, 8);

    // Get blended field using refs
    const prevField = vectorFields[prevFieldTypeRef.current];
    const nextField = vectorFields[fieldTypeRef.current];
    const blendT = blendFactorRef.current;

    particlesRef.current.forEach((p) => {
      // Get blended field at current position
      const prev = prevField(p.pos.x, p.pos.y);
      const next = nextField(p.pos.x, p.pos.y);
      const field = {
        x: prev.x * (1 - blendT) + next.x * blendT,
        y: prev.y * (1 - blendT) + next.y * blendT,
      };
      const mag = Math.sqrt(field.x * field.x + field.y * field.y);

      if (mag > 0.01) {
        // Update velocity (smooth interpolation)
        const speed = Math.min(mag * 0.5, 0.08);
        p.vel.x = p.vel.x * 0.9 + (field.x / mag) * speed * 0.1;
        p.vel.y = p.vel.y * 0.9 + (field.y / mag) * speed * 0.1;
      }

      // Update position
      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;

      // Store trail
      p.trail.push(new THREE.Vector2(p.pos.x, p.pos.y));
      if (p.trail.length > 50) p.trail.shift();

      // Teleport logic - apply to all presets
      const currentField = fieldTypeRef.current;
      const r = Math.sqrt(p.pos.x * p.pos.x + p.pos.y * p.pos.y);
      const speed = Math.sqrt(p.vel.x * p.vel.x + p.vel.y * p.vel.y);
      let shouldTeleport = false;

      // Center proximity check (for convergent fields)
      if (r < 0.3) {
        shouldTeleport = true;
      }
      // Stagnation check (particle moving too slowly)
      if (speed < 0.001 && p.trail.length > 10) {
        shouldTeleport = true;
      }

      // Wrap-around for uniform flow
      if (currentField === "uniform") {
        if (p.pos.x > 5) {
          p.pos.x = -5;
          p.trail = [];
        }
        if (p.pos.y > 4) {
          p.pos.y = -4;
          p.trail = [];
        }
      }

      // Reset if out of bounds or should teleport
      if (Math.abs(p.pos.x) > 5 || Math.abs(p.pos.y) > 4 || shouldTeleport) {
        // Spawn uniformly across the field
        p.pos.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 7);
        p.vel.set(0, 0);
        p.trail = [];
      }

      // Draw particle
      if (mode === "particles" || mode === "trails") {
        const mesh = new THREE.Mesh(particleGeometry, particleMaterial);
        mesh.position.set(p.pos.x, p.pos.y, 0);
        particlesGroupRef.current!.add(mesh);
      }

      // Draw trail
      if (mode === "trails" && p.trail.length > 2) {
        const trailPoints = p.trail.map(t => new THREE.Vector3(t.x, t.y, 0));
        const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);

        // Create gradient colors for trail (pink/purple → orange)
        const colors = new Float32Array(p.trail.length * 3);
        // Pink/purple at tail (old): #c77dff (0.78, 0.49, 1.0)
        // Orange at head (new): #ff6b35 (1.0, 0.42, 0.21)
        for (let i = 0; i < p.trail.length; i++) {
          const t = i / p.trail.length; // 0=oldest, 1=newest
          colors[i * 3] = (0.78 + 0.22 * t) * t;     // R: lerp 0.78→1.0, fade with t
          colors[i * 3 + 1] = (0.49 - 0.07 * t) * t; // G: lerp 0.49→0.42, fade with t
          colors[i * 3 + 2] = (1.0 - 0.79 * t) * t;  // B: lerp 1.0→0.21, fade with t
        }
        trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const trailMaterial = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
        });
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        trailsGroupRef.current!.add(trail);
      }
    });
  };

  // Animation loop
  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) return;
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += 1;

      if (mode === "particles" || mode === "trails") {
        updateParticlesRef.current();
      }

      // Show/hide groups based on mode
      if (arrowsGroupRef.current) arrowsGroupRef.current.visible = mode === "arrows";
      if (particlesGroupRef.current) particlesGroupRef.current.visible = mode === "particles" || mode === "trails";
      if (trailsGroupRef.current) trailsGroupRef.current.visible = mode === "trails";

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [mode]);

  // Reset particles when switching modes
  useEffect(() => {
    if (mode === "particles" || mode === "trails") {
      initParticles();
    }
  }, [mode]);

  // Track if arrows need rebuilding
  const arrowsBuiltForFieldRef = useRef<FieldType | null>(null);

  // Rebuild arrows when field changes while in arrows mode
  useEffect(() => {
    if (!arrowsGroupRef.current || !sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    // Only rebuild arrows if in arrows mode and field changed
    if (mode === "arrows" && arrowsBuiltForFieldRef.current !== fieldType) {
      arrowsBuiltForFieldRef.current = fieldType;
      createArrowsForField(vectorFields[fieldType]);
    }

    // Update visibility
    if (arrowsGroupRef.current) arrowsGroupRef.current.visible = mode === "arrows";
    if (particlesGroupRef.current) particlesGroupRef.current.visible = mode === "particles" || mode === "trails";
    if (trailsGroupRef.current) trailsGroupRef.current.visible = mode === "trails";

    // Force render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [fieldType, mode]);

  // Reset particles when field type changes (lightweight, no arrow rebuild)
  useEffect(() => {
    particlesRef.current = [];
    const numParticles = 150;
    for (let i = 0; i < numParticles; i++) {
      particlesRef.current.push({
        pos: new THREE.Vector2((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6),
        vel: new THREE.Vector2(0, 0),
        trail: [],
      });
    }
  }, [fieldType]);

  return (
    <div className="vector-field-viz">
      <div ref={containerRef} className="canvas-container" style={{ position: 'relative', minHeight: isLoaded ? 'auto' : '270px' }}>
        {!isLoaded && (
          <div className="vfv-loading">
            <div className="vfv-loading-spinner" />
          </div>
        )}
        <div className="vfv-fade vfv-fade-top" />
        <div className="vfv-fade vfv-fade-bottom" />
        <div className="vfv-fade vfv-fade-left" />
        <div className="vfv-fade vfv-fade-right" />
      </div>

      <div className="vfv-controls">
        <div className="vfv-mode-buttons">
          <button
            className={mode === "arrows" ? "active" : ""}
            onClick={() => setMode("arrows")}
          >
            Arrows
          </button>
          <button
            className={mode === "particles" ? "active" : ""}
            onClick={() => setMode("particles")}
          >
            Particles
          </button>
          <button
            className={mode === "trails" ? "active" : ""}
            onClick={() => setMode("trails")}
          >
            Trails
          </button>
        </div>

        <div
          ref={carouselRef}
          className="vfv-carousel-container"
          onWheel={(e) => {
            e.preventDefault();
            const currentIndex = fieldTypes.indexOf(fieldType);
            if (e.deltaY > 0) {
              setFieldType(fieldTypes[(currentIndex + 1) % fieldTypes.length]);
            } else if (e.deltaY < 0) {
              setFieldType(fieldTypes[(currentIndex - 1 + fieldTypes.length) % fieldTypes.length]);
            }
          }}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => handleDragMove(e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
        >
          <div className="vfv-carousel-track">
            {fieldTypes.map((key, index) => {
              const currentIndex = fieldTypes.indexOf(fieldType);
              const n = fieldTypes.length;
              // Calculate looping offset (-1, 0, +1, +2 wrapping around)
              let offset = index - currentIndex;
              // Wrap around for looping effect
              if (offset > n / 2) offset -= n;
              if (offset < -n / 2) offset += n;

              // Only show items within range [-1, 2] for cleaner look
              if (offset < -1 || offset > 2) return null;

              const dragAngleOffset = (dragOffset / 50) * -15;
              const angle = offset * 35 + dragAngleOffset;
              const radius = 40;
              const translateZ = Math.cos(angle * Math.PI / 180) * radius;
              const translateY = Math.sin(angle * Math.PI / 180) * radius;
              const effectiveOffset = Math.abs(offset + dragOffset / 100);
              const scale = Math.max(0.7, 1 - effectiveOffset * 0.15);
              const opacity = effectiveOffset < 0.3 ? 1 : Math.max(0.15, 1 - effectiveOffset * 0.45);
              const zIndex = 10 - Math.floor(effectiveOffset);

              return (
                <button
                  key={key}
                  className={`vfv-carousel-item ${fieldType === key ? 'active' : ''}`}
                  onClick={() => !dragStartRef.current && setFieldType(key)}
                  style={{
                    transform: `translateY(${translateY}px) translateZ(${translateZ}px) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  {fieldLabels[key]}
                </button>
              );
            })}
          </div>
          <div className="vfv-carousel-arrows">
            <button
              className="vfv-carousel-arrow up"
              onClick={() => {
                const idx = fieldTypes.indexOf(fieldType);
                const prevIdx = (idx - 1 + fieldTypes.length) % fieldTypes.length;
                setFieldType(fieldTypes[prevIdx]);
              }}
            >▲</button>
            <button
              className="vfv-carousel-arrow down"
              onClick={() => {
                const idx = fieldTypes.indexOf(fieldType);
                const nextIdx = (idx + 1) % fieldTypes.length;
                setFieldType(fieldTypes[nextIdx]);
              }}
            >▼</button>
          </div>
        </div>
      </div>

      <style>{`
        .vector-field-viz {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          padding: 16px;
          background: transparent;
        }
        .canvas-container {
          border-radius: 8px;
          overflow: hidden;
          border: none;
          max-width: 100%;
          background: rgb(var(--color-fill));
        }
        .canvas-container canvas {
          display: block;
        }
        .vfv-fade {
          position: absolute;
          pointer-events: none;
          z-index: 1;
        }
        .vfv-fade-top {
          top: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: linear-gradient(to bottom, rgb(var(--color-fill)) 0%, rgba(255, 248, 222, 0) 100%);
        }
        .vfv-fade-bottom {
          bottom: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: linear-gradient(to top, rgb(var(--color-fill)) 0%, rgba(255, 248, 222, 0) 100%);
        }
        .vfv-fade-left {
          top: 0;
          bottom: 0;
          left: 0;
          width: 50px;
          background: linear-gradient(to right, rgb(var(--color-fill)) 0%, rgba(255, 248, 222, 0) 100%);
        }
        .vfv-fade-right {
          top: 0;
          bottom: 0;
          right: 0;
          width: 50px;
          background: linear-gradient(to left, rgb(var(--color-fill)) 0%, rgba(255, 248, 222, 0) 100%);
        }
        .vfv-controls {
          display: flex;
          gap: 16px;
          align-items: center;
          justify-content: center;
          font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace;
        }
        .vfv-mode-buttons {
          display: flex;
          gap: 2px;
          background: rgba(var(--color-fill), 0.8);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid rgba(40, 39, 40, 0.2);
          backdrop-filter: blur(8px);
        }
        .vfv-mode-buttons button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: rgb(40, 39, 40);
          cursor: pointer;
          border-radius: 6px;
          font-size: 12px;
          transition: all 0.2s ease;
          font-family: inherit;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .vfv-mode-buttons button:hover {
          background: rgba(140, 169, 255, 0.15);
        }
        .vfv-mode-buttons button.active {
          background: rgb(100, 130, 220);
          color: white;
          box-shadow: 0 2px 8px rgba(100, 130, 220, 0.3);
        }
        .vfv-carousel-container {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(var(--color-fill), 0.8);
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(40, 39, 40, 0.2);
          cursor: grab;
          user-select: none;
          touch-action: none;
          backdrop-filter: blur(8px);
        }
        .vfv-carousel-container:active {
          cursor: grabbing;
        }
        .vfv-carousel-track {
          position: relative;
          width: 160px;
          height: 100px;
          perspective: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
        }
        .vfv-carousel-item {
          position: absolute;
          padding: 2px 14px;
          border: none;
          background: transparent;
          color: rgb(80, 80, 80);
          cursor: pointer;
          border-radius: 6px;
          font-size: 12px;
          font-family: inherit;
          font-weight: 500;
          white-space: nowrap;
          letter-spacing: 0.01em;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s ease,
                      color 0.2s ease,
                      background 0.2s ease;
          transform-style: preserve-3d;
          will-change: transform, opacity;
        }
        .vfv-carousel-item:hover {
          color: rgb(40, 39, 40);
        }
        .vfv-carousel-item.active {
          background: rgb(100, 130, 220);
          color: white;
          box-shadow: 0 2px 12px rgba(100, 130, 220, 0.35);
        }
        .vfv-carousel-arrows {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .vfv-carousel-arrow {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(100, 130, 220, 0.3);
          background: rgba(255, 255, 255, 0.8);
          color: rgb(100, 130, 220);
          cursor: pointer;
          border-radius: 50%;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
        .vfv-carousel-arrow:hover:not(:disabled) {
          background: rgb(100, 130, 220);
          color: white;
          border-color: rgb(100, 130, 220);
          transform: scale(1.08);
        }
        .vfv-carousel-arrow:active:not(:disabled) {
          transform: scale(0.95);
        }
        .vfv-carousel-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          box-shadow: none;
        }
        .vfv-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgb(255, 248, 222);
          border-radius: 8px;
        }
        .vfv-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(140, 169, 255, 0.3);
          border-top-color: rgb(140, 169, 255);
          border-radius: 50%;
          animation: vfv-spin 0.8s linear infinite;
        }
        @keyframes vfv-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
