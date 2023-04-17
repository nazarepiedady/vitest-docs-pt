---
title: Ambiente de Teste | Guia
---

# Ambiente de Teste {#test-environment}

A Vitest fornece a opção [`environment`](/config/#environment) para executares código dentro de um ambiente específico. Tu podes modificar como o ambiente se comporta com a opção [`environmentOptions`](/config/#environmentoptions).

Por padrão, podes usar estes ambientes:

- `node` é o ambiente padrão.
- `jsdom` emula o ambiente de navegador fornecendo a API do Navegador, usa o pacote [`jsdom`](https://github.com/jsdom/jsdom).
- `happy-dom` emula o ambiente de navegador fornecendo a API do Navegador, e é considerada mais rápida do que a `jsdom`, mas carece de algumas APIs, usa o pacote [`happy-dom`](https://github.com/capricorn86/happy-dom).
- `edge-runtime` emula o [`edge-runtime`](https://edge-runtime.vercel.app/) da Vercel, usa o pacote [`@edge-runtime/vm`](https://www.npmjs.com/package/@edge-runtime/vm).

## Ambientes para Ficheiros Específicos {#environments-for-specific-files}

Quando definires a opção `environment` na tua configuração, isto será aplicado para todos os ficheiros de teste no teu projeto. Para teres mais controlo fino, podes usar comentários de controlo para especificares o ambiente para ficheiros específicos. Os comentários de controlo são comentários que começam com `@vitest-environment` e são seguidos pelo nome do ambiente:

```ts
// @vitest-environment jsdom

import { test } from 'vitest'

test('test', () => {
  expect(typeof window).not.toBe('undefined')
})
```

Ou também podes definir a opção [`environmentMatchGlobs`](https://vitest.dev/config/#environmentmatchglobs) especificando o ambiente baseado nos padrões de `glob`.

## Ambiente Personalizado {#custom-environment}

Desde a versão 0.23.0, podes criar o teu próprio pacote para estenderes o ambiente de Vitest. Para fazeres isto, cria o pacote com o nome `vitest-environment-${name}`. Este pacote deve exportar um objeto com a forma do `Environment`:

```ts
import type { Environment } from 'vitest'

export default <Environment>{
  name: 'custom',
  setup() {
    // configuração personalizada
    return {
      teardown() {
        // chamada depois de todos os testes com
        // este ambiente serem executados
      }
    }
  }
}
```

Tu também tens acesso aos ambientes de Vitest padrão através da entrada `vitest/environments`:

```ts
import { builtinEnvironments, populateGlobal } from 'vitest/environments'

console.log(builtinEnvironments) // { jsdom, happy-dom, node, edge-runtime }
```

A Vitest também fornece a função utilitária `populateGlobal`, que pode ser usada para mover as propriedades do objeto para o nome de espaço:

```ts
interface PopulateOptions {
  // as funções que não são de classe devem
  // ser ligados ao nome de espaço
  bindFunctions?: boolean
}

interface PopulateResult {
  // uma lista de todas as chaves que foram copiadas,
  // mesmo se o valor não existir no objeto original
  keys: Set<string>
  // um mapa de objeto original que pode ter sido sobreposto com chaves
  // tu podes retornar estes valores dentro da função `teardown`
  originals: Map<string | symbol, any>
}

export function populateGlobal(global: any, original: any, options: PopulateOptions): PopulateResult
```
