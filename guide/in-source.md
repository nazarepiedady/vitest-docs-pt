---
title: Testagem Na Fonte | Guia
---

# Testagem Na Fonte {#in-source-testing}

A Vitest também fornece uma maneira de executares os testes dentro do teu código-fonte juntamente com a implementação, parecido com os [testes de módulo da Rust](https://doc.rust-lang.org/book/ch11-03-test-organization.html#the-tests-module-and-cfgtest).

Isto faz os testes partilharem o mesmo encerramento que as implementações e capaz de testar contra estados privados sem exportar. Entretanto, também trás o laço de reações para mais próximo do desenvolvimento.

## Configuração {#setup}

Para começares, coleque um bloco `if (import.meta.vitest)` no final do teu ficheiro de fonte e escreva alguns testes dentro dele. Por exemplo:

```ts
// src/index.ts

// a implementação
export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0)
}

// grupos de teste na fonte
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })
}
```

Atualize a configuração de `includeSource` para Vitest apanhar os ficheiros dentro de `src/`:

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'],
  },
})
```

Depois podes começar à testar:

```bash
$ npx vitest
```

## Construção de Produção {#production build}

Para construção de produção, precisarás de definir as opções `define` no teu ficheiro de configuração, deixando o empacotador fazer a eliminação de código morto. Por exemplo, na Vite:

```diff
// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
+ define: {
+   'import.meta.vitest': 'undefined',
+ },
  test: {
    includeSource: ['src/**/*.{js,ts}']
  },
})
```

### Outros Empacotadores {#other-bundlers}

<details mt4>
<summary text-xl>unbuild</summary>

```diff
// build.config.ts
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
+ replace: {
+   'import.meta.vitest': 'undefined',
+ },
  // outras opções
})
```

Saiba mais: [unbuild](https://github.com/unjs/unbuild)

</details>

<details my2>
<summary text-xl>rollup</summary>

```diff
// rollup.config.js
+ import replace from '@rollup/plugin-replace'

export default {
  plugins: [
+   replace({
+     'import.meta.vitest': 'undefined',
+   })
  ],
  // outras opções
}
```

Saiba mais: [rollup](https://rollupjs.org/)

</details>

## TypeScript {#typescript}

Para receberes suporte de TypeScript para `import.meta.vitest`, adicione `vitest/import` ao teu `tsconfig.json`:

```diff
// tsconfig.json
{
  "compilerOptions": {
    "types": [
+     "vitest/importMeta"
    ]
  }
}
```

Consulte a [`test/import-meta`](https://github.com/vitest-dev/vitest/tree/main/test/import-meta) por um exemplo completo.

## Notas {#notes}

Esta funcionalidade poderia ser útil para:

- Testagem unitário para pequenas funções isoladas ou utilitários.
- Prototipação
- Afirmação Em Linha.

É recomendado **usar ficheiros de teste separados**  para testes mais complexos como componentes ou testagem de ponta-a-ponta.
