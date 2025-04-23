import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { QUERY_KEYS } from '@/constants/index.ts'
import { errorToast } from '@/lib/custom-toast-functions.tsx'
import { useAuth } from '@/providers/auth/index.tsx'

export type ContentSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ORIGINAL'

interface Props {
	content: Content
	children: (props: {
		isDisabled: boolean
		onClick: (size: ContentSize) => void
	}) => React.ReactNode
}

export function DownloadButtonApi({ children, content }: Props) {
	const [isInitiatingDownload, setInitiatingDownload] = useState(false)
	const { currentUser } = useAuth()
	const queryClient = useQueryClient()

	const handleSubmit = async (size: ContentSize) => {
		setInitiatingDownload(true)
		const formData = new FormData()
		formData.append('contentId', content.id)
		formData.append('size', size)
		formData.append('customerName', currentUser?.name || 'Guest')
		formData.append('contentTitle', content.title)
		try {
			const response = await fetch('/api/download-content', {
				method: 'POST',
				body: formData,
			})

			if (!response.ok) throw new Error('Failed to generate package')

			const blob = await response.blob()
			const url = URL.createObjectURL(blob)

			const a = document.createElement('a')
			a.href = url

			const title = `${content.title.replace(/ /g, '-')}-mfoni`.toLowerCase()
			a.download = `${title}.zip`

			a.click()
			URL.revokeObjectURL(url)

			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONTENTS, content.slug],
			})
		} catch {
			errorToast('Downloading image failed. Try again!', {
				id: 'error-downloading-content',
			})
		} finally {
			setInitiatingDownload(false)
		}
	}

	return children({ isDisabled: isInitiatingDownload, onClick: handleSubmit })
}
