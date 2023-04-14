---
title: Filtragem de Teste | Guia
---

# Filtragem de Teste {#test-filtering}

Filtragem, pausas, execuções simultâneas para grupos e testes.

Use `.skip` para evitar a execução de certos grupos ou testes:

```ts
import { assert, describe, it } from 'vitest'

describe.skip('skipped suite', () => {
  it('test', () => {
    // Grupo ignorado, sem erro
    assert.equal(Math.sqrt(4), 3)
  })
})

describe('suite', () => {
  it.skip('skipped test', () => {
    // Teste ignorado, sem erro
    assert.equal(Math.sqrt(4), 3)
  })
})
```

## Selecionando Grupos e Testes à Executar {#selecting-suites-and-tests-to-run}

Use `.only` para apenas executar certos grupos ou testes:

```ts
import { assert, describe, it } from 'vitest'

// Apenas este grupo (e outros marcados com `only`) são executados.
describe.only('suite', () => {
  it('test', () => {
    assert.equal(Math.sqrt(4), 3)
  })
})

describe('another suite', () => {
  it('skipped test', () => {
    // Teste ignorado, visto que os testes são executando em modo `only`
    assert.equal(Math.sqrt(4), 3)
  })

  it.only('test', () => {
    // Apenas este teste (e outros marcados com `only`) são executados
    assert.equal(Math.sqrt(4), 2)
  })
})
```

## Grupos e Testes Não Implementados {#unimplemented-suites-and-tests}

Use `.todo` para bateres com os grupos e testes que deveriam ser implementados:

```ts
import { describe, it } from 'vitest'

// Uma entrada será exibida no relatório para este grupo
describe.todo('unimplemented suite')

// Uma entrada será exibida no relatório para este teste
describe('suite', () => {
  it.todo('unimplemented test')
})
```
