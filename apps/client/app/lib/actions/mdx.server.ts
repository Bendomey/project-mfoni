import fs from 'fs/promises'
import path from 'path'
import { bundleMDX } from 'mdx-bundler'

interface GetMdxPageProps {
	contentDir: string
	slug: string
}
export async function getMdxPage({ contentDir, slug }: GetMdxPageProps) {
	try {
		const filepath = path.join(process.cwd(), contentDir, `${slug}.mdx`)
		const source = await fs.readFile(filepath, 'utf8')

		if (!source) return null

		const { code, frontmatter } = await bundleMDX({
			source,
			cwd: path.join(process.cwd(), contentDir),
			grayMatterOptions: (options) => {
				options.excerpt = true

				return options
			},
		})

		return { code, frontmatter }
	} catch (error) {
		console.error('Error in getMdxPage:', error instanceof Error ? error.message : error);
		return null
	}
}
