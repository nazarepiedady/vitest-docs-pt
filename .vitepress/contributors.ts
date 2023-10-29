import type { DefaultTheme } from 'vitepress'
import contributorNames from './contributor-names.json'

export interface Contributor {
  name: string
  avatar: string
}

export interface CoreTeam extends DefaultTheme.TeamMember {
  // required to download avatars from GitHub
  github: string
  twitter?: string
  mastodon?: string
  discord?: string
  youtube?: string
}

const contributorsAvatars: Record<string, string> = {}

function getAvatarUrl(name: string) {
  return import.meta.hot ? `https://github.com/${name}.png` : `/user-avatars/${name}.png`
}

export const contributors = (contributorNames).reduce<Contributor[]>((acc, name) => {
  contributorsAvatars[name] = getAvatarUrl(name)
  acc.push({ name, avatar: contributorsAvatars[name] })
  return acc
}, [])

function createLinks(tm: CoreTeam): CoreTeam {
  tm.links = [{ icon: 'github', link: `https://github.com/${tm.github}` }]
  if (tm.mastodon)
    tm.links.push({ icon: 'mastodon', link: tm.mastodon })

  if (tm.discord)
    tm.links.push({ icon: 'discord', link: tm.discord })

  if (tm.youtube)
    tm.links.push({ icon: 'youtube', link: `https://www.youtube.com/@${tm.youtube}` })

  if (tm.twitter)
    tm.links.push({ icon: 'twitter', link: `https://twitter.com/${tm.twitter}` })

  return tm
}

const plainTeamMembers: CoreTeam[] = [
  {
    avatar: contributorsAvatars.antfu,
    name: 'Anthony Fu',
    github: 'antfu',
    mastodon: 'https://elk.zone/m.webtoo.ls/@antfu',
    twitter: 'antfu7',
    discord: 'https://chat.antfu.me',
    youtube: 'antfu',
    sponsor: 'https://github.com/sponsors/antfu',
    title: 'Um Programador Fanático Por Código-Aberto, Trabalhando',
    org: 'NuxtLabs',
    orgLink: 'https://nuxtlabs.com/',
    desc: 'Membro da Equipa Principal da Vue e Vite.',
  },
  {
    avatar: contributorsAvatars['sheremet-va'],
    name: 'Vladimir',
    github: 'sheremet-va',
    mastodon: 'https://elk.zone/m.webtoo.ls/@sheremet_va',
    twitter: 'sheremet_va',
    sponsor: 'https://github.com/sponsors/sheremet-va',
    title: 'Um Programador de Código-Aberto',
    desc: 'Membro da Equipa Principal da Vitest',
  },
  {
    avatar: contributorsAvatars['patak-dev'],
    name: 'Patak',
    github: 'patak-dev',
    mastodon: 'https://elk.zone/m.webtoo.ls/@patak',
    twitter: 'patak_dev',
    sponsor: 'https://github.com/sponsors/patak-dev',
    title: 'Um Ser Colaborativo, Trabalhando',
    org: 'StackBlitz',
    orgLink: 'https://stackblitz.com/',
    desc: 'Membro da Equipa Principal da Vite e Vue.',
  },
  {
    avatar: contributorsAvatars.Aslemammad,
    name: 'Mohammad Bagher',
    github: 'Aslemammad',
    mastodon: 'https://elk.zone/m.webtoo.ls/@aslemammad',
    twitter: 'asleMammadam',
    title: 'An open source developer',
    desc: 'Team member of Poimandres & Vike',
  },
  {
    avatar: contributorsAvatars.Demivan,
    name: 'Ivan Demchuk',
    github: 'Demivan',
    mastodon: 'https://elk.zone/fosstodon.org/@demivan',
    title: 'Um Lider Tecnológico, Programador',
    desc: 'Autor do fluent-vue',
  },
  {
    avatar: contributorsAvatars.userquin,
    name: 'Joaquín Sánchez',
    github: 'userquin',
    mastodon: 'https://elk.zone/m.webtoo.ls/@userquin',
    twitter: 'userquin',
    title: 'Um Programador Completo e de Android',
    desc: 'Seguidor Fanático da Vite',
  },
  {
    avatar: contributorsAvatars.zxch3n,
    name: 'Zixuan Chen',
    github: 'zxch3n',
    mastodon: 'https://elk.zone/hachyderm.io/@zx',
    twitter: 'zxch3n',
    title: 'Um Programador',
    desc: 'Trabalhando na CRDTs & Software de Prioridade Local',
  },
  {
    avatar: contributorsAvatars.poyoho,
    name: 'Yoho Po',
    github: 'poyoho',
    twitter: '@yoho_po',
    title: 'Não Existe Problema no Meu Local',
    desc: 'Membro da Equipa Principal da Vite e Membro da Equipa da Vitest',
  },
]

const teamMembers = plainTeamMembers.map(tm => createLinks(tm))

export { teamMembers }
