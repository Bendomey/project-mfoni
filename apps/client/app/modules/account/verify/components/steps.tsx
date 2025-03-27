import {
  EnvelopeIcon,
  PhoneIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useMemo } from "react";
import { classNames } from "@/lib/classNames.ts";
import { useAuth } from "@/providers/auth/index.tsx";

export type Step = "phone" | "email" | "welcome";

interface Props {
  activeStep: Step;
}

export function Steps({ activeStep }: Props) {
  const { currentUser } = useAuth();
  const getStepStatus = useCallback(
    (step: Step) => {
      if (step === "phone") {
        if (currentUser?.phoneNumberVerifiedAt) {
          return "active";
        }
      }

      if (step === "email") {
        if (currentUser?.emailVerifiedAt) {
          return "active";
        }
      }

      return step === activeStep ? "active" : "inactive";
    },
    [activeStep, currentUser],
  );

  const steps = useMemo(() => {
    return [
      // {
      //   name: 'Your details',
      //   id: 'name',
      //   description: 'Provide your name and username',
      //   icon: UserIcon,
      //   status: getStepStatus('name'),
      // },
      {
        name: "Verify your phone",
        description: "Enter your verification code",
        status: getStepStatus("phone"),
        icon: PhoneIcon,
        id: "phone",
      },
      {
        name: "Verify your email",
        description: "Enter your verification code",
        status: getStepStatus("email"),
        icon: EnvelopeIcon,
        id: "email",
      },
      // {
      //   name: 'Verfiy ID',
      //   description: 'Verif your card information',
      //   status: getStepStatus('id'),
      //   icon: CheckIcon,
      //   id: 'id',
      // },
      {
        name: "Welcome to mfoni",
        description: "Get up and running in a minute",
        status: getStepStatus("welcome"),
        icon: RocketLaunchIcon,
        id: "welcome",
      },
    ];
  }, [getStepStatus]);

  return (
    <nav aria-label="Progress">
      <ol className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? "pb-7" : "",
              "relative",
            )}
          >
            {step.status === "active" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div
                  className="group relative flex items-start"
                  aria-current="step"
                >
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 bg-white">
                      <step.icon
                        className="h-4 w-auto text-zinc-700"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col items-start">
                    <span className="text-sm font-bold text-zinc-700">
                      {step.name}
                    </span>
                    <span className="mt-.5 text-sm text-gray-500">
                      {step.description}
                    </span>
                  </span>
                </div>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="group relative flex items-start">
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white">
                      <step.icon
                        className="h-4 w-auto text-zinc-400"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col items-start">
                    <span className="text-sm font-bold text-gray-400">
                      {step.name}
                    </span>
                    <span className="mt-.5 text-sm text-gray-400">
                      {step.description}
                    </span>
                  </span>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
