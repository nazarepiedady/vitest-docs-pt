<p align="center">
<img src="https://user-images.githubusercontent.com/11247099/145112184-a9ff6727-661c-439d-9ada-963124a281f7.png" height="150">
</p>

<h1 align="center">
Vitest
</h1>

<p align="center">
Uma abstração de teste unitário extremamente rápida alimentada pela Vite.
</p>

<p align="center">
  [![](https://img.shields.io/npm/v/vitest?color=729B1B&label=)](https://www.npmjs.com/package/vitest)
</p>

<p align="center">
[**Envolva-te!**](https://chat.vitest.dev)
</p>

<p align="center">
[Documentação](https://vitest-docs-pt.netlify.app) | [Começar](https://vitest-docs-pt.netlify.app/guide/) | [Exemplos](https://vitest-docs-pt.netlify.app/guide/#examples) | [Porquê Vitest?](https://vitest-docs-pt.netlify.app/guide/why)
</p>

<p align="center">
[English](https://vitest.dev) | [中文文档](https://cn.vitest.dev)
</p>


<h4 align="center">

</h4>
<br>
<br>

## Funcionalidades

- Extensões, solucionadores, transformadores, configurações da [Vite](https://pt.vitejs.dev/). Use a mesma configurações da tua aplicação.
- [Fotografia de Jest](https://jestjs.io/docs/snapshot-testing).
- [Chai](https://www.chaijs.com/) embutido para afirmações, com APIs compatíveis de [`expect` de Jest](https://jestjs.io/docs/expect).
- [Modo de observação inteligente & instantânea](https://vitest-docs-pt.netlify.app/guide/features#watch-mode), como a substituição de módulo instantânea para testes!.
- [Cobertura de código nativa](https://vitest-docs-pt.netlify.app/guide/features#coverage) através de [c8](https://github.com/bcoe/c8) ou [`istanbul`](https://istanbul.js.org/).
- [Tinyspy](https://github.com/tinylibs/tinyspy) embutido para simulação, stubbing, e espiões.
- [JSDOM](https://github.com/jsdom/jsdom) e [happy-dom](https://github.com/capricorn86/happy-dom) para simulação da API do DOM e navegador.
- Testagem de componentes ([Vue](https://github.com/vitest-dev/vitest/blob/main/examples/vue), [React](https://github.com/vitest-dev/vitest/blob/main/examples/react), [Svelte](https://github.com/vitest-dev/vitest/blob/main/examples/svelte), [Lit](https://github.com/vitest-dev/vitest/blob/main/examples/lit), [Vitesse](https://github.com/vitest-dev/vitest/blob/main/examples/vitesse))
- Várias linhas de processamento de operários através de [Tinypool](https://github.com/tinylibs/tinypool) (uma bifurcação leve de [Piscina](https://github.com/piscinajs/piscina))
- Suporte a analise comparativa com [Tinybench](https://github.com/tinylibs/tinybench).
- Módulo de ECMAScript em primeiro lugar, espera de alto nível.
- Suporte de TypeScript / JSX fora da caixa.
- Filtragem, pausas, simultâneo para grupo e testes.

> A Vitest exige versão de Vite >=v3.0.0 e Node >=v14.


```ts
import { assert, describe, expect, it } from 'vitest'

describe('suite name', () => {
  it('foo', () => {
    expect(1 + 1).toEqual(2)
    expect(true).to.be.true
  })

  it('bar', () => {
    assert.equal(Math.sqrt(4), 2)
  })

  it('snapshot', () => {
    expect({ foo: 'bar' }).toMatchSnapshot()
  })
})
```

```bash
$ npx vitest
```

## Patrocinadores

### Patrocinadores do Anthony

<p align="center">
  [![](https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg)](https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg)
</p>

### Patrocinadores do Vladimir

<p align="center">
  [![](https://cdn.jsdelivr.net/gh/sheremet-va/static/sponsors.svg)](https://cdn.jsdelivr.net/gh/sheremet-va/static/sponsors.svg)
</p>

### Patrocinadores do Patak

<p align="center">
  [![](https://cdn.jsdelivr.net/gh/patak-dev/static/sponsors.svg)](https://cdn.jsdelivr.net/gh/patak-dev/static/sponsors.svg)
</p>

## Reconhecimentos

Agradecemos a:

- [Comunidade e equipa da Jest](https://jestjs.io/) pela criação de uma encantadora API de testagem.
- [@lukeed](https://github.com/lukeed) pelo trabalho sobre a [uvu](https://github.com/lukeed/uvu) de onde inspiramos-nos muito.
- [@pi0](https://github.com/pi0) pela ideia e implementação de usar a Vite para transformar e empacotar o código de servidor.
- [Equipa da Vite](https://github.com/vitejs/vite) por brainstorming a ideia inicial.
- [@patak-dev](https://github.com/patak-dev) pelo impressionante nome de pacote!

## Contribuição

Consulte o [Guia de Contribuição](https://github.com/vitest-dev/vitest/blob/main/CONTRIBUTING.md).

## Licença

Licença da [MIT](https://github.com/vitest-dev/vitest/blob/main/LICENSE) © 2021-Presente [Anthony Fu](https://github.com/antfu), [Matias Capeletto](https://github.com/patak-dev)
