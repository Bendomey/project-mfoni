import { useEffect, useState } from 'react'

export const useGetPermissionState = (permission: PermissionName) => {
	const [permissionState, setPermissionState] =
		useState<PermissionState>('prompt')

	useEffect(() => {
		navigator.permissions
			.query({ name: permission })
			.then((result) => setPermissionState(result.state))
			.catch(() => setPermissionState('denied'))
	}, [permission])

	return permissionState
}
