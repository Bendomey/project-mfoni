import { createContext, useContext } from 'react'

interface IEnvContext {
    BUCKET: string
    MFONI_GOOGLE_AUTH_CLIENT_ID: string
    FACEBOOK_APP_ID: string
}

export const EnvContext = createContext<IEnvContext>({
    BUCKET: '',
    MFONI_GOOGLE_AUTH_CLIENT_ID: '',
    FACEBOOK_APP_ID: '',
})

export const useEnvContext = () => useContext(EnvContext)