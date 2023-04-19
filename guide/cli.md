---
title: Interface da Linha de Comando | Guia
---

# Interface da Linha de Comando {#command-line-interface}

## Comandos {#commands}

### `vitest` {#vitest}

Inicia a Vitest no diretório atual. Entrará no modo de observação no ambiente de desenvolvimento e executará o modo na integração continua automaticamente.

Tu podes passar um argumento adicional como filtro dos ficheiros de teste à executar. Por exemplo:

```sh
vitest foobar
```

Apenas executará o ficheiro de teste que contém `foobar` nos seus caminhos. Este filtro apenas verifica a inclusão e não suporta padrões de expressões regulares ou glob (a menos que o teu terminal o processe antes da Vitest receber o filtro).

### `vitest run` {#vitest-run}

Realiza um única execução sem o modo observação.

### `vitest watch` {#vitest-watch}

Executa todos os grupos de teste mas observa as mudanças e executa novamente quando mudarem. O mesmo que chamar `vitest` sem um argumento. Retrocederá para `vitest run` na integração continua.

### `vitest dev` {#vitest-dev}

Pseudónimo para `vitest watch`.

### `vitest related` {#vitest-related}

Apenas executa os testes que cobrem uma lista de ficheiros de fonte. Funciona com importações estáticas (por exemplo, `import('./index.ts')` ou `import index from './index.ts'`), mas não os dinâmicos (por exemplo, `import(filepath)`). Todos os ficheiros devem ser relativos à pasta de raiz.

Útil para executar com a [`lint-staged`](https://github.com/okonet/lint-staged) ou com a tua configuração de integração continua:

```bash
vitest related /src/index.ts /src/hello-world.js
```

:::tip DICA
Não esqueças que a Vitest executa com o modo de observação ativado por padrão. Se usas ferramentas como `lint-staged`, deverias também passar a opção `--run`, para que o comando passa sair normalmente.

```js
// .lintstagedrc.js
export default {
  '*.{js,ts}': 'vitest related --run',
}
```
:::

### `vitest bench` {#vitest-bench}

Executa apenas os testes de [marco de referência](https://vitest.dev/guide/features.html#benchmarking-experimental), que comparam os resultados de desempenho.

## Opções {#options}

| Opções       | Descrições             |
| ------------- | ------------- |
| `-v, --version` | Exibe o número da versão |
| `-r, --root <path>` | Define a raiz do projeto |
| `-c, --config <path>` | Caminho para o ficheiro de configuração |
| `-u, --update` | Atualiza as fotografias |
| `-w, --watch` | Modo de observação inteligente e instantânea |
| `-t, --testNamePattern <pattern>` | Executa os testes com os nomes completos correspondendo o padrão |
| `--dir <path>`| Diretório de base para examinar os ficheiros de teste |
| `--ui` | Ativa a interface de utilizador |
| `--open` | Abre a interface de utilizador automaticamente se ativada (predefinido como: `true`) |
| `--api [api]` | Serve a API, opções disponíveis: `--api.port <port>`, `--api.host [host]` e `--api.strictPort` |
| `--threads` | Ativa as linhas de processamento (predefinido como: `true`) |
| `--silent` | Saída de consola silenciosa de testes |
| `--isolate` | Isola o ambiente para cada ficheiro de teste (predefinido como: `true`) |
| `--reporter <name>` | Seleciona o repórter: `default`, `verbose`, `dot`, `junit`, `json`, ou um caminho para um repórter personalizado |
| `--outputFile <filename/-s>` | Escreve os resultados do teste em um ficheiro quando a opção `--reporter=json` ou `--reporter=junit` também for especificada. Através da [notação de ponto da cac][cac's dot notation] podes especificar as saídas individuais para vários repórteres |
| `--coverage` | Ativa o relatório de cobertura |
| `--run` | Não observa |
| `--mode` | Sobrepõe o modo de Vite (predefinido como: `test`) |
| `--mode <name>` | Sobrepõe o modo de Vite (predefinido como: `test`) |
| `--globals` | Injeta as APIs globalmente |
| `--dom` | Simula a API do navegador com a `happy-dom` |
| `--browser [options]` | Executa os testes no [navegador](/guide/browser) (predefinido como: `false`) |
| `--environment <env>` | Ambiente executor (predefinido como: `node`) |
| `--passWithNoTests` | Passa quando nenhum teste for encontrado |
| `--logHeapUsage` | Mostra o tamanho do amontoado para cada teste |
| `--allowOnly` | Permite os testes e grupos que são marcados como (predefinido como: `false` na integração continua, de outro modo `true`) |
| `--dangerouslyIgnoreUnhandledErrors` | Ignora quaisquer erros não manipulados que ocorrerem |
| `--changed [since]` | Executa os testes que são afetados pelos ficheiros mudados (predefinido como: `false`). Consulte a [documentação](#changed) |
| `--shard <shard>` | Executa os testes num estilhaço especificado |
| `--sequence` | Define qual ordem executar os testes. Use a [notação de ponto da cac][cac's dot notation] para especificar opções (por exemplo, use `--sequence.shuffle` para executar os testes em ordem aleatória) |
| `--no-color` | Remove as cores da saída da consola |
| `--inspect` | Ativa o inspecionador da Node.js |
| `--inspect-brk` | Ativa o inspecionador da Node.js com quebra |
| `-h, --help` | Exibe as opções de interface da linha de comando disponíveis |

:::tip DICA
A Vitest suporta ambos `camelCase` e `kebab-case` para argumentos de  interface da linha de comando. Por exemplo, ambos `--passWithNoTests` e `--pass-with-no-tests` funcionarão (`--no-color` e `--inspect-brk` são as exceções).

A Vitest também suporta diferentes maneiras de especificar o valor: ambos `--reporter dot` e `--reporter=dot` são válidos.

Se a opção suporta um arranjo de valores, precisas de passar a opção várias vezes:

```sh
vitest --reporter=dot --reporter=default
```

As opções booleanas podem ser negadas com o prefixo `no-`. Especificar o valor como `false` também funciona:

```sh
vitest --no-api
vitest --api=false
```
:::

### changed {#changed}

- **Tipo**: `boolean | string`
- **Predefinido como**: `false`

Executa os testes apenas contra os ficheiros mudados. Se nenhum valor for fornecido, executará os testes contra as mudanças não consolidadas (incluindo `staged` e `unstaged`).

Para executares os testes contra as mudanças feitas na última consolidação, podes usar `--changed HEAD~1`. Tu podes também passar a sequência de caracteres baralhados (hash, em Inglês) ou o nome do ramo.

Se emparelhada com a opção de configuração `forceRunTriggers` executará o grupo de teste inteiro se uma correspondência for encontrada.

### shard {#shard}

- **Tipo**: `string`
- **Predefinido como**: `disabled`

Testa o estilhaço de grupo à executar num formato de `<index>` ou `<count>`, onde

- `count` é um inteiro positivo, cálculo das partes divididas.
- `index` é um inteiro positivo, índice da parte dividida.

Este comando dividirá todos os testes em partes iguais de `count`, e executará apenas aqueles que acontecem numa parte de `index`. Por exemplo, para dividires o teu grupo de testes em três partes, use isto:

```sh
vitest run --shard=1/3
vitest run --shard=2/3
vitest run --shard=3/3
```

:::warning AVISO
Tu não podes usar esta opção com `--watch` ativada (ativada em desenvolvimento por padrão).
:::

[cac's dot notation]: https://github.com/cacjs/cac#dot-nested-options
