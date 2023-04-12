---
title: Começar | Guia
---

# Começar {#getting-started}

## Visão de Conjunto {#overview}

A Vitest é uma abstração de teste unitário extremamente rápido alimentado pela Vite.

Tu podes aprender mais sobre o fundamento lógico por trás do projeto na seção [Porquê Vitest](/guide/why).

## Experimentando a Vitest Online {#trying-vitest-online}

Tu podes experimentar a Vitest online na [StackBlitz](https://vitest.new). Ela executa a Vitest diretamente no navegador, e é quase idêntico à configuração local mas não exige a instalação de nada na tua máquina.

## Adicionando a Vitest ao teu Projeto {#adding-vitest-to-your-project}

<CourseLink href="https://vueschool.io/lessons/how-to-install-vitest?friend=vueuse">Saiba como instalar com Vídeo</CourseLink>

Com o npm:

```bash
npm install -D vitest
```
ou com yarn:

```bash
yarn add -D vitest
```
ou com pnpm:

```bash
pnpm add -D vitest
```

:::tip
A Vitest exige a Vite >= v3.0.0 e Node >= v14.
:::

É recomendado que instales uma cópia de `vitest` no teu `package.json`, usando dos métodos listados acima. No entanto, se preferirias executar `vitest` diretamente, podes usar `npx vitest` (o comando `npx` vem com o npm e a Node.js).

O comando `npx` executará o comando a partir de um `node_modules/.bin` local instalando quaisquer pacotes necessários para executar o comando. Por padrão, `npx` verificará se o comando existe no `PATH`, ou no binários do projeto local, e executa-o. Se o comando não for encontrado, será instalado antes da execução.

## Configurando a Vitest {#configuring-vitest}

Uma das principais vantagens da Vitest é a sua configuração unificada com a Vite. Se presente, `vitest` lerá o teu `vite.config.ts` de raiz para condizer com as extensões e configuração de acordo com a tua aplicação de Vite. Por exemplo, a tua configuração de [`resolve.alias`](/config/#resolve-alias) e [extensões](/guide/using-plugins) funcionará fora da caixa. Se quiseres uma configuração diferente durante a testagem, podes:

- Criar o `vitest.config.ts`, o qual terá a prioridade mais alta.
- Passar a opção `--config` para interface da linha de comando, por exemplo `vitest --config ./path/to/vitest.config.ts`
- Usar a propriedade `process.env.VITEST` ou `mode` na `defineConfig` (será definida para `test` se for sobreposta) para aplicar condicionalmente configuração diferente no `vite.config.ts`

Para configurares a própria `vitest`, adicione a propriedade `test` na tua configuração de Vite. Também precisarás de adicionar uma referência aos tipos de Vitest usando um [comando de tríplice barra](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-) no inicio do teu ficheiro de configuração, se estiveres a importar `defineConfig` a partir da própria `vite`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ...
  },
})
```

Consulte a lista de opções de configuração na [Referência de Configuração](/config/).

## Interface da Linha de Comando {#command-line-interface}

Num projeto onde a Vitest estivesse instalada, podes usar o binário `vitest` nos teus programas de npm, ou executá-la diretamente com o `npx vitest`. Aqui estão os programas de npm padrão num projeto de Vitest estruturado:

<!-- prettier-ignore -->
```json
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

Para executar os testes uma vez sem observar as mudanças de ficheiro, use `vitest run`. Tu podes especificar opções de interface da linha de comando adicionais como `--port` ou `--https`. Para uma lista completa de opções de interface da linha de comando, execute `npx vitest --help` no teu projeto.

Saiba mais sobre a [Interface da Linha de Comando](/guide/cli)

## Integrações da IDE {#ide-integrations}

Nós também fornecemos uma extensão oficial para o Visual Studio Code para melhorar a tua experiência de testagem com a Vitest.

