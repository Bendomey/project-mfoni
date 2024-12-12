import {
	type Dispatch,
	type PropsWithChildren,
	type SetStateAction,
	createContext,
	useContext,
	useState,
} from 'react'

interface LoginAuthContextProps {
	isLoading: boolean
	setIsLoading: Dispatch<SetStateAction<boolean>>
	errorMessage: string
	setErrorMessage: Dispatch<SetStateAction<string>>
}

export const LoginAuthContext = createContext<LoginAuthContextProps>({
	errorMessage: '',
	setErrorMessage: () => {},
	isLoading: false,
	setIsLoading: () => {},
})

export const LoginAuthProvider = ({ children }: PropsWithChildren) => {
	const [errorMessage, setErrorMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	return (
		<LoginAuthContext.Provider
			value={{
				errorMessage,
				setErrorMessage,
				isLoading,
				setIsLoading,
			}}
		>
			{children}
		</LoginAuthContext.Provider>
	)
}

export const useLoginAuth = () => {
	const context = useContext(LoginAuthContext)

	 
	if (!context) {
		throw new Error('useLoginAuth must be used within LoginAuthProvider')
	}

	return context
}
