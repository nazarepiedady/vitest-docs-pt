---
title: Depuração | Guide
---

# Depuração {#debugging}

:::tip DICA
Quando depurares os testes podes usar o argumento de interface da linha de comando `--test-timeout` para impedir que os testes de pausarem quando pararem nos pontos de quebra.
:::

## VSCode {#vscode}

A maneira perspicaz de depurar os testes no VSCode é através de `JavaScript Debug Terminal`. Abra um nova `JavaScript Debug Terminal` e execute diretamente `npm run test` ou `vitest`. *Isto funciona com qualquer código executado na Node, então funcionará com a maioria das abstrações de testagem de JavaScript*.

![image](https://user-images.githubusercontent.com/5594348/212169143-72bf39ce-f763-48f5-822a-0c8b2e6a8484.png)

Tu também podes adicionar uma configuração de lançamento dedicado para depurar um ficheiro de teste no VSCode:

```json
{
  // Para mais informações, visite: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "autoAttachChildProcesses": true,
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
      "program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "smartStep": true,
      "console": "integratedTerminal"
    }
  ]
}
```

Depois no separador de depuração, assegure que `Debug Current Test File` é selecionado. Tu podes então abra o ficheiro de teste que quiseres depurar e pressione `F5` para iniciar a depuração.

## IntelliJ IDEA {#intellij-idea}

Crie uma configuração de execução de `Node.js`. Use as seguintes definições para executar todos os testes no modo de depuração:

Definição | Valor
 --- | ---
Diretório de trabalho | /path/to/your-project-root
Ficheiro de JavaScript | ./node_modules/vitest/vitest.mjs
Parâmetros de aplicação | run --threads false

Depois execute esta configuração no modo de depuração. O IDE parará nos pontos de quebra de JavaScript ou TypeScript definido no editor.

## Inspetor de Node {#node-inspector}

A Vitest também suporta testes de depuração sem os IDEs. No entanto, isto exige que os testes não sejam executados em paralelo. Use um dos seguintes comandos para lançar a Vitest:

```sh
# Para executar um único operário
vitest --inspect-brk --single-thread

# Para executar um processo filho
vitest --inspect-brk --no-threads
```

Assim que a Vitest começar parará a execução e esperará que abras as ferramentas de programação que possam conectar-se ao [inspetor da NodeJS](https://nodejs.org/en/docs/guides/debugging-getting-started/). Tu podes usar as ferramentas de programação do Chrome para isto abrindo `chrome://inspect` no navegador.

No modo de observação podes manter o depurador aberto durante re-execuções de teste usando as opções `--single-thread --isolate false`.
