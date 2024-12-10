import lottie from '@/assets/lotties/error.json'
import {useLottie} from 'lottie-react'

const style = {
  height: 100,
}

const options = {
  animationData: lottie,
  loop: true,
  autoplay: true,
}

export function ErrorLottie() {
  const {View} = useLottie(options, style)

  return View
}
