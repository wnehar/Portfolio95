import * as THREE from "three"

export function Environment() {
  return (
    <group>
      {/* Sol en béton */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#888888" roughness={0.8} />
      </mesh>
      
      {/* Mur de fond sombre */}
      <mesh position={[0, 5, -30]} receiveShadow castShadow>
        <boxGeometry args={[60, 14, 1]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      
      {/* Murs latéraux pour fermer un peu l'espace */}
      <mesh position={[-30, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[60, 14, 1]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>
      
      <mesh position={[30, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[60, 14, 1]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>
    </group>
  )
}
