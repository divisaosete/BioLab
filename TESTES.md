# Relatório de testes — BioLab 3.1

Data: 29/10/2026. Ambiente: Windows, Node.js v24.22.1, Playwright Core 1.64.1 e Microsoft Edge **156.0.4314.50**, em modo headless com perfil temporário.

## Diagnóstico reproduzido no navegador

O defeito da 3.0 foi reproduzido com cliques reais em uma cópia de diagnóstico dos componentes antigos, sem modificar a versão original:

| Interação na versão antiga | Esperado | Texto que permaneceu |
| --- | --- | --- |
| Clicar na mitocôndria | Mitocôndrias | Núcleo |
| Clicar no estômago | Estômago | Esôfago |

O registro mostra `pointerdown` na estrutura, seguido de captura no SVG e de `pointerup`/`click` sem identificador de estrutura. A captura antecipada fazia a seleção perder o alvo. O arquivo `relatorios/reproducao-v3.0.json` contém os eventos observados.

Também foi reproduzido um segundo caso em toque: o evento era direcionado a ribossomos quando o ponto efetivamente tocado estava no retículo; em outro ponto, o alvo do evento eram os pulmões, embora a posição tocada correspondesse a um vaso. O controle passou a resolver a estrutura pela posição real de entrada, em vez de confiar apenas no alvo ajustado pelo navegador.

Foram inspecionados identificadores e catálogos, correspondência de textos, ordem das camadas, áreas transparentes de interação, `pointer-events`, propagação, estado e conteúdo dos painéis. Não foi encontrada uma tabela de descrições ausente: a falha principal era a entrega dos eventos. Os testes de DOM da versão anterior não executavam a sequência nativa de captura e por isso não demonstravam a operação real dos cliques.

## Testes de navegador

Comando: `node --test browser.test.mjs`.

| Ambiente emulado | Entrada | Dimensão |
| --- | --- | --- |
| Computador | Mouse | 1440 × 1000 |
| Celular | Touchscreen do navegador | 360 × 800 |
| Tablet | Touchscreen do navegador | 768 × 1024 |

São **72 cenários por dimensão**, totalizando **216 cenários distintos**. A rotina procura um ponto efetivamente desenhado e atingível de cada estrutura e utiliza `mouse.click` ou `touchscreen.tap`. Não usa `dispatchEvent('click')`, `force` ou chamada direta da função de seleção para validar órgãos e organelas.

Para cada seleção, verifica o texto realmente exibido por `innerText`: nome, função e explicação. Nos órgãos, verifica também sistema e localização. Confirma o destaque selecionado e, em celular/tablet, que o painel fica na área visível.

Cobertura:

- Nove estruturas da célula animal e dez da vegetal, uma a uma.
- Todas as 22 estruturas anatômicas na visão integrada e novamente em seu sistema isolado.
- Seleção depois de zoom nos dois tipos celulares e no coração.
- Alternância entre células e sistemas, mensagem inicial e troca de descrições.
- Arraste sem seleção involuntária e funcionamento do clique seguinte.
- Permanência das informações após afastar o cursor.
- Ativação por teclado.
- DNA e Biblioteca preservados, quatro ferramentas e ausência do módulo de proteínas.
- Publicação sob prefixo de subdiretório, recursos e console.

Os relatórios JSON registram cada cenário, dimensão, tipo de entrada e o texto lido no painel. As capturas incluídas são do próprio aplicativo no navegador real, não de uma simulação de DOM.

### Execução e repetição pontual

Na execução completa após as correções, **215 de 216 cenários passaram na primeira tentativa**. Todos os cenários de seleção de estruturas passaram nas três dimensões. A única falha restante foi um timeout de navegação HTTP para a página inicial, ao final da verificação da Biblioteca em 768 px; não houve erro de seleção ou de console nesse caso.

A navegação foi repetida isoladamente com um limite de carregamento maior, mantendo os mesmos testes de conteúdo e layout. O registro dessa repetição está em `relatorios/navegador-reteste.json`. A consolidação de resultados finais, preservando as tentativas, está em `relatorios/resultado-final.json`.

Os arquivos `navegador.json` e `navegador-reteste.json` preservam os resultados das execuções, incluindo o timeout inicial. Não foram apresentados como uma execução única sem intercorrências.

## Testes unitários e de regressão

Comando: `node --test tests.mjs selection.test.mjs`.

**23 testes aprovados, zero falhas.** Incluem os 14 testes científicos herdados e nove verificações adicionais de seleção, captura apenas durante arraste, cancelamento, ativação assistiva, teclado, desmontagem, correspondência de dados, preservação de DNA/Biblioteca, dependências e ajuste de alvo em toque.

As funções científicas herdadas continuam em `genetics.js`, sem telas de edição ou desafios na interface. Seus testes são regressão da base e não indicam que módulos descartados tenham retornado.

## Exclusão do módulo de proteínas

A busca de dependências confirmou que `proteins.js`, `molecular.js`, o catálogo `PROTEINS`, os estilos específicos e os arquivos PDB eram exclusivos do módulo retirado. Não foram copiados para a distribuição 3.1. Células, anatomia, DNA e biblioteca não importam esses recursos. Os textos teóricos de proteínas e referências da biblioteca foram mantidos.

## Limites da verificação

O Edge foi executado de verdade, com renderização, hit-testing, captura de ponteiro e eventos de mouse/toque nativos do motor. Toque foi emulado por Playwright; não houve teste em aparelho físico, Safari, Firefox ou leitor de tela. As ilustrações continuam científicas e esquemáticas, sem precisão clínica.

Não houve publicação ou alteração em outros projetos ou versões do BioLab. A compatibilidade com subdiretórios foi verificada em servidor local; a implantação no GitHub Pages não foi realizada.

## Pacote

O ZIP contém somente a aplicação 3.1, documentação, testes e os relatórios de evidência selecionados. Ferramentas, perfis temporários, cópia de diagnóstico e saídas intermediárias ficam fora. Uma extração isolada é comparada por SHA-256 com os arquivos distribuídos, e os 23 testes unitários são executados nessa cópia.
