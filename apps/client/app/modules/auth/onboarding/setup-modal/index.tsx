import { useSetupAccount } from "@/api/auth/index.ts";
import { Button } from "@/components/button/index.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { Transition, Dialog } from "@headlessui/react";
import { Fragment } from "react";


interface Props {
    open: boolean;
    onClose: () => void;
}

export const SetupAccountModal = ({ onClose, open }: Props) => {
    const { isPending } = useSetupAccount()

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => { }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/20  backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-center mb-3">
                                    <span className="inline-block h-14 w-14 overflow-hidden rounded-full bg-gray-100">
                                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </span>
                                </div>
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-center text-gray-900"
                                >
                                    Complete Account Setup
                                </Dialog.Title>
                                <div className="mt-2">

                                    <p className="text-sm text-center text-gray-500">
                                        Great news! You&apos;re almost there. Please complete your account setup to continue.
                                    </p>

                                    <div className="mt-3">
                                        <div className="flex justify-between">
                                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                                Name
                                            </label>
                                        </div>
                                        <div className="mt-2">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                placeholder='Domey Benjamin'
                                                aria-describedby="email-optional"
                                            />
                                        </div>
                                    </div>

                                    {/* { */}
                                    {/* user === "CREATOR" ? ( */}
                                    <div className="mt-3">
                                        <div className="flex justify-between">
                                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                                Username
                                            </label>
                                        </div>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                placeholder="Username"
                                                aria-describedby="username-optional"
                                            />
                                        </div>
                                    </div>
                                    {/* ) : null */}
                                    {/* } */}
                                </div>

                                <div className="mt-4">
                                    <Button
                                        variant="unstyled"
                                        type="button"
                                        onClick={onClose}
                                        externalClassName="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    >
                                        Save Changes!
                                    </Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        externalClassName=" ml-2 "
                                        onClick={onClose}
                                    >
                                        Close
                                    </Button>
                                </div>

                                {
                                    isPending ? (
                                        <div className="absolute h-full w-full flex justify-center items-center inset-0 bg-black/40">
                                            <Loader color="fill-white" />
                                        </div>
                                    ) : null
                                }

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}