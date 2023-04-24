<template>
  <ul
    class="features-list"
    dir="auto"
    flex="~ col gap2 md:gap-3"
  >
    <ListItem>
      Configuração, transformadores, resolvedores, e extensões da <a target="_blank" href="https://vitejs.dev" rel="noopener noreferrer">Vite</a>.
    </ListItem>
    <ListItem>
      Use a mesma configuração da tua aplicação para executar os testes!
    </ListItem>
    <ListItem>
      <a
        target="_blank"
        href="https://twitter.com/antfu7/status/1468233216939245579"
        rel="noopener noreferrer">
        Modo de Observação Inteligente e Instantânea, como HMR para testes!
      </a>
    </ListItem>
    <ListItem>
      Testagem de Componente para Vue, React, Svelte, Lit e Muito Mais.
    </ListItem>
    <ListItem>
      Suporte de TypeScript / JSX Fora da Caixa
    </ListItem>
    <ListItem>
      Módulo de ECMAScript em primeiro lugar, espera de alto nível
    </ListItem>
    <ListItem>
      Operários com várias linhas de processamento através da <a target="_blank" href="https://github.com/tinylibs/tinypool" rel="noopener noreferrer">Tinypool</a>
    </ListItem>
    <ListItem>
      Suporte a analise comparativa com a <a target="_blank" href="https://github.com/tinylibs/tinybench" rel="noopener noreferrer">Tinybench</a>
    </ListItem>
    <ListItem>
      Filtragem, pausas, execução simultânea para grupo e testes
    </ListItem>
    <ListItem>
      <a href="/guide/snapshot">
        Fotografia Compatível com a Jest
      </a>
    </ListItem>
    <ListItem>
      <a
        target="_blank"
        href="https://www.chaijs.com/"
        rel="noopener noreferrer">Chai</a> embutida para asserções + as APIs compatíveis com a
        <a
        target="_blank"
        href="https://jestjs.io/docs/expect"
        rel="noopener noreferrer">expect da Jest</a>
    </ListItem>
    <ListItem>
      <a
        target="_blank"
        href="https://github.com/tinylibs/tinyspy"
        rel="noopener noreferrer">Tinyspy</a> embutida para simulação.
    </ListItem>
    <ListItem>
      <a
        target="_blank"
        href="https://github.com/capricorn86/happy-dom"
        rel="noopener noreferrer">happy-dom</a> ou
      <a
        target="_blank"
        href="https://github.com/jsdom/jsdom"
        rel="noopener noreferrer">jsdom</a> para simulação do DOM
    </ListItem>
    <ListItem>
      Cobertura de código através da
      <a
        target="_blank"
        href="https://github.com/bcoe/c8"
        rel="noopener noreferrer">c8</a> ou
      <a
        target="_blank"
        href="https://istanbul.js.org/"
        rel="noopener noreferrer">istanbul</a>
    </ListItem>
    <ListItem>
      <a href="/guide/in-source">Testagem Na Fonte</a> Parecida com a da Rust
    </ListItem>
    <ListItem>
      Testagem de Tipo através da <a target="_blank" href="https://github.com/mmkal/expect-type" rel="noopener noreferrer">expect-type</a>
    </ListItem>
  </ul>
</template>

<style scoped>
.features-list li {
  list-style: none;
  display: flex;
  gap: 0.4rem;
  margin: 0;
}

.features-list {
  padding: 0;
}
</style>
