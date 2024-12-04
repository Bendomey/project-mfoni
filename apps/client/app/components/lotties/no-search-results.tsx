import lottie from '@/assets/lotties/no-search-results.json'
import {useLottie} from 'lottie-react'

const style = {
  height: 100,
}

const options = {
  animationData: lottie,
  loop: false,
  autoplay: true,
}

export function NoSearchResultLottie() {
  const {View} = useLottie(options, style)

  return View
}
