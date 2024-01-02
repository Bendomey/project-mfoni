import { Button } from "../button/index.tsx"
import { LockClosedIcon, HeartIcon } from "@heroicons/react/24/outline"


interface Props {
    content: Content
}

export const Content = ({ content }: Props) => {

    return (
        <div title="Photo by Benjamin Domey" className=" cursor-zoom-in mb-5 relative ">
            <img className="h-auto max-w-full rounded-lg" src={content.url} alt="" />

            <div className="group hover:bg-black/50 w-full h-full z-10 rounded-lg absolute top-0">
                <div className="p-2 flex flex-col justify-between h-full w-full">
                    <div className="flex flex-row items-center justify-between p-2">
                        <div>
                            <div className="bg-black px-3 py-1 rounded-full text-white text-sm font-semibold">Mfoni+</div>
                        </div>
                        <div className="group-hover:block hidden">
                            <Button variant="outline" size="sm" externalClassName="">
                                <HeartIcon className="h-6 w-6 text-zinc-700" />
                            </Button>
                        </div>
                    </div>
                    <div className="group-hover:flex hidden flex-row items-center justify-between">
                        <div className="flex items-center">
                            <img
                                className="inline-block h-7 w-7 rounded-full"
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt=""
                            />
                            <span className="ml-2 text-white font-medium text-sm">Domey Benjamin</span>
                        </div>
                        <div>
                            <Button variant="outline" externalClassName="flex flex-row items-center">
                                <LockClosedIcon className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}