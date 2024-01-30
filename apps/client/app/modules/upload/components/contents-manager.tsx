import { Button } from "@/components/button/index.tsx"
import { PlusIcon } from "@heroicons/react/24/outline"
import { ExclamationCircleIcon, ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/solid"
import { type Content } from "../index.tsx"
import { useMemo } from "react"


interface ContentManagerProps {
    open: VoidFunction
    contents: Array<Content>
}

const AddNewContentButton = ({ open }: { open: ContentManagerProps['open'] }) => {
    return (
        <Button onClick={open} variant="unstyled" externalClassName="bg-zinc-100 h-[12vh] w-[7vw] mx-5 flex justify-center items-center rounded-lg">
            <PlusIcon className="h-7 text-zinc-500 w-auto" strokeWidth={4} />
        </Button>
    )
}

const ContentSideViewer = ({ content }: { content: Content }) => {
    const imageUrl = useMemo(() => URL.createObjectURL(content.file), [content.file])
    const isRejected = useMemo(() => content.status === 'rejected', [content.status])

    return (
        <div className="relative bg-zinc-100 h-[12vh] w-[7vw] mx-5 flex justify-center items-center rounded-lg"
            style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        > {
                isRejected ? (
                    <div className="absolute top-0 z-1 h-full w-full bg-red-600 bg-opacity-90 rounded-lg">
                        <div className="flex justify-center items-center h-full w-full">
                            <ExclamationTriangleIcon className='text-white h-10 w-auto' />
                        </div>
                    </div>
                ) : null
            }
        </div>
    )
}

const CircularProgress = ({ progress }: { progress: number }) => {
    const circumference = 2 * 22 / 7 * 15
    return (
        <div className="flex items-center justify-center ">
            <svg className="transform -rotate-90 w-10 h-10">
                <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="5" fill="transparent"
                    className="text-zinc-200" />

                <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="5" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (progress / 100 * circumference)}
                    className="text-emerald-700 " />
            </svg>
        </div>
    )
}

const Footer = ({ contents }: { contents: ContentManagerProps['contents'] }) => {
    const rejectedContentLength = useMemo(() => contents.filter(content => content.status === 'rejected').length, [contents])

    const contentLength = useMemo(() => contents.length, [contents])
    const acceptedContentsLength = useMemo(() => contentLength - rejectedContentLength, [contentLength, rejectedContentLength])

    return (
        <div className="fixed bottom-0 left-0 w-full z-10 bg-blue-50 flex justify-center">
            <div className="grid grid-cols-3 gap-4 mx-12 py-10 w-full">
                <div>
                    <div className="flex flex-row gap-3">
                        <div>
                            <CircularProgress progress={Math.ceil(acceptedContentsLength / contentLength * 100)} />
                        </div>
                        <div>
                            <h1 className="text-emerald-700 font-bold text-xl">Content uploaded</h1>
                            <h1 className="font-semibold text-emerald-500  mt-1">{acceptedContentsLength} of {contentLength} photos and videos are uploaded</h1>
                        </div>
                    </div>
                </div>
                <div>
                    {
                        rejectedContentLength > 0 ? (
                            <div className="flex flex-row gap-3">
                                <div>
                                    <ExclamationCircleIcon className="text-red-600 h-9 w-auto" />
                                </div>
                                <div>
                                    <h1 className="text-red-600 font-bold text-xl">Content failed</h1>
                                    <h1 className="font-semibold text-red-400 mt-1">{rejectedContentLength} of {contentLength} photos are uploaded</h1>
                                </div>
                            </div>
                        ) : null
                    }

                </div>
                <div className="flex justify-end">
                    <Button size="xl">Submit your content</Button>
                </div>
            </div>
        </div>
    )
}

const ContentEditor = ({ content }: { content: Content }) => {
    const imageUrl = useMemo(() => URL.createObjectURL(content.file), [content.file])
    const isRejected = useMemo(() => content.status === 'rejected', [content.status])

    return (
        <div className="flex flex-row items-center gap-4">
            <div className={`${isRejected ? "bg-red-50" : "bg-zinc-100"} rounded-3xl py-10 px-16`}>
                <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="">
                        <img src={imageUrl} alt={content.file.name} className="rounded-2xl" />
                    </div>
                    <div className="">
                        {
                            isRejected ? (<>
                                <h1 className="font-bold text-3xl text-red-600">Error</h1>
                                <p className="mt-2 font-medium text-red-600">{content.message}</p>
                                <Button externalClassName="bg-red-600 mt-5" size="xl">Remove</Button>
                            </>) : (
                                <div className="flex flex-col gap-10">
                                    <div>
                                        <label htmlFor="email" className="block font-semibold text-lg leading-6 text-gray-500">
                                            Title <span className="text-gray-300">(optional)</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                className="block w-full rounded-md border-0 py-3 placeholder:font-medium font-bold text-lg text-gray-900  ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                                                placeholder="Enter title"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block font-semibold text-lg leading-6 text-gray-500">
                                            Tags <span className="text-gray-300">(optional)</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                className="block w-full rounded-md border-0 py-3 placeholder:font-medium  font-bold text-lg text-gray-900  ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                                                placeholder="Enter Tags"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block font-semibold text-lg leading-6 text-gray-500">
                                            Collections <span className="text-gray-300">(optional)</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                className="block w-full rounded-md border-0 py-3 placeholder:font-medium  font-bold text-lg text-gray-900  ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                                                placeholder="Enter Collections"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            <div>
                <Button variant="unstyled" externalClassName="bg-zinc-100 rounded-full p-5 ">
                    <TrashIcon className="h-10 w-auto text-zinc-300 hover:text-zinc-600" />
                </Button>
            </div>
        </div>
    )
}

export const ContentManager = ({ open, contents }: ContentManagerProps) => {
    return (
        <div className=" mt-5">
            <div className="grid grid-cols-8 gap-4 mb-40 px-10 items-start">
                <div className="flex flex-col justify-center items-center gap-4 ">
                    <AddNewContentButton open={open} />
                    {
                        contents.map((content, contentIdx) => <ContentSideViewer content={content} key={contentIdx} />)
                    }
                </div>
                <div className="col-span-7">
                    <div className="flex flex-col justify-center items-center w-full">
                        <h1 className="font-bold text-xl md:text-3xl xl:text-4xl w-3/3 md:w-2/3 px-3 md:px-0 text-center mt-5">Make your photos easy to find and be seen.</h1>
                        <p className="text-center w-4/6 mt-5 text-">The way hashtags make your content discoverable in social media, tags will make it easier to find on mfoni. <b>Add some keywords that describe your photo and what is in it</b>.</p>
                    </div>
                    <div className="mt-10 flex flex-col gap-4">
                        {
                            contents.map((content, contentIdx) => <ContentEditor content={content} key={contentIdx} />)
                        }
                    </div>
                </div>
            </div>
            <Footer contents={contents} />
        </div>
    )
}

