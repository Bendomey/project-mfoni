/* eslint-disable react-hooks/exhaustive-deps */
import { Transition } from "@headlessui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect } from "react";
import { Image } from "remix-image";
import { ClientOnly } from "remix-utils/client-only";
import { LoginAuthProvider, useLoginAuth } from "./context/index.tsx";
import { FacebookButton } from "./facebook/index.tsx";
import { GoogleButton } from "./google/index.tsx";
import { TwitterButton } from "./twitter/index.tsx";
import { TypewriterEffectSmooth } from "@/components/animation/TypeWriteEffect.tsx";
import { Button } from "@/components/button/index.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { APP_NAME } from "@/constants/index.ts";
import { useAuth } from "@/providers/auth/index.tsx";

const words = [
  {
    text: "Welcome",
  },
  {
    text: "back",
  },
  {
    text: "👋🏽",
  },
];

export const LoginComponent = () => {
  const { isLoading, errorMessage, setErrorMessage } = useLoginAuth();
  const { onSignout } = useAuth();

  useEffect(() => {
    // signout when a user visits this page.
    onSignout();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (errorMessage.length) {
      timeoutId = setTimeout(() => {
        setErrorMessage("");
      }, 7000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [errorMessage, setErrorMessage]);

  return (
    <div className="flex h-screen flex-1">
      <div className="relative hidden w-1/3 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
          alt="auth page background"
        />
        <div className="absolute top-0 h-full w-full bg-black/70 p-10">
          <div className="flex h-full flex-col justify-between">
            <div />

            <div className="mt-10">
              <div className="mb-5 flex flex-row items-end">
                <span className="text-5xl font-extrabold text-blue-700">
                  {APP_NAME.slice(0, 1)}
                </span>
                <span className="text-5xl font-extrabold text-white">
                  {APP_NAME.slice(1)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-blue-100">
                The best photo gallery shared by creators in Ghana.
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex w-2/3 flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        {isLoading ? (
          <div className="absolute left-0 top-0 z-2 flex h-full w-full items-center justify-center bg-black/70">
            <Loader color="fill-white" />
          </div>
        ) : null}
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="mb-8 flex">
              <Button
                isLink
                href="/"
                variant="unstyled"
                className="flex flex-row flex-wrap items-center rounded-lg p-2 hover:bg-zinc-100"
              >
                <ArrowLeftIcon className="mr-3 h-4 w-4" />
                <span className="font-bold">Go Back</span>
              </Button>
            </div>
            <ClientOnly>
              {() => (
                <TypewriterEffectSmooth
                  words={words}
                  wordClassName=" text-3xl md:text-4xl font-bold leading-9 tracking-tight text-gray-900"
                />
              )}
            </ClientOnly>
            <p className="ml-2 leading-6 text-gray-500">
              Continue with your favorite social media platform.
            </p>
            <Transition
              as={Fragment}
              show={Boolean(errorMessage.length)}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <div className="mt-4">
                <div className="rounded-lg bg-red-400 p-2 text-sm text-white">
                  {errorMessage}
                </div>
              </div>
            </Transition>
          </div>

          <div className="mt-16">
            <div className="mt-10">
              <div className="mt-6 grid grid-cols-1 gap-4">
                <GoogleButton />

                <FacebookButton />

                <TwitterButton />

                {/* TODO: work on this later! */}
                {/* <Button
                  variant="unstyled"
                  externalClassName="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-3 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                >
                  <svg
                    className="h-7 w-7 text-white"
                    viewBox="0 0 24 24"
                    fill="#fff"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 7c-3 0 -4 3 -4 5.5c0 3 2 7.5 4 7.5c1.088 -.046 1.679 -.5 3 -.5c1.312 0 1.5 .5 3 .5s4 -3 4 -5c-.028 -.01 -2.472 -.403 -2.5 -3c-.019 -2.17 2.416 -2.954 2.5 -3c-1.023 -1.492 -2.951 -1.963 -3.5 -2c-1.433 -.111 -2.83 1 -3.5 1c-.68 0 -1.9 -1 -3 -1z" />
                    <path d="M12 4a2 2 0 0 0 2 -2a2 2 0 0 0 -2 2" />
                  </svg>
                  <span className="text-sm font-semibold leading-6">Apple</span>
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoginModule = () => {
  return (
    <LoginAuthProvider>
      <LoginComponent />
    </LoginAuthProvider>
  );
};
