import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { SetupAccountModal } from "./setup-modal/index.tsx";
import { TypewriterEffectSmooth } from "@/components/animation/TypeWriteEffect.tsx";
import { Button } from "@/components/button/index.tsx";
import { APP_NAME } from "@/constants/index.ts";
import { useDisclosure } from "@/hooks/use-disclosure.tsx";
import { useAuth } from "@/providers/auth/index.tsx";

const words = [
  {
    text: "What",
  },
  {
    text: "is",
  },
  {
    text: "your",
  },
  {
    text: "primary",
  },
  {
    text: "goal?",
  },
];

export const OnboardingModule = () => {
  const [selectedType, setSelected] = useState<UserRole>();
  const { onToggle, isOpened } = useDisclosure();
  const { currentUser, getToken, onSignout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role) {
      navigate("/account");
    }
  }, [currentUser, getToken, navigate]);

  const handleContinue = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <>
      <div className="relative flex h-screen w-full flex-col">
        <div className="flex flex-row items-center justify-between border-b border-zinc-200 px-5 py-5 md:px-10">
          <button
            onClick={() => {
              onSignout();
              navigate("/auth");
            }}
            className="ml-2 flex flex-row items-center"
          >
            <ArrowLeftIcon className="h-7 w-7 text-zinc-600" />
            <div className="ml-2 flex flex-row items-end">
              <span className="text-4xl font-extrabold text-blue-700">
                {APP_NAME.slice(0, 1)}
              </span>
              <span className="text-4xl font-extrabold">
                {APP_NAME.slice(1)}
              </span>
            </div>
          </button>
          <div>
            {selectedType ? (
              <Button
                onClick={handleContinue}
                size="lg"
                variant="outlined"
                className="hidden md:flex"
              >
                Continue{" "}
                <ArrowRightIcon className="ml-2 h-5 w-5 text-zinc-600" />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="flex h-full flex-col items-center justify-center bg-zinc-50">
          {/* <h1 className="font-bold  text-center text-4xl w-2/3 md:w-auto md:text-5xl">
            What is your primary goal?
          </h1> */}
          <TypewriterEffectSmooth words={words} />
          <div className="w-3/3 sm:w-3/3 my-10 px-5 md:w-2/3 md:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 md:grid-cols-2 md:gap-8">
              <button
                onClick={() => setSelected("CLIENT")}
                type="button"
                className={`flex-start flex flex-col border-2 hover:bg-zinc-100 ${
                  selectedType === "CLIENT"
                    ? "border-zinc-600"
                    : "border-dashed border-zinc-300"
                } rounded-lg p-5`}
              >
                <img
                  className="hidden h-auto max-w-full rounded-lg md:block"
                  src="/images/user.jpeg"
                  alt="I'm here to download photos and videos"
                />
                <div className="mt-0 md:mt-4">
                  <h3 className="text-start text-2xl font-bold">User</h3>
                  <h3 className="text-start text-zinc-500">
                    I&apos;m here to download photos and videos.
                  </h3>
                </div>
              </button>
              <button
                onClick={() => setSelected("CREATOR")}
                type="button"
                className={`flex-start flex flex-col border-2 hover:bg-zinc-100 ${
                  selectedType === "CREATOR"
                    ? "border-zinc-600"
                    : "border-dashed border-zinc-300"
                } cursor-pointer rounded-lg p-5`}
              >
                <img
                  className="hidden h-auto max-w-full rounded-lg md:block"
                  src="/images/creator.jpg"
                  alt="I'm here to share my photos with the world"
                />
                <div className="mt-0 md:mt-4">
                  <h3 className="text-start text-2xl font-bold">Creator</h3>
                  <h3 className="text-start text-zinc-500">
                    I&apos;m here to share my photos with the world.
                  </h3>
                </div>
              </button>
            </div>
            {selectedType ? (
              <Button
                size="lg"
                onClick={handleContinue}
                variant="outlined"
                className="mt-10 flex w-full justify-center md:hidden"
              >
                Continue{" "}
                <ArrowRightIcon className="ml-2 h-5 w-5 text-zinc-600" />
              </Button>
            ) : null}
          </div>
          <div className="w-5/6 md:w-3/6">
            <p className="text-center font-medium text-zinc-500">
              We’ll use this info to personalize your experience. You’ll always
              be able to both download and upload photos, no matter which option
              you choose.
            </p>
          </div>
        </div>
      </div>
      <SetupAccountModal
        open={isOpened}
        onClose={onToggle}
        selectedType={selectedType}
      />
    </>
  );
};
