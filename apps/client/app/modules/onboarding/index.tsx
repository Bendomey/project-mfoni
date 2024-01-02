import { Button } from "@/components/button/index.tsx";
import { APP_NAME } from "@/constants/index.ts";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Link } from "@remix-run/react";
import creatorImage from '@/assets/creator.jpg';


export const OnboardingModule = () => {
    return (
        <div className="h-screen w-full flex flex-col">
            <div className="border-b border-zinc-200  px-10 py-5 flex flex-row items-center justify-between">
                <Link to="/" className="">
                    <div className='flex flex-row items-end'>
                        <span className="text-4xl text-blue-700 font-extrabold">{APP_NAME.slice(0, 1)}</span>
                        <span className="text-4xl font-extrabold">{APP_NAME.slice(1)}</span>
                    </div>
                </Link>
                <Button size="lg" variant="outline" externalClassName="flex flex-row items-center">
                    Continue <ArrowRightIcon className="h-5 w-5 text-zinc-600 ml-2" />
                </Button>
            </div>
            <div className="h-full bg-zinc-50 flex flex-col justify-center items-center">
                <h1 className="font-bold text-5xl">What is your primary goal?</h1>
                <div className="my-10 w-2/3">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="border border-dashed border-zinc-300 p-5 rounded-lg">
                            <img className="rounded-lg max-w-full h-auto" src="https://images.unsplash.com/photo-1576266394503-4999348b5447?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                            <div className="mt-4">
                                <h3 className="font-bold text-2xl">User</h3>
                                <h3 className="text-zinc-500 ">I&apos;m here to download free photos and videos.</h3>
                            </div>
                        </div>
                        <div className="border border-dashed border-zinc-300 p-5 rounded-lg">
                            <img className="rounded-lg max-w-full h-auto" src={creatorImage} alt="" />
                            <div className="mt-4">
                                <h3 className="font-bold text-2xl">Creator</h3>
                                <h3 className="text-zinc-500 ">I&apos;m here to share my photos and videos with the world.</h3>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="w-3/6">
                    <p className="text-center font-medium text-zinc-500">We’ll use this info to personalize your experience. You’ll always be able to both download and upload photos and videos, no matter which option you choose.</p>
                </div>
            </div>
        </div>
    );
}