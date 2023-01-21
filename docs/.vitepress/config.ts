import { defineConfig } from 'vitepress'
import { version } from '../../package.json'
import {
  contributing,
  discord,
  font,
  github,
  ogImage,
  ogUrl,
  releases,
  twitter,
  vitestDescription,
  vitestName,
} from './meta'
import { teamMembers } from './contributors'

export default defineConfig({
  lang: 'pt-PT',
  title: vitestName,
  description: vitestDescription,
  head: [
    ['meta', { name: 'theme-color', content: '#729b1a' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico', type: 'image/png', sizes: '16x16' }],
    ['meta', { name: 'author', content: `${teamMembers.map(c => c.name).join(', ')} e colaboradores da ${vitestName}` }],
    ['meta', { name: 'keywords', content: 'vitest, vite, test, coverage, snapshot, react, vue, preact, svelte, solid, lit, ruby, cypress, puppeteer, jsdom, happy-dom, test-runner, jest, typescript, esm, tinypool, tinyspy, c8, node' }],
    ['meta', { property: 'og:title', content: vitestName }],
    ['meta', { property: 'og:description', content: vitestDescription }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: vitestName }],
    ['meta', { name: 'twitter:description', content: vitestDescription }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { href: font, rel: 'stylesheet' }],
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
      pattern: 'https://github.com/vitest-dev/vitest/tree/main/docs/:path',
      text: 'Sugerir alterações para esta página',
    },

    algolia: {
      appId: 'ZTF29HGJ69',
      apiKey: '9c3ced6fed60d2670bb36ab7e8bed8bc',
      indexName: 'vitest',
      // searchParameters: {
      //   facetFilters: ['tags:en'],
      // },
    },

    localeLinks: {
      text: 'Português',
      items: [
        { text: 'English', link: 'https://vitest.dev' },
        { text: '简体中文', link: 'https://cn.vitest.dev' },
      ],
    },

    socialLinks: [
      { icon: 'twitter', link: twitter },
      { icon: 'discord', link: discord },
      { icon: 'github', link: github },
    ],

    footer: {
      message: 'Lançado sob a licença MIT.',
      copyright: 'Copyright © 2021-PRESENT Anthony Fu, Matías Capeletto e colaboradores da Vitest',
    },

    nav: [
      { text: 'Guia', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Configuração', link: '/config/' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Notas de Lançamento ',
            link: releases,
          },
          {
            text: 'Contribuir ',
            link: contributing,
          },
        ],
      },
    ],

    sidebar: {
      // TODO: bring sidebar of apis and config back
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
              text: 'Imitação',
              link: '/guide/mocking',
            },
            {
              text: 'Tipos de Testagem',
              link: '/guide/testing-types',
            },
            {
              text: 'Interface do Utilizador da Vitest',
              link: '/guide/ui',
            },
            {
              text: 'Testagem do Código-fonte',
              link: '/guide/in-source',
            },
            {
              text: 'Contexto do Teste',
              link: '/guide/test-context',
            },
            {
              text: 'Ambiente',
              link: '/guide/environment',
            },
            {
              text: 'Correspondentes de Extensão',
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
              text: 'Funções de Imitação',
              link: '/api/mock',
            },
            {
              text: 'Utilitário de Vi',
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
})
