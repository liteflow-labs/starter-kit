import { useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

const GLTF = (): JSX.Element => {
  const model = useGLTF('http://localhost:3000/scene/scene.gltf')

  return (
    <Canvas camera={{ position: [1, 1, 1] }}>
      <primitive object={model.scene} />
    </Canvas>
  )
}

export default GLTF
