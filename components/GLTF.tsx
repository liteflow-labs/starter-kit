import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC, useEffect, useState } from 'react'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

type Props = {
  url: string
}

const GLTF: FC<Props> = ({ url }): JSX.Element => {
  const [model, setModel] = useState<GLTF>()

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.loadAsync(url).then(setModel).catch(console.error)
    return () => setModel(undefined)
  }, [url])

  return (
    <Canvas>
      <OrbitControls />
      <ambientLight />
      <pointLight />
      {model && <primitive object={model.scene} />}
      {/* <control /> */}
    </Canvas>
  )
}

export default GLTF
