import { useContext } from 'react'
import { Environment, EnvironmentContext } from '../environment'

export default function useEnvironment(): Environment {
  return useContext(EnvironmentContext)
}
