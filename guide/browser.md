---
title: Modo de Navegador | Guia
---

# Modo de Navegador <sup><code>experimental</code></sup> {#browser-mode-experimental}

Esta página fornece informação sobre a funcionalidade de mode de navegador experimental na API da Vitest, o qual permite-te executar os teus testes no navegador de maneira nativa, fornecendo acesso aos globais do navegador como `window` e `document`. Esta funcionalidade está atualmente sob desenvolvimento, e as APIs podem mudar no futuro.

## Motivação {#motivation}

Nós desenvolvemos a funcionalidade de mode de navegador da Vitest para ajudar a melhorar os fluxos de trabalho de testagem e alcançar resultados de teste mais fiáveis e precisos. Esta adição experimental à nossa API de testagem permite os programadores executarem testes num ambiente de navegador nativo. Nesta seção, exploraremos as motivações por trás desta funcionalidades e seus benefícios para testagem.

### Diferentes Maneiras de Testar {#different-ways-of-testing}

Existem diferentes maneiras de testar código de JavaScript. Algumas abstrações de testagem simulam ambientes de navegador na Node.js, enquanto outras executam os testes em navegadores verdadeiros. Neste contexto, a [`jsdom`](https://www.npmjs.com/package/jsdom) é um exemplo de uma implementação de especificação que simula um ambiente de navegador sendo usada com um executor de teste como a Jest ou Vitest, enquanto outras ferramentas de testagem tais como [WebdriverIO](https://webdriver.io/) ou [Cypress](https://www.cypress.io/) permitem os programadores testarem suas aplicações num navegador de verdade ou no caso da [Playwright](https://playwright.dev/) que fornece-te um motor de navegador.

### A Advertência de Simulação {#the-simulation-caveat}

Testar programas de JavaScript em ambientes simulados tais como `jsdom` ou `happy-dom` têm simplificado a configuração de teste e fornecido uma API fácil de se usar, tornando-os adequados para muitos projetos e aumentando a confiança nos resultados do teste. No entanto, é crucial manter em mente que estas ferramentas apenas simulam um ambiente de navegador e não um navegador de fato, o que pode resultar em algumas divergências entre o ambiente simulado e o ambiente real. Portanto, falsos positivos ou negativos nos resultados do teste podem ocorrer.

Para alcançar o mais alto nível de confiança nos nossos testes, é crucial testar num ambiente de navegador verdadeiro. É por isto que desenvolvemos a funcionalidade de modo de navegador na Vitest, permitindo os programadores executar os testes de maneira nativa num navegador e ganharem resultados de teste mais fiáveis de precisos. Com a testagem a nível do navegador, os programadores podem estar mais confiantes de que sua aplicação funcionará como pretendida num cenário do mundo real.

## Desvantagens {#drawbacks}

Quando usares o navegador da Vitest, é importante considerar as seguintes desvantagens:

### Desenvolvimento Prematuro {#early-development}

A funcionalidade de modo de navegador da Vitest continua em seus primeiros estágios de desenvolvimento. Como tal, talvez nao esteja completamente otimizada, e talvez existam alguns erros de programação ou problemas que ainda não foram resolvidos. É recomendado que os utilizadores aumentem a sua experiência do navegador de Vitest com uma executor de teste no lado do navegador isolado como a WebdriverIO, Cypress ou Playwright.

### Inicialização Mais Longa {#longer-initialization}

O navegador da Vitest precisa de girar o provedor e o navegador durante o processo de inicialização, o que pode demorar algum tempo. Isto pode resultar em tempos de inicialização mais longo comparado aos outros padrões de testagem.

## Configuração {#configuration}

Para ativares o modo de navegador na tua configuração de Vitest, podes usar a opção `--browser` ou definir o campo `browser.enabled` para `true` no teu ficheiro de configuração da Vitest. Aqui está uma configuração de exemplo usando o campo `browser`:

```ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chrome', // o nome do navegador é obrigatório
  }
})
```

## Tipos de Opção de Navegador: {#browser-option-types}

A opção de navegador na Vitest depende do provedor. A Vitest falhará, se passares `--browser` e não especificares o seu nome no ficheiro de configuração. Opções disponíveis:

- `webdriverio` (padrão) suporta estes navegadores:
  - `firefox`
  - `chrome`
  - `edge`
  - `safari`

- `playwright` suporta estes navegadores:
  - `firefox`
  - `webkit`
  - `chromium`

## Testagem de Navegador Cruzada: {#cross-browser-testing}

Quando especificas um nome de navegador na opção de navegador, a Vitest tentará executar o navegador especificados usando a [WebdriverIO](https://webdriver.io/) por padrão, e depois executar os testes lá. Esta funcionalidade torna a testagem de navegador cruzada fácil de usar e configurar em ambientes como uma integração continua. Se não quiseres usar a WebdriverIO, podes configurar o provedor de navegador personalizado usando a opção `browser.provider`.

Para especificares um navegador usando a interface da linha de comando, use a opção `--browser` seguida pelo nome do navegador, como esta:

```sh
npx vitest --browser=chrome
```

Ou podes fornecer as opções de navegador para a linha de comando com a notação de ponto:

```sh
npx vitest --browser.name=chrome --browser.headless
```

:::tip NOTA
Quando usares a opção de navegador Safari com a WebdriverIO, o `safaridriver` precisa ser ativado executando `sudo safaridriver --enable` no teu dispositivo.

Adicionalmente, quando executares os teus testes, a Vitest tentará instalar alguns condutores para compatibilidade com o `safaridriver`.
:::

## Desgovernado {#headless}

O modo desgovernado é uma outra opção disponível no modo de navegador. No modo desgovernado, o navegador executa no último plano sem uma interface de utilizador, o que o torna útil para execução de testes automatizados. A opção desgovernada na Vitest pode ser definida para um valor booleano para ativar ou desativar o modo desgovernado.

Cá está um exemplo de configuração ativando o modo desgovernado:

```ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
    },
  }
})
```

Tu podes também definir o modo desgovernado usando a opção `--browser.headless` na interface da linha de comando, como esta:

```sh
npx vitest --browser.name=chrome --browser.headless
```

Neste caso, a Vitest executará no modo desgovernado usando o navegador Chrome.

## Limitações {#limitations}

### Diálogos Que Bloqueiam a Linha de Processamento {#thread-blocking-dialogs}

Quando usares o navegador da Vitest, é importante notar que diálogos que bloqueiam a linha de processamento como `alert` ou `confirm` não podem ser usados de maneira nativa. Isto porque bloqueiam a página, o que significa que a Vitest não pode continuar a comunicar com a página, levando a execução a pendurar.

Em tais situações, a Vitest fornece simulações padrão com valores retornados padrão para estas APIs. Isto garante que se o utilizador usar acidentalmente APIs de Web de aparecimentos síncronos, a execução não seria pendurada. No entanto, ainda é recomendado ao utilizador simular estas APIs de Web por melhor experiência. Leia mais em [Simulação](/guide/mocking).
