import { Text } from "@react-three/drei";

function Bench() {
  return (
    <group position={[-13, -0.35, -8]}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[5.6, 0.34, 1.8]} />
        <meshStandardMaterial color="#9f6b44" roughness={0.72} />
      </mesh>
      {[-2.25, 2.25].map((x) => (
        <mesh key={x} position={[x, -0.58, -0.56]}>
          <boxGeometry args={[0.22, 1.2, 0.22]} />
          <meshStandardMaterial color="#5b4636" roughness={0.82} />
        </mesh>
      ))}
      <mesh position={[-1.5, 0.55, 0]} rotation={[0, 0, -0.24]}>
        <cylinderGeometry args={[0.18, 0.18, 1.7, 24]} />
        <meshStandardMaterial color="#79b7ce" roughness={0.28} transparent opacity={0.72} />
      </mesh>
      <mesh position={[0.1, 0.5, 0]}>
        <sphereGeometry args={[0.42, 24, 16]} />
        <meshStandardMaterial color="#f2c14e" roughness={0.35} transparent opacity={0.82} />
      </mesh>
    </group>
  );
}

function FormulaBoard() {
  return (
    <group position={[15, -0.2, 9]} rotation={[0, -0.35, 0]}>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[5.4, 2.7, 0.18]} />
        <meshStandardMaterial color="#24433f" roughness={0.9} />
      </mesh>
      {["F = m a", "E = kx²/2", "v = λ f"].map((text, index) => (
        <Text
          key={text}
          position={[0, 1.82 - index * 0.58, -0.11]}
          fontSize={0.28}
          color="#dff7ed"
          anchorX="center"
          anchorY="middle"
        >
          {text}
        </Text>
      ))}
    </group>
  );
}

export function LabEnvironment() {
  return (
    <group>
      <Bench />
      <FormulaBoard />
    </group>
  );
}
