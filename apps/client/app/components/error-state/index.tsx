import { type PropsWithChildren } from "react";
import { ErrorLottie } from "@/components/lotties/error.tsx";

interface Props {
  title: string;
  message: string;
  svg?: any;
}

export function ErrorState({
  message,
  title,
  svg,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="text-center">
      {svg ? svg : <ErrorLottie />}
      <h3 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
