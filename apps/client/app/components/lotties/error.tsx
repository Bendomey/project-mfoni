import { useLottie } from 'lottie-react'
import lottie from '@/assets/lotties/error.json'

const style = {
	height: 100,
}

const options = {
	animationData: lottie,
	loop: true,
	autoplay: true,
}

export function ErrorLottie() {
	const { View } = useLottie(options, style)

	return View
}
