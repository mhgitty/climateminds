import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const type = body?._type as string | undefined
    const slug = body?.slug?.current as string | undefined

    const revalidated: string[] = []

    const touch = (path: string, kind?: 'page' | 'layout') => {
      revalidatePath(path, kind)
      revalidated.push(path)
    }

    if (type === 'homepage') {
      touch('/', 'page')
    } else if (type === 'post') {
      touch('/blog', 'page')
      touch('/', 'page')
      if (slug) touch(`/blog/${slug}`, 'page')
      else touch('/blog/[slug]', 'page')
    } else if (type === 'page') {
      if (slug) touch(`/${slug}`, 'page')
      else touch('/[slug]', 'page')
    } else if (type === 'elselskab') {
      touch('/', 'page')
    } else if (type === 'category' || type === 'author') {
      touch('/blog', 'page')
    } else {
      // Unknown type — revalidate everything
      touch('/', 'layout')
    }

    return NextResponse.json({ revalidated: true, type: type ?? 'unknown', paths: revalidated })
  } catch (err) {
    return NextResponse.json({ message: 'Revalidation failed', error: String(err) }, { status: 500 })
  }
}
