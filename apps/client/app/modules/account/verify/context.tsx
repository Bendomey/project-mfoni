import { useNavigate } from "@remix-run/react";
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { type Step } from "./components/steps.tsx";
import { Loader } from "@/components/loader/index.tsx";
import { useAuth } from "@/providers/auth/index.tsx";

interface VerifyCreatorContextProps {
  activeStep: Step;
  setActiveStep: Dispatch<SetStateAction<Step>>;
}

const VerifyCreatorContext = createContext<VerifyCreatorContextProps>({
  activeStep: "phone",
  setActiveStep: () => {},
});

export const VerifyCreatorProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<Step>("phone");

  const { getToken, currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (currentUser?.emailVerifiedAt && currentUser.phoneNumberVerifiedAt) {
      setActiveStep("welcome");
    } else if (
      currentUser?.emailVerifiedAt &&
      !currentUser.phoneNumberVerifiedAt
    ) {
      setActiveStep("phone");
    } else if (
      !currentUser?.emailVerifiedAt &&
      currentUser?.phoneNumberVerifiedAt
    ) {
      setActiveStep("email");
    }
  }, [currentUser, getToken, navigate]);

  if (isLoading && currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <VerifyCreatorContext.Provider
      value={{
        activeStep,
        setActiveStep,
      }}
    >
      {children}
    </VerifyCreatorContext.Provider>
  );
};

export const useVerifyCreator = () => {
  const context = useContext(VerifyCreatorContext);

  if (!context) {
    throw new Error(
      "useVerifyCreator must be used within VerifyCreatorContext",
    );
  }

  return context;
};
