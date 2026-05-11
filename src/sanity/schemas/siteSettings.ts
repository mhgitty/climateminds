import { defineField, defineType } from 'sanity'

// ── Shared link fields ─────────────────────────────────────────────────────────
// Pick a page OR an elselskab OR type a custom URL — whichever is set wins.
const linkFields = [
  defineField({ name: 'label', title: 'Tekst', type: 'string', validation: (r) => r.required() }),
  defineField({
    name: 'pageRef',
    title: 'Side (vælg fra CMS)',
    type: 'reference',
    to: [{ type: 'page' }],
    description: 'Vælg en side — URL udfyldes automatisk',
  }),
  defineField({
    name: 'elselskabRef',
    title: 'Elselskab (vælg fra CMS)',
    type: 'reference',
    to: [{ type: 'elselskab' }],
    description: 'Vælg et elselskab — URL udfyldes automatisk',
  }),
  defineField({
    name: 'url',
    title: 'URL (tilpasset / ekstern)',
    type: 'string',
    description: 'Bruges kun hvis du ikke vælger en side eller elselskab ovenfor. F.eks. /blog/ eller https://...',
  }),
]

// ── Top-level nav item ─────────────────────────────────────────────────────────
const navItemFields = [
  ...linkFields,
  defineField({ name: 'isHighlighted', title: 'Fremhævet (CTA-knap)', type: 'boolean', initialValue: false }),
  defineField({
    name: 'children',
    title: 'Undermenu',
    type: 'array',
    description: 'Tilføj underpunkter for at skabe en dropdown-menu',
    of: [{
      type: 'object',
      name: 'subNavItem',
      fields: linkFields,
      preview: {
        select: { title: 'label', pageRef: 'pageRef.slug.current', elselskabRef: 'elselskabRef.ctaSlug.current', url: 'url' },
        prepare({ title, pageRef, elselskabRef, url }: any) {
          return { title, subtitle: pageRef ? `/${pageRef}/` : elselskabRef ? `/elselskaber/${elselskabRef}/` : url }
        },
      },
    }],
  }),
]

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: '⚙️ Sideindstillinger',
  type: 'document',
  groups: [
    { name: 'general', title: '⚙️ Generelt' },
    { name: 'header',  title: '🔝 Header' },
    { name: 'footer',  title: '🔻 Footer' },
  ],
  fields: [
    // ── Default author ──────────────────────────────────────────────────────────
    defineField({
      name: 'defaultAuthor',
      title: 'Standard forfatter',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'general',
      description: 'Vises som forfatter-kort nederst på alle artikler og sider',
    }),

    // ── Header ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'headerNav',
      title: 'Header navigation',
      type: 'array',
      group: 'header',
      description: 'Elementer i topmenuen. Træk for at ændre rækkefølge.',
      of: [{
        type: 'object',
        name: 'navItem',
        fields: navItemFields,
        preview: {
          select: {
            title: 'label',
            isHighlighted: 'isHighlighted',
            pageRef: 'pageRef.slug.current',
            elselskabRef: 'elselskabRef.ctaSlug.current',
            url: 'url',
            children: 'children',
          },
          prepare({ title, isHighlighted, pageRef, elselskabRef, url, children }: any) {
            const resolvedUrl = pageRef ? `/${pageRef}/` : elselskabRef ? `/elselskaber/${elselskabRef}/` : url
            const hasChildren = (children?.length ?? 0) > 0
            return {
              title: `${isHighlighted ? '⚡ ' : ''}${hasChildren ? '▾ ' : ''}${title}`,
              subtitle: resolvedUrl,
            }
          },
        },
      }],
    }),

    // ── Footer ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'footerTagline',
      title: 'Footer tagline',
      type: 'text',
      rows: 2,
      group: 'footer',
      initialValue: 'Danmarks uafhængige guide til billig og grøn el. Vi sammenligner de bedste elselskaber.',
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer kolonner',
      type: 'array',
      group: 'footer',
      description: 'Op til 2 kolonner med links.',
      validation: (r) => r.max(2),
      of: [{
        type: 'object',
        name: 'footerColumn',
        fields: [
          defineField({ name: 'title', title: 'Kolonnetitel', type: 'string', validation: (r) => r.required() }),
          defineField({
            name: 'items',
            title: 'Links',
            type: 'array',
            of: [{
              type: 'object',
              name: 'footerLink',
              fields: linkFields,
              preview: {
                select: {
                  title: 'label',
                  pageRef: 'pageRef.slug.current',
                  elselskabRef: 'elselskabRef.ctaSlug.current',
                  url: 'url',
                },
                prepare({ title, pageRef, elselskabRef, url }: any) {
                  return { title, subtitle: pageRef ? `/${pageRef}/` : elselskabRef ? `/elselskaber/${elselskabRef}/` : url }
                },
              },
            }],
          }),
        ],
        preview: {
          select: { title: 'title', items: 'items' },
          prepare({ title, items }: any) {
            return { title, subtitle: `${(items || []).length} links` }
          },
        },
      }],
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer bundtekst (venstre)',
      type: 'string',
      group: 'footer',
      initialValue: '© 2025 Climateminds.dk · Danmarks uafhængige elguide',
    }),
    defineField({
      name: 'footerDisclaimer',
      title: 'Footer bundtekst (højre)',
      type: 'string',
      group: 'footer',
      initialValue: 'Priser opdateres månedligt fra energidataservice.dk',
    }),
  ],
  preview: {
    prepare() { return { title: 'Sideindstillinger' } },
  },
})
