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
    if (type === 'post') { revalidatePath('/blog'); revalidatePath('/blog/[slug]', 'page') }
    else if (type === 'page') { revalidatePath('/[slug]', 'page') }
    else if (type === 'elselskab') { revalidatePath('/') }
    else { revalidatePath('/', 'layout') }
    return NextResponse.json({ revalidated: true, type: type ?? 'all' })
  } catch (err) {
    return NextResponse.json({ message: 'Revalidation failed', error: String(err) }, { status: 500 })
  }
}
