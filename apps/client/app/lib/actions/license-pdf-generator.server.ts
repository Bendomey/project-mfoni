import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface LicensePdfProps {
	customerName: string
	imageTitle: string
	downloadDate: string
}
export async function generateLicensePdf({
	customerName,
	imageTitle,
	downloadDate,
}: LicensePdfProps) {
	const pdfDoc = await PDFDocument.create()

	const page = pdfDoc.addPage([595, 842]) // A4
	const { height } = page.getSize()
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

	const drawText = (text: string, x: number, y: number, size = 12) => {
		page.drawText(text, {
			x,
			y,
			size,
			font,
			color: rgb(0, 0, 0),
		})
	}

	drawText('Content License Agreement', 50, height - 50, 20)
	drawText(`Effective Date: ${downloadDate}`, 50, height - 80)
	drawText(`Customer Name: ${customerName}`, 50, height - 120)
	drawText(`Content Title: ${imageTitle}`, 50, height - 140)

	drawText('1. Grant of License:', 50, height - 180, 14)
	drawText(
		'You are granted a non-exclusive, non-transferable license to use the image for',
		50,
		height - 200,
	)
	drawText(
		'personal or commercial purposes, in accordance with the terms outlined below.',
		50,
		height - 215,
	)

	drawText('2. Permitted Uses:', 50, height - 250, 14)
	drawText('- Use in websites, marketing, social media, etc.', 60, height - 270)
	drawText('- Modify the image as needed for your project.', 60, height - 285)

	drawText('3. Restrictions:', 50, height - 320, 14)
	drawText('- No resale, redistribution, or sublicensing.', 60, height - 340)
	drawText('- No unlawful or defamatory usage.', 60, height - 355)

	drawText('4. Intellectual Property:', 50, height - 390, 14)
	drawText(
		'All rights remain with Mfoni or the original creator. This license does not imply',
		50,
		height - 410,
	)
	drawText('ownership transfer.', 50, height - 425)

	drawText('5. Termination:', 50, height - 460, 14)
	drawText(
		'License is void if terms are violated. Delete all copies upon termination.',
		50,
		height - 480,
	)

	drawText('6. No Warranty:', 50, height - 515, 14)
	drawText(
		'Content is provided as-is. Mfoni is not liable for usage outcomes.',
		50,
		height - 535,
	)

	drawText('Authorized by Mfoni', 50, height - 580)
	drawText('www.mfoni.com | support@mfoni.app', 50, height - 595)

	const pdfBytes = await pdfDoc.save()
	return pdfBytes
}
