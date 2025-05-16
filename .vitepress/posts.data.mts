import { createContentLoader } from "vitepress";

interface Post {
  title: string
  url: string
  image?: string
  desc: string
  date: string
  author: string
  lang: string
  relativeDate: string
}

declare const data: Post[]

export { data }

export default createContentLoader("/src/diary/**/*.md", {
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title,
        url,
        image: frontmatter.image,
        desc: frontmatter.desc,
        date: frontmatter.date,
        lang: frontmatter.lang || 'en-US',
        author: frontmatter.author,
        relativeDate: formatRelativeDate(frontmatter.date)
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
})

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays === 2) return 'Two days ago'
  if (diffDays <= 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
