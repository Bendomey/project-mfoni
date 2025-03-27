import { useLottie } from "lottie-react";
import lottie from "@/assets/lotties/empty.json";

const style = {
  height: 100,
};

const options = {
  animationData: lottie,
  loop: true,
  autoplay: true,
};

export function EmptyLottie() {
  const { View } = useLottie(options, style);

  return View;
}
