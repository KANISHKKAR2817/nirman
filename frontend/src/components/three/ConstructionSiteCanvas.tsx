import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Grid, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ConstructionZone, Equipment, Material } from '../../types';

export interface SelectedObjectInfo {
  type: 'ZONE' | 'EQUIPMENT' | 'MATERIAL' | 'CRANE';
  id: number | string;
  name: string;
  code: string;
  status: string;
  progressPercentage?: number;
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  details?: Record<string, string | number>;
}

interface DigitalTwinProps {
  zones: ConstructionZone[];
  equipmentList?: Equipment[];
  materials?: Material[];
  activeOverlay: 'progress' | 'risk' | 'equipment' | 'workers' | 'materials' | 'none';
  selectedObjectId?: string | number | null;
  onSelectObject: (info: SelectedObjectInfo | null) => void;
  isolatedFloor?: number | null;
  isNightMode?: boolean;
}

// -------------------------------------------------------------
// Procedural Building Floor Component
// -------------------------------------------------------------
const BuildingFloor: React.FC<{
  floorNumber: number;
  zone?: ConstructionZone;
  activeOverlay: string;
  isSelected: boolean;
  isIsolated: boolean;
  onSelect: () => void;
}> = ({ floorNumber, zone, activeOverlay, isSelected, isIsolated, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const yPos = floorNumber * 2.2 + 1.1; // 2.2m per floor

  // Determine floor status color based on overlay
  const floorColor = useMemo(() => {
    if (activeOverlay === 'progress') {
      const prog = zone?.progressPercentage ?? (floorNumber <= 4 ? 100 : floorNumber <= 8 ? 65 : 20);
      if (prog >= 90) return '#10b981'; // Completed emerald
      if (prog >= 50) return '#3b82f6'; // In-progress blue
      if (prog > 0) return '#f59e0b';  // Early stage amber
      return '#64748b'; // Not started
    }
    if (activeOverlay === 'risk') {
      const risk = zone?.riskLevel ?? (floorNumber === 7 ? 'CRITICAL' : floorNumber === 8 ? 'HIGH' : 'LOW');
      if (risk === 'CRITICAL') return '#ef4444';
      if (risk === 'HIGH') return '#f97316';
      if (risk === 'MODERATE') return '#eab308';
      return '#10b981';
    }
    // Default architectural material look
    if (floorNumber <= 5) return '#94a3b8'; // Completed facade
    if (floorNumber <= 9) return '#cbd5e1'; // Mid floors concrete
    return '#f1f5f9'; // Top floors fresh cast
  }, [activeOverlay, zone, floorNumber]);

  const opacity = isIsolated ? 1.0 : isSelected ? 0.95 : hovered ? 0.9 : 0.82;
  const isTopFloor = floorNumber === 14;
  const isUnderActiveWork = floorNumber >= 6 && floorNumber <= 9;

  return (
    <group
      position={[0, yPos, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Concrete Floor Slab */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[14, 0.35, 12]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : hovered ? '#60a5fa' : floorColor}
          metalness={0.2}
          roughness={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Structural Columns */}
      {[-5.8, 0, 5.8].map((x) =>
        [-4.8, 0, 4.8].map((z) => (
          <mesh key={`col-${x}-${z}`} position={[x, 1.0, z]} castShadow>
            <boxGeometry args={[0.6, 1.8, 0.6]} />
            <meshStandardMaterial
              color={isSelected ? '#38bdf8' : '#64748b'}
              roughness={0.9}
            />
          </mesh>
        ))
      )}

      {/* Shear Wall / Elevator Core */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[3.2, 1.8, 2.8]} />
        <meshStandardMaterial
          color={floorNumber === 7 && activeOverlay === 'risk' ? '#ef4444' : '#475569'}
          roughness={0.7}
        />
      </mesh>

      {/* Perimeter Glazing / Safety Barriers for Completed / Active Floors */}
      {floorNumber <= 6 ? (
        // Finished curtain wall glazing
        <mesh position={[0, 1.0, 6.05]}>
          <boxGeometry args={[13.8, 1.8, 0.05]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.8}
            opacity={0.6}
            transparent
            roughness={0.1}
            ior={1.5}
          />
        </mesh>
      ) : (
        // Construction safety perimeter barrier / orange safety mesh
        <mesh position={[0, 0.5, 6.02]}>
          <boxGeometry args={[13.8, 0.9, 0.05]} />
          <meshStandardMaterial
            color="#ea580c"
            wireframe={true}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Rebar reinforcement protruding on top floor */}
      {isTopFloor && (
        <group position={[0, 0.8, 0]}>
          {[-5, -2, 2, 5].map((rx) => (
            <mesh key={`rebar-${rx}`} position={[rx, 0.6, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
              <meshStandardMaterial color="#991b1b" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {/* Scaffolding on active floors */}
      {isUnderActiveWork && (
        <group position={[7.3, 0.9, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 2.0, 11]} />
            <meshStandardMaterial color="#fbbf24" wireframe={true} opacity={0.6} transparent />
          </mesh>
        </group>
      )}

      {/* Floor Tag Label */}
      {(hovered || isSelected) && (
        <Html position={[0, 1.2, 6.2]} center distanceFactor={15}>
          <div className="bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
            Lvl {floorNumber} {zone?.name ? `• ${zone.name}` : ''}
          </div>
        </Html>
      )}
    </group>
  );
};

// -------------------------------------------------------------
// Animated Tower Crane Component
// -------------------------------------------------------------
const TowerCrane: React.FC<{
  onSelect: () => void;
  isSelected: boolean;
}> = ({ onSelect, isSelected }) => {
  const jibRef = useRef<THREE.Group>(null);
  const hookRef = useRef<THREE.Mesh>(null);

  // Gentle realistic slewing rotation animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.25;
    if (jibRef.current) {
      jibRef.current.rotation.y = Math.sin(t) * 0.9 + 0.3;
    }
    if (hookRef.current) {
      hookRef.current.position.y = -6 + Math.sin(t * 2) * 1.5;
    }
  });

  return (
    <group
      position={[12, 0, 8]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Crane Concrete Foundation Ballast */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3.5, 1.0, 3.5]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>

      {/* Vertical Lattice Mast Tower (40m high) */}
      <mesh position={[0, 19, 0]} castShadow>
        <boxGeometry args={[1.4, 37, 1.4]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : '#eab308'}
          wireframe={true}
          roughness={0.6}
        />
      </mesh>

      {/* Central Mast Core */}
      <mesh position={[0, 19, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 37, 8]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.7} />
      </mesh>

      {/* Rotating Upper Assembly (Jib + Counterjib + Operator Cabin) */}
      <group ref={jibRef} position={[0, 38, 0]}>
        {/* Slewing ring & Operator Cabin */}
        <mesh position={[0.9, -0.6, 0.7]} castShadow>
          <boxGeometry args={[1.5, 1.6, 1.2]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>

        {/* Counter-Jib with Concrete Ballast Blocks */}
        <mesh position={[-5.5, 0.4, 0]} castShadow>
          <boxGeometry args={[9, 1.0, 1.0]} />
          <meshStandardMaterial color={isSelected ? '#38bdf8' : '#eab308'} wireframe={true} />
        </mesh>
        <mesh position={[-8.5, 0.2, 0]} castShadow>
          <boxGeometry args={[2.5, 1.4, 1.8]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>

        {/* Working Jib Truss (Front Arm) */}
        <mesh position={[12, 0.6, 0]} castShadow>
          <boxGeometry args={[22, 1.2, 1.0]} />
          <meshStandardMaterial color={isSelected ? '#38bdf8' : '#eab308'} wireframe={true} />
        </mesh>

        {/* A-Frame Tower Peak */}
        <mesh position={[0, 3.5, 0]}>
          <coneGeometry args={[1.2, 6, 4]} />
          <meshStandardMaterial color="#eab308" wireframe={true} />
        </mesh>

        {/* Hoist Cable and Hook Load */}
        <group position={[14, -0.2, 0]}>
          {/* Cable */}
          <mesh position={[0, -3.5, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 7, 4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Hook & Steel Beam Payload */}
          <mesh ref={hookRef} position={[0, -6, 0]} castShadow>
            <boxGeometry args={[3.2, 0.4, 0.4]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Crane ID Label */}
      <Html position={[0, 42, 0]} center distanceFactor={22}>
        <div className="bg-amber-950/90 border border-amber-500 text-amber-300 font-bold px-2 py-0.5 rounded text-[11px] shadow whitespace-nowrap">
          TOWER CRANE TC-01
        </div>
      </Html>
    </group>
  );
};

// -------------------------------------------------------------
// Ground Site Machinery & Material Yard
// -------------------------------------------------------------
const SiteEquipmentAndYard: React.FC<{
  onSelect: (info: SelectedObjectInfo) => void;
}> = ({ onSelect }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Concrete Mixer Truck */}
      <group
        position={[-12, 0, 6]}
        rotation={[0, Math.PI / 4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            type: 'EQUIPMENT',
            id: 3,
            name: 'Hydraulic Concrete Mixer Truck',
            code: 'EQP-CM-03',
            status: 'IN_USE',
            details: {
              Capacity: '8.5 m³',
              Operator: 'Ramesh Verma',
              Fuel: '78%',
              Status: 'Discharging Batch #42',
            },
          });
        }}
      >
        {/* Chassis */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[5.2, 0.8, 2.2]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Cabin */}
        <mesh position={[1.8, 1.4, 0]} castShadow>
          <boxGeometry args={[1.6, 1.4, 2.0]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Rotating Drum */}
        <mesh position={[-0.8, 1.7, 0]} rotation={[0, 0, -0.25]} castShadow>
          <cylinderGeometry args={[1.1, 1.3, 3.6, 12]} />
          <meshStandardMaterial color="#eab308" metalness={0.3} roughness={0.5} />
        </mesh>
        {/* Wheels */}
        {[-1.5, 0.2, 1.8].map((wx) =>
          [-1.1, 1.1].map((wz) => (
            <mesh key={`cm-w-${wx}-${wz}`} position={[wx, 0.4, wz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.3, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          ))
        )}
        <Html position={[0, 3, 0]} center distanceFactor={18}>
          <div className="bg-sky-950/80 border border-sky-600 text-sky-300 text-[10px] px-1.5 py-0.5 rounded shadow">
            Transit Mixer 03
          </div>
        </Html>
      </group>

      {/* Hydraulic Excavator */}
      <group
        position={[-13, 0, -8]}
        rotation={[0, -Math.PI / 6, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            type: 'EQUIPMENT',
            id: 2,
            name: 'CAT 320 Hydraulic Excavator',
            code: 'EQP-EX-02',
            status: 'AVAILABLE',
            details: {
              Boom: 'Mono Boom 5.7m',
              Bucket: '1.19 m³ Heavy Duty',
              EngineHours: '1,248 hrs',
              Health: 'Optimal',
            },
          });
        }}
      >
        {/* Caterpillar Tracks */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[4.0, 0.7, 2.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Body Cab */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[3.2, 1.4, 2.2]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        {/* Excavator Boom */}
        <group position={[1.5, 1.6, 0]} rotation={[0, 0, -0.6]}>
          <mesh position={[2, 0, 0]}>
            <boxGeometry args={[4, 0.5, 0.5]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
          {/* Arm & Bucket */}
          <mesh position={[4, -1.2, 0]} rotation={[0, 0, 1.2]}>
            <boxGeometry args={[2.5, 0.4, 0.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
        <Html position={[0, 3.2, 0]} center distanceFactor={18}>
          <div className="bg-amber-950/80 border border-amber-600 text-amber-300 text-[10px] px-1.5 py-0.5 rounded shadow">
            Excavator EX-02
          </div>
        </Html>
      </group>

      {/* Material Stockyard 01: Structural Steel Rebar Racks */}
      <group
        position={[9, 0, -10]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            type: 'MATERIAL',
            id: 1,
            name: 'Fe-500D Thermo-Mechanically Treated Rebar',
            code: 'MAT-STL-01',
            status: 'IN_STOCK',
            details: {
              Available: '142 Tonnes',
              Reserved: '38 Tonnes',
              MinThreshold: '50 Tonnes',
              Zone: 'Yard-East Bay',
            },
          });
        }}
      >
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[6, 0.2, 5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* Rebar bundle cylinders */}
        {[-1.8, -0.6, 0.6, 1.8].map((rz) =>
          [0.3, 0.8, 1.3].map((ry) => (
            <mesh key={`rebar-stk-${rz}-${ry}`} position={[0, ry, rz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 4.8, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.4} />
            </mesh>
          ))
        )}
        <Html position={[0, 2.5, 0]} center distanceFactor={16}>
          <div className="bg-slate-900 border border-emerald-500 text-emerald-400 text-[10px] px-2 py-0.5 rounded shadow font-mono">
            Steel Yard (142T)
          </div>
        </Html>
      </group>

      {/* Material Stockyard 02: Cement Pallets & Bags */}
      <group
        position={[-4, 0, 11]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({
            type: 'MATERIAL',
            id: 2,
            name: 'OPC 53 Grade Portland Cement',
            code: 'MAT-CEM-02',
            status: 'LOW_STOCK',
            details: {
              Available: '320 Bags',
              Reserved: '200 Bags',
              MinThreshold: '500 Bags',
              Alert: 'Below 500 Bags Reorder Threshold',
            },
          });
        }}
      >
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[5, 0.15, 4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Cement Pallets */}
        {[-1.2, 1.2].map((px) =>
          [-0.8, 0.8].map((pz) => (
            <group key={`pallet-${px}-${pz}`} position={[px, 0.4, pz]}>
              <mesh>
                <boxGeometry args={[1.8, 0.7, 1.4]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
              </mesh>
              {/* Weatherproof Tarpaulin Cover */}
              <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[1.9, 0.2, 1.5]} />
                <meshStandardMaterial color="#0284c7" opacity={0.8} transparent />
              </mesh>
            </group>
          ))
        )}
        <Html position={[0, 2.0, 0]} center distanceFactor={16}>
          <div className="bg-red-950 border border-red-500 text-red-300 text-[10px] px-2 py-0.5 rounded shadow font-mono animate-pulse">
            Cement Bay (LOW: 320 Bags)
          </div>
        </Html>
      </group>

      {/* Aggregate Gravel Mound */}
      <group position={[11, 0, 0]}>
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[2.5, 1.8, 12]} />
          <meshStandardMaterial color="#78716c" roughness={1.0} />
        </mesh>
        <mesh position={[2.5, 0.5, 1]}>
          <coneGeometry args={[1.8, 1.2, 10]} />
          <meshStandardMaterial color="#a8a29e" roughness={1.0} />
        </mesh>
      </group>

      {/* Site Engineers & Workers Avatars with Hardhats */}
      {[
        { pos: [-6, 0, 3], name: 'Crew A (Rebar)', hat: '#f59e0b' },
        { pos: [4, 0, 5], name: 'Safety Officer', hat: '#ef4444' },
        { pos: [8, 0, -4], name: 'Crew B (Casting)', hat: '#f59e0b' },
      ].map((worker, idx) => (
        <group key={`worker-${idx}`} position={worker.pos as [number, number, number]}>
          {/* Worker Torso with Hi-Vis Vest */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.9, 8]} />
            <meshStandardMaterial color="#ea580c" roughness={0.6} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
          {/* Hardhat */}
          <mesh position={[0, 1.65, 0]}>
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshStandardMaterial color={worker.hat} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Site Perimeter Fence */}
      <mesh position={[0, 0.75, -16]}>
        <boxGeometry args={[36, 1.5, 0.1]} />
        <meshStandardMaterial color="#334155" wireframe={true} />
      </mesh>
      <mesh position={[0, 0.75, 16]}>
        <boxGeometry args={[36, 1.5, 0.1]} />
        <meshStandardMaterial color="#334155" wireframe={true} />
      </mesh>
      <mesh position={[-18, 0.75, 0]}>
        <boxGeometry args={[0.1, 1.5, 32]} />
        <meshStandardMaterial color="#334155" wireframe={true} />
      </mesh>
      <mesh position={[18, 0.75, 0]}>
        <boxGeometry args={[0.1, 1.5, 32]} />
        <meshStandardMaterial color="#334155" wireframe={true} />
      </mesh>
    </group>
  );
};

// -------------------------------------------------------------
// Main Canvas Component with Camera Presets & Environment
// -------------------------------------------------------------
export const ConstructionSiteCanvas: React.FC<DigitalTwinProps> = ({
  zones,
  equipmentList,
  materials,
  activeOverlay,
  selectedObjectId,
  onSelectObject,
  isolatedFloor = null,
  isNightMode = false,
}) => {
  const controlsRef = useRef<any>(null);

  // Default 14 floors
  const floors = useMemo(() => Array.from({ length: 14 }, (_, i) => i + 1), []);

  const handleSelectZone = (floorNum: number) => {
    const matchingZone = zones.find((z) => z.floorLevel === floorNum) || {
      id: floorNum,
      projectId: 1,
      code: `ZN-FL-${String(floorNum).padStart(2, '0')}`,
      name: `Floor ${floorNum} ${floorNum <= 4 ? 'Interior & MEP' : floorNum <= 9 ? 'Structural Slabs' : 'Superstructure Formwork'}`,
      zoneType: floorNum <= 4 ? 'FINISHING' : 'STRUCTURAL',
      floorLevel: floorNum,
      areaSqm: 850,
      status: floorNum <= 4 ? 'COMPLETED' : floorNum <= 8 ? 'IN_PROGRESS' : 'PENDING',
      riskLevel: floorNum === 7 ? 'CRITICAL' : floorNum === 8 ? 'HIGH' : 'LOW',
      progressPercentage: floorNum <= 4 ? 100 : floorNum <= 7 ? 68 : floorNum === 8 ? 40 : 10,
    };

    onSelectObject({
      type: 'ZONE',
      id: matchingZone.id,
      name: matchingZone.name,
      code: matchingZone.code,
      status: matchingZone.status,
      progressPercentage: matchingZone.progressPercentage,
      riskLevel: matchingZone.riskLevel,
      details: {
        'Floor Level': matchingZone.floorLevel,
        'Area (sq.m)': `${matchingZone.areaSqm} m²`,
        'Zone Classification': matchingZone.zoneType,
        'Active Tasks': matchingZone.floorLevel === 7 ? '3 Tasks (1 Overdue)' : '2 Tasks In-Progress',
        'Lead Contractor': 'NCC Infrastructure & Structural Works',
        'Safety Clearance': matchingZone.riskLevel === 'CRITICAL' ? 'Flagged Hazard' : 'Approved',
      },
    });
  };

  const handleSelectCrane = () => {
    onSelectObject({
      type: 'CRANE',
      id: 'TC-01',
      name: 'Liebherr 280 EC-H 12 Litronic Tower Crane',
      code: 'EQP-CRANE-01',
      status: 'OPERATIONAL',
      details: {
        'Jib Reach': '70 meters',
        'Max Capacity': '12,000 kg',
        'Current Height Under Hook': '42.5 meters',
        'Wind Sensor': '18 km/h (Safe threshold < 45 km/h)',
        'Operator': 'Suresh Murthy (Cert valid till Nov 2026)',
        'Utilization Today': '84%',
      },
    });
  };

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden select-none">
      <Canvas
        shadows
        camera={{ position: [28, 30, 32], fov: 42, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => onSelectObject(null)}
      >
        <color attach="background" args={[isNightMode ? '#020617' : '#080d1a']} />

        {/* Lighting setup */}
        <ambientLight intensity={isNightMode ? 0.35 : 0.85} />
        <directionalLight
          castShadow
          position={[30, 50, 20]}
          intensity={isNightMode ? 0.6 : 1.8}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={120}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
          color={isNightMode ? '#93c5fd' : '#fffbeb'}
        />
        {/* Soft fill light from opposite angle */}
        <directionalLight position={[-20, 30, -20]} intensity={0.4} color="#94a3b8" />

        {/* Night mode floodlights at construction perimeter */}
        {isNightMode && (
          <>
            <pointLight position={[12, 10, 12]} intensity={2.5} distance={30} color="#fde047" />
            <pointLight position={[-10, 8, -10]} intensity={2.0} distance={25} color="#fde047" />
            <pointLight position={[0, 38, 0]} intensity={3.0} distance={40} color="#ffffff" />
          </>
        )}

        {/* Ground Plane with Grid */}
        <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[90, 90]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} />
        </mesh>
        <Grid
          position={[0, 0.01, 0]}
          args={[80, 80]}
          cellSize={2}
          cellThickness={1}
          cellColor="#1e293b"
          sectionSize={10}
          sectionThickness={1.5}
          sectionColor="#334155"
          fadeDistance={60}
        />

        {/* Building Floors */}
        <group position={[0, 0, 0]}>
          {floors.map((floorNum) => {
            if (isolatedFloor !== null && isolatedFloor !== floorNum) {
              return null;
            }
            const zone = zones.find((z) => z.floorLevel === floorNum);
            const isSelected = selectedObjectId === zone?.id || selectedObjectId === floorNum;
            return (
              <BuildingFloor
                key={`floor-${floorNum}`}
                floorNumber={floorNum}
                zone={zone}
                activeOverlay={activeOverlay}
                isSelected={isSelected}
                isIsolated={isolatedFloor === floorNum}
                onSelect={() => handleSelectZone(floorNum)}
              />
            );
          })}
        </group>

        {/* Tower Crane */}
        <TowerCrane
          isSelected={selectedObjectId === 'TC-01'}
          onSelect={handleSelectCrane}
        />

        {/* Equipment, Stockyards & Crew */}
        <SiteEquipmentAndYard onSelect={onSelectObject} />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going beneath ground
          minDistance={10}
          maxDistance={120}
        />
      </Canvas>
    </div>
  );
};
