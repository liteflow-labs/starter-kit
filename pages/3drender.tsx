import { Box } from '@chakra-ui/react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'

const GLTF = dynamic(() => import('../components/GLTF'), {
  ssr: false,
})

const GLBFile: NextPage = () => {
  return (
    <>
      <Box h="96" width="96" margin="auto" backgroundColor="gray.200" my={4}>
        <GLTF url="https://openseauserdata.com/files/e845714a393e41f2d53e279d866e62f7.glb" />
      </Box>
      <Box h="96" width="96" margin="auto" backgroundColor="gray.200" my={4}>
        <GLTF url="/scene/scene.gltf" />
      </Box>
    </>
  )
}

export default GLBFile
