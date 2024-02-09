import Webcam, {type WebcamProps} from 'react-webcam'
import {Button} from '@/components/button/index.tsx'
import {Fragment, useCallback, useRef, useState} from 'react'

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
      <div className="p-2 flex items-start justify-between">
        <div>
          <h1 className="font-medium">Visual Search</h1>
          <span className="text-xs text-zinc-600">
            To search by images, you&apos;ll need to take a selfie
          </span>
        </div>
        <Button
          variant="unstyled"
          externalClassName="text-xs text-zinc-600 hover:underline"
        >
          <span>Need Help?</span>
        </Button>
      </div>
      <div className="p-3 bg-gray-50 relative h-[55vh] md:h-[48vh] lg:[44vh] 2xl:[15vh]">
        <div className=" rounded-md p-1">
          {imgSrc ? (
            <img
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
          {imgSrc ? (
            <Button
              type="button"
              onClick={handleRetake}
              externalClassName="absolute bottom-0 mt-2 z-30 bg-gray-600 text-white"
            >
              Retake
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCapture}
              externalClassName="absolute bottom-0 mt-2 z-30 bg-blue-600 text-white"
            >
              Capture
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
