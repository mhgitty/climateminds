import { defineField, defineType } from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Sideindstillinger',
  type: 'document',
  groups: [
    { name: 'general', title: 'Generelt' },
    { name: 'footer', title: 'Footer' },
    { name: 'social', title: 'Sociale medier' },
  ],
  fields: [
    // ─── Generelt ────────────────────────────────────────────────────────────
    defineField({
      name: 'siteName',
      title: 'Sitenavn',
      type: 'string',
      group: 'general',
      description: 'Bruges i browser-titel og strukturerede data',
    }),
    defineField({
      name: 'siteDescription',
      title: 'Standard beskrivelse',
      type: 'text',
      rows: 3,
      group: 'general',
      description: 'Fallback meta-beskrivelse hvis en side ikke har sin egen',
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Standard OG-billede',
      type: 'image',
      group: 'general',
      description: 'Bruges når en side ikke har sit eget OG-billede',
      options: { hotspot: true },
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'general',
      options: { hotspot: false },
    }),
    defineField({
      name: 'email',
      title: 'Kontakt e-mail',
      type: 'string',
      group: 'general',
    }),

    // ─── Footer ──────────────────────────────────────────────────────────────
    defineField({
      name: 'footerText',
      title: 'Footer tekst',
      type: 'text',
      rows: 3,
      group: 'footer',
      description: 'Kort tekst der vises i bunden af footer',
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer links',
      type: 'array',
      group: 'footer',
      of: [{
        type: 'object',
        name: 'footerLink',
        fields: [
          { name: 'label', title: 'Tekst', type: 'string' },
          { name: 'href', title: 'URL', type: 'string', description: 'F.eks. /om-os eller https://...' },
        ],
        preview: {
          select: { title: 'label', subtitle: 'href' },
        },
      }],
    }),
    defineField({
      name: 'footerDisclaimer',
      title: 'Disclaimer / Copyright',
      type: 'string',
      group: 'footer',
      description: 'F.eks. "© 2025 Climateminds.dk — Uafhængig guide til billig el"',
    }),

    // ─── Sociale medier ──────────────────────────────────────────────────────
    defineField({
      name: 'facebook',
      title: 'Facebook URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'x',
      title: 'X (Twitter) URL',
      type: 'url',
      group: 'social',
    }),
  ],
  preview: {
    select: { title: 'siteName' },
    prepare({ title }: any) {
      return { title: title || 'Sideindstillinger' }
    },
  },
})
