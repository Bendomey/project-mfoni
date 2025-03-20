import { useLottie } from 'lottie-react'
import lottie from '@/assets/lotties/loading.json'

const style = {
	height: 100,
}

const options = {
	animationData: lottie,
	loop: true,
	autoplay: true,
}

export function LoadingLottie() {
	const { View } = useLottie(options, style)

	return View
}
