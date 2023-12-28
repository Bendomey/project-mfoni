/* eslint-disable no-negated-condition */
import Webcam from "react-webcam";
import { Button } from '@/components/button/index.tsx'


export const VisualSearch = () => {
    return (
        <>
            <div className="p-2 flex items-start justify-between">
                <div>
                    <h1 className='font-medium'>Visual Search</h1>
                    <span className='text-xs text-zinc-600'>To search by images, you&apos;ll need to take a selfie</span>
                </div>
                <Button variant='unstyled' externalClassName='text-xs text-zinc-600 hover:underline'>
                    <span >Need Help?</span>
                </Button>
            </div>
            <div className="p-3 bg-gray-50 h-[60vh] md:h-[40vh]">
                <div className=' rounded-md p-1'>
                    <Webcam className='h-full w-full rounded-lg'>
                        {
                            () => (
                                <Button externalClassName='absolute z-10 text-white'>Capture</Button>
                            )
                        }
                    </Webcam>
                </div>
            </div>
        </>
    )
}