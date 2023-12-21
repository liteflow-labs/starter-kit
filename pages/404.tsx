import { NextPage } from 'next'
import Error from 'pages/_error'

const Custom404: NextPage = () => {
  return <Error statusCode={404} />
}

export default Custom404
