---
title: Cobertura | Guia
---

# Cobertura {#coverage}

A Vitest suporta cobertura de código Nativa através de [`c8`](https://github.com/bcoe/c8) e cobertura de código instrumentado através [`istanbul`](https://istanbul.js.org/).

## Provedores de Cobertura {#coverage-providers}

:::tip DICA
Desde a versão 0.22.0 da Vitest.
:::

Tanto o suporte de `c8` como de `istanbul` são opcionais. Por padrão, `c8` será usada.

Tu podes selecionar a ferramenta de cobertura definindo `test.coverage.provider` ou para `c8` ou para `istanbul`:

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul' // ou 'c8'
    },
  },
})
```

Quando iniciares o processo de Vitest, levar-te-á a instalar o pacote de suporte correspondente automaticamente:

Ou se preferires podes instalá-los manualmente:

```bash
# Para c8
npm i -D @vitest/coverage-c8

# Para istanbul
npm i -D @vitest/coverage-istanbul
```

## Configuração da Cobertura {#coverage-setup}

Para testares com a cobertura ativada, podes passar a opção `--coverage` na interface da linha de comando:

```json
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

Para configurá-la, defina as opções de `test.coverage` no teu ficheiro de configuração:

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

## Provedor de Cobertura Personalizada {#custom-coverage-provider}

Também é possível fornecer o teu próprio provedor de cobertura personalizada passando `'custom'` na `test.coverage.provider`:

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'custom',
      customProviderModule: 'my-custom-coverage-provider'
    },
  },
})
```

Os provedores personalizados exigem uma opção `customProviderModule` que é um nome de módulo ou caminho de onde carregamos o `CoverageProviderModule`. Ele deve exportar um objeto que implementa `CoverageProviderModule` como exportação padrão:

```ts
// my-custom-coverage-provider.ts
import type { CoverageProvider, CoverageProviderModule, ResolvedCoverageOptions, Vitest } from 'vitest'

const CustomCoverageProviderModule: CoverageProviderModule = {
  getProvider(): CoverageProvider {
    return new CustomCoverageProvider()
  },

  // Implementa o resto da `CoverageProviderModule` ...
}

class CustomCoverageProvider implements CoverageProvider {
  name = 'custom-coverage-provider'
  options!: ResolvedCoverageOptions

  initialize(ctx: Vitest) {
    this.options = ctx.config.coverage
  }

  // Implementa o resto da `CoverageProvider` ...
}

export default CustomCoverageProviderModule
```

Consulte a definição de tipo por mais detalhes.

## Mudando a Localização da Pasta de Cobertura Padrão {#changing-the-default-coverage-folder-location}

Quando executares um relatório de cobertura, uma pasta `coverage` é criada no diretório de raiz do teu projeto. Se quiseres movê-lo para um diretório diferente, use a propriedade `test.coverage.reportsDirectory` no ficheiro `vite.config.ts`:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: './tests/unit/coverage'
    }
  }
})
```

## Ignorando Código {#ignoring-code}

Os dois provedores de cobertura têm suas próprias maneiras de ignorar código a partir dos relatórios de cobertura:

- [`c8`](https://github.com/bcoe/c8#ignoring-uncovered-lines-functions-and-blocks)
- [`ìstanbul`](https://github.com/istanbuljs/nyc#parsing-hints-ignoring-lines)

Quando usares a TypeScript o código-fonte é traduzido usando `esbuild`, que elimina todos os comentários do código-fonte ([esbuild#516](https://github.com/evanw/esbuild/issues/516)). Comentários que são considerados como [comentários legais](https://esbuild.github.io/api/#legal-comments) são preservados.

Para o provedor `istanbul` podes incluir um palavra-chave `@preserve` na dica de ignorar. Cuidado com testas dicas de ignorar que agora podem ser incluídas também na construção final de produção:

```diff
-/* istanbul ignore if */
+/* istanbul ignore if -- @preserve */
if (condition) {
```

Para `c8` isto não causa quaisquer problemas. Tu podes também usar os comentários `c8 ignore` com TypeScript:

<!-- eslint-skip -->
```ts
/* c8 ignore next 3 */
if (condition) {
```
