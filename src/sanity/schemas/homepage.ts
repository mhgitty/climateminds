import { defineField, defineType } from 'sanity'
import { bodyField } from './page'

export const homepageType = defineType({
  name: 'homepage',
  title: '🏠 Forside',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'content', title: 'Indhold' },
    { name: 'howitworks', title: 'Sådan beregner vi' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Hero
    defineField({
      name: 'heroHeading',
      title: 'Hero overskrift',
      type: 'string',
      group: 'hero',
      description: 'Brug [grøn]tekst[/grøn] til at fremhæve tekst i grønt',
      initialValue: 'Find den billigste el i Danmark',
    }),
    defineField({
      name: 'heroGreenText',
      title: 'Grøn del af overskriften',
      type: 'string',
      group: 'hero',
      description: 'Denne del vises med grøn farve på en ny linje under overskriften',
      initialValue: 'i Danmark',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'Kort tekst der vises under overskriften i hero-sektionen',
      initialValue: 'Vi beregner den reelle pris pr. kWh for alle store elselskaber baseret på den aktuelle spotpris. Juster dit forbrug og find det tilbud, der passer til dig.',
    }),

    // How it works
    defineField({
      name: 'howItWorksTitle',
      title: '"Sådan beregner vi" overskrift',
      type: 'string',
      group: 'howitworks',
      initialValue: 'Sådan beregner vi prisen',
    }),
    defineField({
      name: 'showHowItWorks',
      title: 'Vis "Sådan beregner vi prisen"',
      type: 'boolean',
      group: 'howitworks',
      initialValue: true,
    }),
    defineField({
      name: 'howItWorksItems',
      title: 'Punkter',
      type: 'array',
      group: 'howitworks',
      of: [{
        type: 'object',
        name: 'howItem',
        fields: [
          { name: 'icon', title: 'Ikon (emoji)', type: 'string' },
          { name: 'title', title: 'Titel', type: 'string' },
          { name: 'description', title: 'Beskrivelse', type: 'text', rows: 2 },
        ],
        preview: { select: { title: 'title', subtitle: 'icon' } },
      }],
      initialValue: [
        { _type: 'howItem', icon: '⚡', title: 'Rå spotpris', description: 'Gennemsnittet for seneste måned fra energidataservice.dk — opdateres automatisk.' },
        { _type: 'howItem', icon: '📋', title: '+ Elselskabets tillæg', description: 'Hvert selskabs kWh-tillæg og abonnement omregnet til kr. pr. kWh.' },
        { _type: 'howItem', icon: '🔌', title: '+ Faste afgifter', description: 'Netselskab (N1 eller Radius), Energinet-tarif og statens afgifter.' },
      ],
    }),

    // Body content (renders below the comparison table)
    { ...bodyField, group: 'content' } as any,

    // SEO
    defineField({ name: 'metaTitle', title: 'Meta titel', type: 'string', group: 'seo', initialValue: 'Sammenlign elselskaber — find den billigste el i Danmark' }),
    defineField({ name: 'metaDescription', title: 'Meta beskrivelse', type: 'text', rows: 3, group: 'seo', initialValue: 'Sammenlign priser fra alle store danske elselskaber baseret på den aktuelle spotpris. Opdateret månedligt fra energidataservice.dk.' }),
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
    select: { title: 'heroHeading' },
    prepare({ title }) {
      return { title: title || 'Forside' }
    },
  },
})
