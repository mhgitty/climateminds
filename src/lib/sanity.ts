import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-04-22',
  useCdn: true,
})

export async function getPosts(limit = 20, categorySlug?: string) {
  const filter = categorySlug
    ? `*[_type == "post" && defined(publishedAt) && category->slug.current == $categorySlug]`
    : `*[_type == "post" && defined(publishedAt)]`

  return client.fetch(
    `${filter} | order(publishedAt desc) [0...$limit] {
      _id, title, slug, excerpt, publishedAt, readingTime, featuredImage,
      category-> { name, slug, emoji }
    }`,
    { limit, categorySlug: categorySlug ?? '' }
  )
}

export async function getPostBySlug(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id, title, slug, excerpt, body, publishedAt, lastUpdated, readingTime,
      featuredImage, metaTitle, metaDescription,
      category-> { name, slug, emoji },
      author-> { name, bio, linkedin, "imageUrl": image.asset->url }
    }`,
    { slug }
  )
}

export async function getCategories() {
  return client.fetch(
    `*[_type == "category"] | order(name asc) { _id, name, slug, emoji, description }`
  )
}

export async function getPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "page" && slug.current == $slug][0] {
      _id, title, slug, intro, body, metaTitle, metaDescription
    }`,
    { slug }
  )
}

export async function getElselskaber() {
  return client.fetch(
    `*[_type == "elselskab"] | order(sortOrder asc) {
      _id, name, ctaSlug, logo, affiliateUrl, shortDescription, badges, rating, pros, cons, sortOrder
    }`
  )
}

export async function getHomepage() {
  return client.fetch(
    `*[_type == "homepage" && _id == "homepage"][0] {
      heroHeading, heroGreenText, intro, body,
      howItWorksTitle, showHowItWorks, howItWorksItems,
      metaTitle, metaDescription
    }`
  )
}

export async function getElselskabBySlug(ctaSlug: string) {
  return client.fetch(
    `*[_type == "elselskab" && ctaSlug.current == $ctaSlug][0] {
      _id, name, ctaSlug, logo, affiliateUrl, shortDescription, badges,
      rating, pros, cons, reviewBody, metaTitle, metaDescription
    }`,
    { ctaSlug }
  )
}