[Instalar a partir do Mercado da VS Code](https://marketplace.visualstudio.com/items?itemName=ZixuanChen.vitest-explorer).

Saiba mais sobre as [Integrações de IDE](/guide/ide).

## Exemplos {#examples}

| Exemplo | Código-fonte | Zona de Testes |
|---|---|---|
| `basic` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/basic) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/basic?initialPath=__vitest__) |
| `fastify` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/fastify) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/fastify?initialPath=__vitest__) |
| `graphql` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/graphql) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/graphql?initialPath=__vitest__) |
| `image-snapshot` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/image-snapshot) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/image-snapshot?initialPath=__vitest__) |
| `lit` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/lit) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/lit?initialPath=__vitest__) |
| `mocks` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/mocks) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/mocks?initialPath=__vitest__) |
| `nextjs` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/nextjs) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/nextjs?initialPath=__vitest__) |
| `playwright` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/playwright) | |
| `puppeteer` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/puppeteer) | |
| `react-enzyme` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/react-enzyme) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/react-enzyme?initialPath=__vitest__) |
| `react-mui` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/react-mui) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/react-mui?initialPath=__vitest__) |
| `react-storybook` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/react-storybook) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/react-storybook?initialPath=__vitest__) |
| `react-testing-lib-msw` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/react-testing-lib-msw) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/react-testing-lib-msw?initialPath=__vitest__) |
| `react-testing-lib` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/react-testing-lib) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/react-testing-lib?initialPath=__vitest__) |
| `react` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/react) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/react?initialPath=__vitest__) |
| `ruby` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/ruby) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/ruby?initialPath=__vitest__) |
| `solid` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/solid) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/solid?initialPath=__vitest__) |
| `svelte` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/svelte) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/svelte?initialPath=__vitest__) |
| `vitesse` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/vitesse) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/vitesse?initialPath=__vitest__) |
| `vue-jsx` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/vue-jsx) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/vue-jsx?initialPath=__vitest__) |
| `vue` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/vue) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/vue?initialPath=__vitest__) |
| `vue2` | [GitHub](https://github.com/vitest-dev/vitest/tree/main/examples/vue2) | [Testar Online](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/vue2?initialPath=__vitest__) |

## Projetos usando a Vitest {#projects-using-vitest}

- [unocss](https://github.com/antfu/unocss)
- [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import)
- [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- [vitesse](https://github.com/antfu/vitesse)
- [vitesse-lite](https://github.com/antfu/vitesse-lite)
- [fluent-vue](https://github.com/demivan/fluent-vue)
- [vueuse](https://github.com/vueuse/vueuse)
- [milkdown](https://github.com/Saul-Mirone/milkdown)
- [gridjs-svelte](https://github.com/iamyuu/gridjs-svelte)
- [spring-easing](https://github.com/okikio/spring-easing)
- [bytemd](https://github.com/bytedance/bytemd)
- [faker](https://github.com/faker-js/faker)
- [million](https://github.com/aidenybai/million)
- [Vitamin](https://github.com/wtchnm/Vitamin)
- [neodrag](https://github.com/PuruVJ/neodrag)
- [svelte-multiselect](https://github.com/janosh/svelte-multiselect)
- [iconify](https://github.com/iconify/iconify)
- [tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next)
- [cz-git](https://github.com/Zhengqbbb/cz-git)

<!--
For contributors:
We no longer accept new entries to this list a this moment.
Thanks for choosing Vitest!
-->

## Usando Consolidações Não Lançadas {#using-unreleased-commits}

Se não puderes esperar por um novo lançamento para testar as funcionalidades mais recentes, precisarás de clonar o [repositório da Vitest](https://github.com/vitest-dev/vitest) para a tua máquina local e depois construir e ligá-lo tu mesmo ([pnpm](https://pnpm.io/) é obrigatório):

```bash
git clone https://github.com/vitest-dev/vitest.git
cd vitest
pnpm install
cd packages/vitest
pnpm run build
pnpm link --global # podes usar o teu gestor de pacote preferido para esta etapa.
```

A seguir ires ao projeto onde estás a usar a Vitest e executar `pnpm link --global vitest` (ou o gestor de pacote que usaste para ligar a `vitest` globalmente).

## Comunidade {#community}

Se tiveres questões ou precisares de ajuda, chame a comunidade na [Discord](https://chat.vitest.dev) e [Discussões de GitHub](https://github.com/vitest-dev/vitest/discussions).
