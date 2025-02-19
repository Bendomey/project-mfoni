export const dataURLtoFile = (dataUrl: string, filename: string) => {
	const arr = dataUrl.split(',')

	if (arr.length < 2) {
		throw new Error('Invalid data url')
	}

	let mime = arr[0]!.match(/:(.*?);/)![1],
		bstr = atob(arr[1]!),
		n = bstr.length,
		u8arr = new Uint8Array(n)

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n)
	}
	const extension = mime?.split('/')[1] ?? 'jpg'
	return new File([u8arr], `${filename}.${extension}`, { type: mime })
}
