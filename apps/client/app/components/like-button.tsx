import { useFetcher, useLocation } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { errorToast } from '@/lib/custom-toast-functions.tsx'

interface Props {
	content: Content
	children: (props: {
		isLiked: boolean
		isDisabled: boolean
		onClick: VoidFunction
	}) => React.ReactNode
}

export function LikeButton({ content, children }: Props) {
	const location = useLocation()
	const fetcher = useFetcher<{ error: string }>()
	const [isLiked, setIsLiked] = useState(Boolean(content.currentUserLike))

	// where there is an error in the action data, show an error toast
	useEffect(() => {
		if (fetcher?.data?.error) {
			errorToast(fetcher?.data.error, {
				id: 'error-content-like',
			})
			setIsLiked((prev) => !prev)
		}
	}, [fetcher?.data])

	const handleSubmit = () => {
		fetcher.submit(
			{
				contentId: content.id,
				type: isLiked ? 'UNLIKE' : 'LIKE',
			},
			{
				action: `/api/like-content?from=${location.pathname}`,
				encType: 'multipart/form-data',
				method: 'post',
				preventScrollReset: true,
			},
		)
		setIsLiked((prev) => !prev)
	}

	const isDisabled = fetcher.state === 'submitting'

	return children({ isLiked, isDisabled, onClick: handleSubmit })
}
