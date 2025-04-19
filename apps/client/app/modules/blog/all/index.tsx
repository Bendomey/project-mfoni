import { Footer } from "@/components/footer/index.tsx";
import { Image } from "@/components/Image.tsx";
import { Header } from "@/components/layout/index.ts";
import { loader } from "@/routes/blog._index.ts";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";

export function AllBlogsModule() {
  const { posts } = useLoaderData<typeof loader>()
  return (
    <div className="relative">
      <Header isHeroSearchInVisible={false} />
      <div className="max-w-8xl mx-auto px-4 py-4 lg:px-8">
        <div className="mt-5">
          <h1 className="text-4xl font-black">From the blog</h1>
          <div className="mt-5">
            <p className="w-full text-zinc-600 md:w-2/4 font-shantell">
              Learn more about photography, the mfoni community, and the
              latest news from mfoni. We share tips, tricks, and
              inspiration to help you get the most out of your
              photography experience.
            </p>
          </div>
        </div>

        <div className="py-16">
          {posts.map((post) => (
            <article key={post.slug} className="relative isolate flex flex-col gap-8 lg:flex-row">
              <div className="relative aspect-video sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                <Image
                  alt={post.title}
                  src={post.imageUrl}
                  className="absolute inset-0 size-full rounded-2xl bg-gray-50 object-cover"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
              </div>
              <div>
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={new Date(post.date).toISOString()} className="text-gray-500">
                    {dayjs(new Date(post.date)).format('LL')}
                  </time>
                  <a
                    href={post.category.href}
                    className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {post.category.title}
                  </a>
                </div>
                <div className="group relative max-w-xl">
                  <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                    <a href={`/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
                  </h3>
                  <p className="mt-5 text-sm/6 text-gray-600">{post.description}</p>
                </div>
                <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                  <div className="relative flex items-center gap-x-4">
                    <Image alt={post.author.name} src={post.author.imageUrl} className="size-10 rounded-full bg-gray-50" />
                    <div className="text-sm/6">
                      <p className="font-semibold text-gray-900">
                        <a href={post.author.href}>
                          <span className="absolute inset-0" />
                          {post.author.name}
                        </a>
                      </p>
                      <p className="text-gray-600">{post.author.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

