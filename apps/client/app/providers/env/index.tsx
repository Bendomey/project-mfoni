import { createContext, useContext } from 'react'

interface IEnvContext {
	MFONI_GOOGLE_AUTH_CLIENT_ID: string
	FACEBOOK_APP_ID: string
	API_ADDRESS: string
}

export const EnvContext = createContext<IEnvContext>({
	MFONI_GOOGLE_AUTH_CLIENT_ID: '',
	FACEBOOK_APP_ID: '',
	API_ADDRESS: '',
})

export const useEnvContext = () => useContext(EnvContext)
