import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  async redirects() {
    return [
      // Old WordPress paths → root
      {
        source: '/ressourcerum/energiproduktion/fossile-braendsler/roeggasrensning',
        destination: '/',
        permanent: true,
      },
      {
        source: '/klimamodeller',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ressourcerum/klimaforstaaelse/klimamodeller',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ressourcerum/klimaforstaaelse/drivhuseffekten',
        destination: '/',
        permanent: true,
      },
      {
        source: '/science-con-sensus/forsoeg-og-cases/transport/produktion-af-brint-elektrolyse',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ressourcerum/klimaforstaaelse/drivhusgasser',
        destination: '/',
        permanent: true,
      },
      {
        source: '/energieffektivitet-vejen-til-en-groennere-fremtid',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ressourcerum/energieffektivitet/kunstgoedning-ammoniak',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ressourcerum/transport/katalysator',
        destination: '/',
        permanent: true,
      },
      {
        source: '/kulstofkredsloebet',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ressourcerum/energiproduktion/kernekraft',
        destination: '/',
        permanent: true,
      },
      {
        source: '/klimaforandringer',
        destination: '/',
        permanent: true,
      },
      {
        source: '/drivhuseffekten',
        destination: '/',
        permanent: true,
      },
      {
        source: '/konsekvenser',
        destination: '/',
        permanent: true,
      },
      {
        source: '/klima-definition',
        destination: '/',
        permanent: true,
      },
      {
        source: '/2022/10/26/saadan-kan-du-nemt-spare-paa-energien-i-hjemmet',
        destination: '/',
        permanent: true,
      },
      {
        source: '/2025/05/17/baeredygtig-jagt-og-friluftsliv-i-balance-med-naturen',
        destination: '/',
        permanent: true,
      },
      {
        source: '/2022/04/07/jordforbedring-5-maader-at-forbedre-jorden-paa-derhjemme',
        destination: '/',
        permanent: true,
      },
      {
        source: '/2023/11/22/saadan-forbliver-byggepladsen-baeredygtig-betydningen-af-overvejelser',
        destination: '/',
        permanent: true,
      },
      {
        source: '/2023/04/25/optimer-dit-elforbrug-med-disse-tips',
        destination: '/',
        permanent: true,
      },
      {
        source: '/bedre-og-mere-klimavenlig-energiudnyttelse-i-din-bolig',
        destination: '/',
        permanent: true,
      },
      {
        source: '/energiproduktion-hvad-goer-det-ved-vores-klima',
        destination: '/',
        permanent: true,
      },
      // Catch all ?id= query string URLs (old WordPress index.php)
      {
        source: '/index.php',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
