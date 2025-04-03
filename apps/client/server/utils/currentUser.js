export const getCurrentUser = async (token) => {
	try {
		const res = await fetch(`${process.env.API_ADDRESS}/api/v1/auth/me`, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!res.ok) {
			throw res
		}

		const response = await res.json()

		return response
	} catch (error) {
		if (error instanceof Error) {
			throw error
		}

		// Error from server.
		if (error instanceof Response) {
			const response = await error.json()
			throw new Error(response.errorMessage)
		}
	}
}

const USER_CIPHER = 'mfoni-account'
export const extractAuthCookie = (cookieString) => {
	if (!cookieString) return null
	const cookies = cookieString.split(';')
	const authCookie = cookies.find((cookie) => cookie.includes(USER_CIPHER))
	if (!authCookie) return null

	const [, value] = authCookie.split('=')
	return value
		? JSON.parse(value.replaceAll('%22', '"').replace('%2C', ','))
		: null
}
