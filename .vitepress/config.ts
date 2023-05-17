import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { version } from '../package.json'
import {
  contributing,
  discord,
  font,
  github,
  mastodon,
  ogImage,
  ogUrl,
  releases,
  twitter,
  vitestDescription, vitestName,
} from './meta'
import { pwa } from './scripts/pwa'
import { transformHead } from './scripts/transformHead'
import { teamMembers } from './contributors'

export default withPwa(defineConfig({
  lang: 'pt',
  title: vitestName,
  description: vitestDescription,
  locales: {
    root: {
      lang: 'pt',
      label: 'Português',
    },
    en: {
      lang: 'en',
      label: 'English',
      link: 'https://vitest.dev/',
    },
    zh: {
      lang: 'zh',
      label: '简体中文',
      link: 'https://cn.vitest.dev/',
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#729b1a' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico', type: 'image/png', sizes: '16x16' }],
    ['meta', { name: 'author', content: `${teamMembers.map(c => c.name).join(', ')} and ${vitestName} contributors` }],
    ['meta', { name: 'keywords', content: 'vitest, vite, test, coverage, snapshot, react, vue, preact, svelte, solid, lit, ruby, cypress, puppeteer, jsdom, happy-dom, test-runner, jest, typescript, esm, tinypool, tinyspy, c8, node' }],
    ['meta', { property: 'og:title', content: vitestName }],
    ['meta', { property: 'og:description', content: vitestDescription }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: vitestName }],
    ['meta', { name: 'twitter:description', content: vitestDescription }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'preload', as: 'style', onload: 'this.onload=null;this.rel=\'stylesheet\'', href: font }],
    ['noscript', {}, `<link rel="stylesheet" crossorigin="anonymous" href="${font}" />`],
    ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#ffffff' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
  ],
  lastUpdated: true,
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },
  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/nazarepiedady/vitest-docs-pt/tree/main/docs/:path',
      text: 'Sugerir mudanças para esta página',
    },

    algolia: {
      appId: 'ZTF29HGJ69',
      apiKey: '9c3ced6fed60d2670bb36ab7e8bed8bc',
      indexName: 'vitest',
      // searchParameters: {
      //   facetFilters: ['tags:en'],
      // },
    },

    socialLinks: [
      { icon: 'mastodon', link: mastodon },
      { icon: 'twitter', link: twitter },
      { icon: 'discord', link: discord },
      { icon: 'github', link: github },
    ],

    footer: {
      message: 'Lançada sob a licença MIT',
      copyright: 'Copyright © 2021-PRESENTE Anthony Fu, Matías Capeletto e colaboradores da Vitest',
    },

    nav: [
      { text: 'Guia', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Configuração', link: '/config/' },
      { text: 'Avançado', link: '/advanced/api' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Notas de Lançamentos ',
            link: releases,
          },
          {
            text: 'Contribuições ',
            link: contributing,
          },
        ],
      },
    ],

    sidebar: {
      // TODO: bring sidebar of apis and config back
      '/advanced': [
        {
          text: 'Avançado',
          items: [
            {
              text: 'API de Node da Vitest',
              link: '/advanced/api',
            },
            {
              text: 'API do Executor',
              link: '/advanced/runner',
            },
          ],
        },
      ],
      '/': [
        {
          text: 'Guia',
          items: [
            {
              text: 'Porquê Vitest',
              link: '/guide/why',
            },
            {
              text: 'Começar',
              link: '/guide/',
            },
            {
              text: 'Funcionalidades',
              link: '/guide/features',
            },
            {
              text: 'Interface da Linha de Comando',
              link: '/guide/cli',
            },
            {
              text: 'Filtragem de Teste',
              link: '/guide/filtering',
            },
            {
              text: 'Cobertura',
              link: '/guide/coverage',
            },
            {
              text: 'Fotografia',
              link: '/guide/snapshot',
            },
            {
              text: 'Simulação',
              link: '/guide/mocking',
            },
            {
              text: 'Testando Tipos',
              link: '/guide/testing-types',
            },
            {
              text: 'Interface de Utilizador da Vitest',
              link: '/guide/ui',
            },
            {
              text: 'Modo de Navegador',
              link: '/guide/browser',
            },
            {
              text: 'Testagem Na Fonte',
              link: '/guide/in-source',
            },
            {
              text: 'Contexto de Teste',
              link: '/guide/test-context',
            },
            {
              text: 'Ambiente',
              link: '/guide/environment',
            },
            {
              text: 'Estendendo os Correspondentes',
              link: '/guide/extending-matchers',
            },
            {
              text: 'Integração de IDE',
              link: '/guide/ide',
            },
            {
              text: 'Depuração',
              link: '/guide/debugging',
            },
            {
              text: 'Comparações',
              link: '/guide/comparisons',
            },
            {
              text: 'Guia de Migração',
              link: '/guide/migration',
            },
          ],
        },
        {
          text: 'API',
          items: [
            {
              text: 'Referência da API de Teste',
              link: '/api/',
            },
            {
              text: 'Funções de Simulação',
              link: '/api/mock',
            },
            {
              text: 'Utilitário Vi',
              link: '/api/vi',
            },
            {
              text: 'Expect',
              link: '/api/expect',
            },
            {
              text: 'ExpectTypeOf',
              link: '/api/expect-typeof',
            },
            {
              text: 'assertType',
              link: '/api/assert-type',
            },
          ],
        },
        {
          text: 'Configuração',
          items: [
            {
              text: 'Referência da Configuração',
              link: '/config/',
            },
          ],
        },
      ],
    },
  },
  pwa,
  transformHead,
}))
