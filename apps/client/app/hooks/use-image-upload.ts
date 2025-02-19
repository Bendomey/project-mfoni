import { useState } from 'react'
import { useSignS3UploadUrl } from '@/api/image/index.ts'

interface UploadResults {
	fileLink: string
	key: string
	eTag?: string | null
}

const useImageUpload = () => {
	const [results, setResults] = useState<UploadResults>()
	const [isUploading, setIsUploading] = useState(false)
	// const [progress, setProgress] = useState<number | null>(null); // TODO: support later!
	const { mutateAsync: generateSignedUrl, isPending } = useSignS3UploadUrl()

	// Cancel upload
	const abortController = new AbortController()

	const isLoading = isUploading || isPending

	const upload = async (file: File): Promise<UploadResults> => {
		try {
			setIsUploading(true)
			const filename = `${new Date().toISOString()}_${file.name}`

			const signedUrl = await generateSignedUrl({
				contentType: file.type,
				filename,
				abortController,
			})

			// Actual upload
			const res = await fetch(signedUrl.signedUrl, {
				method: 'PUT',
				body: file,
				signal: abortController.signal,
			})

			const result: UploadResults = {
				fileLink: signedUrl.fileLink,
				key: signedUrl.key,
			}

			if (res.ok) {
				const eTag = res.headers.get('ETag')
				result.eTag = eTag ? JSON.parse(eTag) : null
			}

			setResults(result)
			return result
		} finally {
			setIsUploading(false)
		}
	}

	return { upload, isLoading, abortController, results }
}

export default useImageUpload
