---
title: Porquê Vitest | Guia
---

# Porquê Vitest? {#why-vitest}

:::tip NOTA
Este guia presume que estás familiarizado com a Vite. Uma boa maneira de começar a aprender mais é ler o [Guia do Porquê da Vite](https://pt.vitejs.dev/guide/why.html), e a [próxima geração de ferramental de frontend com a ViteJS](https://www.youtube.com/watch?v=UJypSr8IhKY), uma corrente onde o [Evan You](https://twitter.com/youyuxi) fez uma demonstração explicando os conceitos principais.
:::

## A Necessidade de um Executor de Teste Nativo de Vite {#the-need-for-a-vite-native-test-runner}

O suporte fora da caixa da Vite para padrões de web comuns, as funcionalidades como importações glob e os primitivos da interpretação no lado do servidor, e sua muitas extensões e integrações são a estimular um ecossistema vibrante. Sua história de construção e desenvolvimento são chave para o seu sucesso. Para documentação, existem várias alternativas baseadas geração de aplicação estática alimentada pela Vite. Mesmo assim a história da testagem unitária da Vite não tem sido clara. Existem opções como a [Jest](https://jestjs.io/) que foram criadas num contexto diferente. Existe muita duplicação entre a Jest e a Vite, forçando os utilizadores a configurarem duas condutas diferentes.

Usar o servidor de desenvolvimento da Vite para transformar os teus ficheiros durante a testagem, ativa a criação de um executor simples que não precisa de lidar com a complexidade da transformação de ficheiros de fonte e pode unicamente concentrar-se em fornecer a melhor experiência de programação durante a testagem. Um executor de teste que usa a mesma configuração de tua aplicação (através de `vite.config.ts`), partilhando uma conduta de transformação comum durante o tempo de desenvolvimento, construção, e teste. Que é extensível com a mesma API de extensão que permite-te a ti e os responsáveis das tuas ferramentas fornecer integração de primeira de classe com Vite. Uma ferramenta que é construída com Vite em mente desde o principio, beneficiando-se das suas melhorias na experiência de programação, como sua substituição de módulo instantânea (HMR). Esta é a Vitest, uma abstração de teste unitário extremamente rápida alimentada pela Vite.

Dada a massiva adoção da Jest, a Vitest fornece uma API compatível que permite-te usá-la como uma substituição na maioria dos projetos. Isto também inclui a maioria das funcionalidades comuns exigida quando defines os teus testes unitários (simulação, fotografias, cobertura). A Vitest importa-se muito com o desempenho e usa linhas de processamento de operário para executar tanto quanto possível em paralelo. Algumas portas têm visto o teste a executar um ordem de grandeza mais rápida. O modo de observação é ativado por padrão, alinhando-se a si mesmo com a maneira que a Vite empurra para uma experiência de programador em primeiro. Mesmo com todas estas melhorias na experiência de programação, a Vitest continua leve escolhendo cuidadosamente suas dependências (ou embutindo diretamente os pedaços necessários).

**A Vitest tem por objetivo posicionar-se como o Executor de Teste de escolha para projetos de Vite, e como uma alternativa sólida mesmo para projetos que não usam a Vite.**

Continue a leitura no [Guia Começar](./index)

## Como a Vitest se Diferencia de X? {#how-is-vitest-different-from-x}

Tu podes consultar a seção de [Comparações](./comparisons) para mais detalhes sobre como a Vitest difere de outras ferramentas parecidas.
