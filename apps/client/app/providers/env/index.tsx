import {createContext, useContext} from 'react'

interface IEnvContext {
  MFONI_GOOGLE_AUTH_CLIENT_ID: string
  FACEBOOK_APP_ID: string
}

export const EnvContext = createContext<IEnvContext>({
  MFONI_GOOGLE_AUTH_CLIENT_ID: '',
  FACEBOOK_APP_ID: '',
})

export const useEnvContext = () => useContext(EnvContext)
