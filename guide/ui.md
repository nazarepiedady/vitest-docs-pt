---
title: Interface de Utilizador da Vitest | Guia
---

# Interface de Utilizador da Vitest {#vitest-ui}

Alimentada pela Vite, a Vitest também tem um servidor de desenvolvimento nos bastidores quando executas os testes. Isto permite a Vitest fornecer uma interface de utilizador bonita para visualizar e interagir com os teus testes. A interface de utilizador da Vitest é opcional, então precisarás de instalá-la com:

```bash
npm i -D @vitest/ui
```

A seguir podes iniciar os testes com a interface de utilizador passando a opção `--ui` na interface da linha de comando:

```bash
vitest --ui
```

A seguir podes visitar a interface de utilizador da Vitest em `http://localhost:51204/__vitest__/`.


<img alt="Vitest UI" img-light src="https://user-images.githubusercontent.com/11247099/171992267-5cae2fa0-b927-400a-8eb1-da776974cb61.png">
<img alt="Vitest UI" img-dark src="https://user-images.githubusercontent.com/11247099/171992272-7c6057e2-80c3-4b17-a7b6-0ac28e5a5e0b.png">

Desde a versão 0.26.0 da Vitest, a interface de utilizador também pode ser usada como um repórter. Use o repórter `'html'` na tua configuração da Vitest para gerar saída de HTML e pré-visualizar os resultados dos teus testes:

```ts
// vitest.config.ts

export default {
  test: {
    reporters: ['html']
  }
}
```

:::warning AVISO
Se ainda quiseres ver com os teus testes estão a executar em tempo real no terminal, não te esqueças de adicionar o repórter `default` à opção `reporters`: `['default', 'html']`.
:::

:::tip DICA
Para pré-visualizares a tua reportagem de HTML, podes usar o comando de [pré-visualização da vite](https://pt.vitejs.dev/guide/cli#vite-preview):

```sh
npx vite preview --outDir ./html
```

Tu podes configurar a saída com a opção de configuração [`outputFile`](/config/#outputfile). Tu precisas de especificar o caminho `.html` lá. Por exemplo, `./html/index.html` é o valor predefinido.
:::
