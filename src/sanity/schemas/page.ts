import { defineField, defineType } from 'sanity'

export const bodyField = defineField({
  name: 'body',
  title: 'Indhold',
  type: 'array',
  of: [
    {
      type: 'block',
      // Inline objects insertable within text paragraphs
      of: [
        {
          type: 'object',
          name: 'elprisInline',
          title: 'Elpris (inline)',
          fields: [
            {
              name: 'provider', title: 'Udbyder (ctaSlug)', type: 'string',
              description: 'F.eks. "norlys", "ewii", "evdk" — matcher ctaSlug i Google Sheets',
              validation: (r: any) => r.required(),
            },
            {
              name: 'area', title: 'Priszone', type: 'string',
              options: {
                list: [{ title: 'DK1 – Vest', value: 'DK1' }, { title: 'DK2 – Øst', value: 'DK2' }],
                layout: 'radio', direction: 'horizontal',
              },
              initialValue: 'DK1',
            },
          ],
          preview: {
            select: { provider: 'provider', area: 'area' },
            prepare({ provider, area }: any) {
              return { title: `⚡ ${provider || '?'} (${area || 'DK1'})` }
            },
          },
        },
      ],
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Citat', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Fed', value: 'strong' },
          { title: 'Kursiv', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              { name: 'blank', type: 'boolean', title: 'Åbn i nyt vindue' },
            ],
          },
        ],
      },
    },
    { type: 'image', options: { hotspot: true } },
    {
      type: 'object',
      name: 'calloutBlock',
      title: 'Info / Tip boks',
      fields: [
        {
          name: 'variant', title: 'Type', type: 'string',
          options: {
            list: [
              { title: 'ℹ️ Info', value: 'info' },
              { title: '💡 Tip', value: 'tip' },
              { title: '⚠️ Advarsel', value: 'warning' },
            ],
            layout: 'radio', direction: 'horizontal',
          },
          initialValue: 'info',
        },
        { name: 'title', title: 'Overskrift', type: 'string' },
        { name: 'body', title: 'Indhold', type: 'text', rows: 4 },
      ],
      preview: {
        select: { title: 'title', variant: 'variant' },
        prepare({ title, variant }: any) {
          const icons: Record<string, string> = { info: 'ℹ️', tip: '💡', warning: '⚠️' }
          return { title: title || 'Callout', subtitle: `${icons[variant] || 'ℹ️'} ${variant || 'info'}` }
        },
      },
    },
    {
      type: 'object',
      name: 'faqBlock',
      title: 'FAQ',
      fields: [
        { name: 'title', title: 'Overskrift', type: 'string', initialValue: 'Ofte stillede spørgsmål' },
        {
          name: 'items', title: 'Spørgsmål & svar', type: 'array',
          of: [{
            type: 'object', name: 'faqItem',
            fields: [
              { name: 'question', title: 'Spørgsmål', type: 'string' },
              { name: 'answer', title: 'Svar', type: 'text', rows: 3 },
            ],
            preview: { select: { title: 'question', subtitle: 'answer' } },
          }],
        },
      ],
      preview: {
        select: { title: 'title', items: 'items' },
        prepare({ title, items }: any) {
          return { title: title || 'FAQ', subtitle: `${(items || []).length} spørgsmål` }
        },
      },
    },
    {
      type: 'object',
      name: 'prosConsBlock',
      title: 'Fordele & Ulemper',
      fields: [
        { name: 'title', title: 'Overskrift (valgfri)', type: 'string' },
        { name: 'pros', title: 'Fordele ✅', type: 'array', of: [{ type: 'string' }] },
        { name: 'cons', title: 'Ulemper ❌', type: 'array', of: [{ type: 'string' }] },
      ],
      preview: {
        select: { title: 'title', pros: 'pros', cons: 'cons' },
        prepare({ title, pros, cons }: any) {
          return { title: title || 'Fordele & Ulemper', subtitle: `✅ ${(pros || []).length}  ❌ ${(cons || []).length}` }
        },
      },
    },
    {
      type: 'object',
      name: 'latestPostsBlock',
      title: 'Seneste artikler',
      fields: [
        { name: 'title', title: 'Overskrift', type: 'string', initialValue: 'Seneste guides & artikler' },
        {
          name: 'count', title: 'Antal artikler', type: 'number',
          options: { list: [2, 3, 4, 6], layout: 'radio', direction: 'horizontal' },
          initialValue: 4,
        },
        { name: 'showViewAll', title: 'Vis "Se alle" link', type: 'boolean', initialValue: true },
      ],
      preview: {
        select: { title: 'title', count: 'count' },
        prepare({ title, count }: any) {
          return { title: title || 'Seneste artikler', subtitle: `${count || 4} artikler` }
        },
      },
    },
    {
      type: 'object',
      name: 'elselskabShortcode',
      title: 'Elselskab kort',
      fields: [
        {
          name: 'ctaSlug', title: 'Udbyder (ctaSlug)', type: 'string',
          description: 'F.eks. "norlys", "ewii", "evdk" — matcher ctaSlug i Google Sheets',
          validation: (r: any) => r.required(),
        },
        {
          name: 'area', title: 'Priszone', type: 'string',
          options: {
            list: [{ title: 'DK1 – Vest', value: 'DK1' }, { title: 'DK2 – Øst', value: 'DK2' }],
            layout: 'radio', direction: 'horizontal',
          },
          initialValue: 'DK1',
        },
      ],
      preview: {
        select: { ctaSlug: 'ctaSlug', area: 'area' },
        prepare({ ctaSlug, area }: any) {
          return { title: `⚡ ${ctaSlug || 'Udbyder'}`, subtitle: area || 'DK1' }
        },
      },
    },
    {
      type: 'object',
      name: 'providerPriceBlock',
      title: 'Prisboks med udbyder',
      fields: [
        { name: 'title', title: 'Overskrift (h3)', type: 'string' },
        { name: 'text', title: 'Tekst', type: 'text', rows: 3 },
        { name: 'pros', title: 'Fordele ✅', type: 'array', of: [{ type: 'string' }] },
        { name: 'cons', title: 'Ulemper ❌', type: 'array', of: [{ type: 'string' }] },
        {
          name: 'ctaSlug', title: 'Udbyder til pristabel (ctaSlug)', type: 'string',
          description: 'Bruges til kWh-pristabellen. F.eks. "norlys"',
          validation: (r: any) => r.required(),
        },
        {
          name: 'offerSlugs', title: 'Tilbud at vise (ctaSlugs)', type: 'array',
          of: [{ type: 'string' }],
          description: 'Tilføj én eller flere ctaSlugs for de tilbud der vises i bunden. F.eks. "norlys", "norlys-fastpris"',
        },
        {
          name: 'area', title: 'Priszone', type: 'string',
          options: {
            list: [{ title: 'DK1 – Vest', value: 'DK1' }, { title: 'DK2 – Øst', value: 'DK2' }],
            layout: 'radio', direction: 'horizontal',
          },
          initialValue: 'DK1',
        },
      ],
      preview: {
        select: { title: 'title', ctaSlug: 'ctaSlug', area: 'area' },
        prepare({ title, ctaSlug, area }: any) {
          return { title: title || 'Prisboks', subtitle: `${ctaSlug || '?'} · ${area || 'DK1'}` }
        },
      },
    },
  ],
})

export const pageType = defineType({
  name: 'page',
  title: 'Sider',
  type: 'document',
  groups: [
    { name: 'content', title: 'Indhold' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3, group: 'content', description: 'Kort tekst der vises under overskriften i hero-sektionen' }),
    { ...bodyField, group: 'content' } as any,
    defineField({ name: 'metaTitle', title: 'Meta titel', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta beskrivelse', type: 'text', rows: 3, group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
