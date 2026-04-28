import { defineField, defineType } from 'sanity'

/**
 * Elselskaber — supplerende redaktionelt indhold til sammenligningstabellen.
 * Priser hentes fra Google Sheets via elpriser.ts.
 * Koblingen sker via ctaSlug (matcher kolonne B i arket).
 */
export const elselskabType = defineType({
  name: 'elselskab',
  title: 'Elselskaber',
  type: 'document',
  groups: [
    { name: 'info', title: 'Information' },
    { name: 'review', title: 'Anmeldelse' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'name', title: 'Navn', type: 'string', group: 'info',
      validation: (r) => r.required(),
      description: 'F.eks. "Aura Energi" — matcher kolonne A i Google Sheets',
    }),
    defineField({
      name: 'ctaSlug', title: 'CTA Slug', type: 'slug', group: 'info',
      options: { source: 'name' },
      validation: (r) => r.required(),
      description: 'Matcher kolonne B i Google Sheets — bruges til at koble data',
    }),
    defineField({
      name: 'logo', title: 'Logo', type: 'image', group: 'info',
      options: { hotspot: false },
    }),
    defineField({
      name: 'affiliateUrl', title: 'Affiliate URL', type: 'url', group: 'info',
      description: 'Link til tilmeldingsside (med evt. affiliate-parameter)',
    }),
    defineField({
      name: 'intro', title: 'Intro', type: 'text', rows: 3, group: 'info',
      description: 'Kort tekst der vises under selskabsnavnet i hero-sektionen på selskabets side',
    }),
    defineField({
      name: 'shortDescription', title: 'Kort beskrivelse', type: 'text', rows: 2, group: 'info',
      description: 'Vises under selskabsnavnet i tabellen',
    }),
    defineField({
      name: 'badges', title: 'Badges', type: 'array', group: 'info',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '🌿 Grøn energi', value: 'green' },
          { title: '⭐ Redaktørens valg', value: 'editors-choice' },
          { title: '💰 Billigst nu', value: 'cheapest' },
          { title: '🆕 Ny udbyder', value: 'new' },
          { title: '🔒 Ingen binding', value: 'no-lock-in' },
        ],
      },
    }),
    defineField({
      name: 'rating', title: 'Bedømmelse (1–5)', type: 'number', group: 'info',
      validation: (r) => r.min(1).max(5),
    }),
    defineField({ name: 'pros', title: 'Fordele', type: 'array', group: 'review', of: [{ type: 'string' }] }),
    defineField({ name: 'cons', title: 'Ulemper', type: 'array', group: 'review', of: [{ type: 'string' }] }),
    defineField({
      name: 'reviewBody', title: 'Anmeldelsestekst', type: 'array', group: 'review',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: 'Fed', value: 'strong' },
              { title: 'Kursiv', value: 'em' },
            ],
            annotations: [
              {
                name: 'link', type: 'object', title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                  { name: 'blank', type: 'boolean', title: 'Åbn i nyt vindue' },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'sortOrder', title: 'Sorteringsrækkefølge', type: 'number', group: 'info',
      description: 'Lavere tal = vises først (til manuel rækkefølge, ikke prissortering)',
    }),
    defineField({ name: 'metaTitle', title: 'Meta titel', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta beskrivelse', type: 'text', rows: 3, group: 'seo' }),
    defineField({
      name: 'featuredImage', title: 'OG-billede', type: 'image', group: 'seo',
      description: 'Billede der vises når siden deles på sociale medier',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string', description: 'Beskriv billedet for søgemaskiner og skærmlæsere' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'shortDescription', media: 'logo' },
  },
})
