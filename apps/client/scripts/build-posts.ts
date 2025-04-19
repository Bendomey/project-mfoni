import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const blogPostsFolder = 'app/modules/blog/articles'
const dir = path.join(process.cwd(), blogPostsFolder)
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))

const posts = files.map((file) => {
	const source = fs.readFileSync(path.join(dir, file), 'utf8')
	const { data } = matter(source)
	const slug = file.replace(/\.mdx$/, '')
	return { slug, ...data }
})

const output = `export const posts = ${JSON.stringify(posts, null, 2)};`

fs.writeFileSync('app/generated/posts.ts', output)
