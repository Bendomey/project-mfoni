import { Fragment, useCallback, useRef, useState } from 'react'
import Webcam, { type WebcamProps } from 'react-webcam'
import { Image } from 'remix-image'
import { Button } from '@/components/button/index.tsx'

export const VisualSearch = () => {
	const [imgSrc, setImgSrc] = useState<string | null>(null)
	const webcamRef = useRef<WebcamProps | any>(null)

	const handleCapture = useCallback(() => {
		const imageSrc = webcamRef.current?.getScreenshot()
		setImgSrc(imageSrc)
	}, [webcamRef])

	const handleRetake = useCallback(() => setImgSrc(null), [setImgSrc])

	return (
		<>
			<div className="flex items-start justify-between p-2">
				<div>
					<h1 className="font-medium">Visual Search</h1>
					<span className="text-xs text-zinc-600">
						To search by images, you&apos;ll need to take a selfie
					</span>
				</div>
				<Button
					variant="unstyled"
					className="text-xs text-zinc-600 hover:underline"
				>
					<span>Need Help?</span>
				</Button>
			</div>
			<div className="h-full bg-gray-50 p-3">
				<div className="rounded-md p-1">
					{imgSrc ? (
						<Image
							src={imgSrc}
							className="h-auto w-auto rounded-md"
							alt="user-capture"
						/>
					) : (
						<Fragment>
							{/* @ts-expect-error - fix webcam types. */}
							<Webcam
								ref={webcamRef}
								height={600}
								width={600}
								className="h-full w-full rounded-lg"
							/>
						</Fragment>
					)}
					<div className="mt-5">
						{imgSrc ? (
							<Button variant="solid" type="button" onClick={handleRetake}>
								Retake
							</Button>
						) : (
							<Button variant="solid" type="button" onClick={handleCapture}>
								Capture
							</Button>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
