import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Blog",
  description: "Latest articles and updates",
}

export default async function BlogPage() {
  const posts = await prisma.blog.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
      author: {
        select: { name: true },
      },
    },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="mt-2 text-muted-foreground">Latest articles, updates, and insights.</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No posts published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    {post.author?.name && <span>{post.author.name}</span>}
                    <span>·</span>
                    <time>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</time>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  )}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
