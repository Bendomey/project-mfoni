import { type Readable } from 'stream'

// Helper function to convert a readable stream to a buffer
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
	const chunks: any[] = []

	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
		stream.on('error', (err) => reject(err))
		stream.on('end', () => resolve(Buffer.concat(chunks)))
	})
}
