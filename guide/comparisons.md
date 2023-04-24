---
title: Comparações com Outros Executores de Teste | Guia
---

# Comparações com Outros Executores de Teste {#comparisons-with-other-test-runners}

## Jest {#jest}

A [Jest](https://jestjs.io/) apoderou-se do espaço de Abstração de Testagem fornecendo suporte fora da caixa para a maioria dos projetos de JavaScript, uma API confortável (`it` e `expect`), e o pacote completo de funcionalidades de testagem que a maioria das configurações exigiriam (fotografias, simulações, cobertura).

Nós somos gratos a equipa e comunidade da Jest pela criação de uma deliciosa API de testagem e por empurrar para frente muitos padrões de testagem que agora são um padrão no ecossistema da Web. É possível a Jest em configurações de Vite. [@sodatea](https://twitter.com/haoqunjiang) está a construir a [vite-jest](https://github.com/sodatea/vite-jest#readme), que tem por objetivo fornecer integração de Vite de primeira classe para [Jest](https://jestjs.io/).

Os últimos [bloqueios na Jest](https://github.com/sodatea/vite-jest/blob/main/packages/vite-jest/README.md#vite-jest) têm sido solucionados assim esta é uma opção válida para os teus testes unitários. No entanto, num mundo onde temos a [Vite](https://pt.vitejs.dev) fornecendo suporte para a maioria do ferramental de Web (TypeScript, JSX, abstrações de interface de utilizador mais populares), a Jest representa uma duplicação de complexidade.

Se a tua aplicação é alimentada pela Vite, ter duas condutas diferentes para configurar e manter não é justificável. Com a Vitest defines a configuração para os teus ambientes de desenvolvimento, construção e teste como uma única conduta, partilhando as mesmas extensões e o mesmo `vite.config.ts`.

Mesmo se a tua biblioteca não estiver a usar a Vite (por exemplo, se é construída com a `esbuild` ou `rollup`), a Vitest é uma opção interessante visto que entrega-te uma execução mais rápida para os teus testes unitários e um salto na experiência de programação graças ao modo de observação padrão usando a substituição de módulo instantânea (HMR). A Vitest oferece compatibilidade com a maior parte da API da Jest e bibliotecas do ecossistema, assim na maioria dos projetos, deve ser um substituto para Jest.

## Cypress {#cypress}

A [Cypress](https://www.cypress.io/) é um executor de teste baseada no navegador e uma ferramenta complementar a Vitest. Se gostarias de usar a Cypress, sugerimos usar a Vitest para toda lógica desgovernada na tua aplicação e a Cypress para toda lógica baseada no navegador.

A Cypress é conhecida como uma ferramenta de testagem de ponta-a-ponta, no entanto o seu [novo executor de teste de componente](https://on.cypress.io/component) tem excelente suporte para testagem de componentes de Vite e é uma escolha ideal para testar qualquer coisa que desenha num navegador.

Os executores baseados no navegador, como a Cypress, WebdriverIO e Web Test Runner, capturarão os problemas que a Vitest não pode porque usam um navegador e APIs de navegador de verdade.

O condutor de teste da Cypress está focada em determinar se os elementos estão visíveis, acessíveis, e interativos. A Cypress é construída de propósito para o desenvolvimento da interface de utilizador e testagem e sua experiência de programação está centrada em torno da condução de teste para os teus componentes visuais. Tu vês o teu componente desenhado ao lado do repórter de teste. Uma vez que o teste estiver concluído, o componente continua interativo e podes depurar quaisquer falhas que ocorrem usando as tuas ferramentas de programação do navegador.

Em contraste, a Vitest está focada em entregar a melhor experiência de programação possível para testagem *desgovernada* rápida como relâmpago. Os executores baseados na Node como a Vitest suportam vários ambientes de navegadores implementados parcialmente, como a `jsdom` ou `happy-dom`, que implementa o suficiente para que possas rapidamente testar a unidade de qualquer código que faz referência as APIs do navegador.

O compromisso é que estes ambientes de navegador têm limitações no que podem implementar. Por exemplo, na [`jsdom` está em falta um número de funcionalidades](https://github.com/jsdom/jsdom/issues?q=is%3Aissue+is%3Aopen+sort%3Acomments-desc) como `window.navigation` ou um motor de disposição (`offsetTop`, etc).

Por fim, em contraste ao Web Test Runner, o executor de teste da Cypress é mais como um ambiente de desenvolvimento integrado do que um executor de teste porque também podes ver um componente de verdade desenhado no navegador, juntamente com os seus resultados de teste e registos.

A Cypress também tem estado a [integrar com Vite nos seus produtos](https://www.youtube.com/watch?v=7S5cbY8iYLk): reconstruindo suas interface de utilizador da aplicação usando a [Vitesse](https://github.com/antfu/vitesse) e usando a Vitest para testarem o desenvolvimento dos seus projetos.

Nós acreditamos que a Cypress não é uma opção para testagem unitária de código desgovernada, mas que usar a Cypress (para testagem ponta-a-ponta e componente) e Vitest (para testes unitários) cobriria as necessidades de testes da tua aplicação.

## WebdriverIO {#webdriverio}

A [WebdriverIO](https://webdriver.io/) parecida com a Cypress uma alternativa baseada no navegador de executor de teste e uma ferramenta complementar a Vitest. Ela também pode ser usada como ferramenta de testagem ponta-a-ponta para testar [componentes de web](https://webdriver.io/docs/component-testing). Ela ainda usa componentes de Vitest nos bastidores, por exemplo para [simulação e marcação](https://webdriver.io/docs/component-testing/mocks-and-spies) dentro dos testes de componente.

A WebdriverIO vem com as mesmas vantagens que a Cypress permitindo-te testar a tua lógica num navegador de verdade. No entanto usa exatamente os [padrões de web](https://w3c.github.io/webdriver/) para automatização o que supera alguns dos compromissos e limitação quando executas testes na Cypress. Além disto permite-te também executar os testes sobre os dispositivos móveis, dando-te acesso para testar a tua aplicação em mais ambientes ainda.

## Web Test Runner {#web-test-runner}

A [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) executa os testes dentro de um navegador desgovernado, fornecendo o mesmo ambiente de execução que a tua aplicação de web sem a necessidade de simular APIs de navegador ou o DOM.

Isto também torna possível depurar dentro de uma navegador de verdade usando as ferramentas de programação, embora não exista interface de utilizador exibida para andar através do teste, como existe nos testes da Cypress. Existe um modo de observação, mas não é tão inteligente quanto a da Vitest, e talvez nem sempre execute novamente os testes que quiseres.

Para usares a [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) com um projeto de Vite, use a [@remcovaes/web-test-runner-vite-plugin](https://github.com/remcovaes/web-test-runner-vite-plugin). A [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) não inclui asserções ou bibliotecas de simulação, assim é tua responsabilidade adicioná-las.

## uvu {#uvu}

A [uvu](https://github.com/lukeed/uvu) é um executor de teste para Node.js e o navegador. Ela executa os testes numa única linha de processamento, assim os testes não são isolados e podem vazar através dos ficheiros. A Vitest, no entanto, usa linhas de processamentos de operário para isolar os testes e executá-os em paralelo. Para transformar o teu código, a [uvu](https://github.com/lukeed/uvu) depende dos gatilhos de exigência e carregador. A Vitest usa a [Vite](https://pt.vitejs.dev), assim os ficheiros são transformados com o poder total do sistema de extensão da Vite.

Num mundo onde temos a [Vite](https://pt.vitejs.dev) fornecendo suporte para a maioria do ferramental de Web (TypeScript, JSX, abstrações de interface de utilizador mais populares), a uvu representa uma duplicação de complexidade. Se a tua aplicação for alimentada pela Vite, ter duas condutas diferentes para configurar e manter não é justificável.

Com a Vitest defines a configuração para os teus ambientes de desenvolvimento, construção e teste como uma única conduta, partilhando as mesmas extensões e o mesmo `vite.config.ts`. A uvu não fornece um modo de observação inteligente para executar novamente os testes mudados, mas a Vitest dá-te uma incrível experiência de programação graças ao modo de observação padrão usando a substituição de módulo instantânea da Vite (HMR). A uvu é uma opção rápida para execução de testes simples, mas a Vitest pode ser mais rápida e mais fiável para testes e projetos mais complexos.
