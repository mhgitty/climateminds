import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export const revalidate = 86400 // 24 hours

const BASE = 'https://climateminds.dk'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages] = await Promise.all([
    client
      .fetch<Array<{ slug: { current: string }; publishedAt?: string; lastUpdated?: string }>>(
        `*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) {
          slug, publishedAt, lastUpdated
        }`
      )
      .catch(() => []),
    client
      .fetch<Array<{ slug: { current: string }; parentSlug?: string }>>(
        `*[_type == "page" && defined(slug.current)] {
          slug,
          "parentSlug": parent->slug.current
        }`
      )
      .catch(() => []),
  ])

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug.current}`,
    lastModified: p.lastUpdated
      ? new Date(p.lastUpdated)
      : p.publishedAt
        ? new Date(p.publishedAt)
        : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const pageUrls: MetadataRoute.Sitemap = pages.map((p) => ({
    url: p.parentSlug
      ? `${BASE}/${p.parentSlug}/${p.slug.current}`
      : `${BASE}/${p.slug.current}`,
    changeFrequency: 'monthly',
    priority: p.parentSlug ? 0.6 : 0.5,
  }))

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...postUrls,
    ...pageUrls,
  ]
}
