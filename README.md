# BioLab 3.1 — Atlas Biológico Interativo

**New Era Labs | Divisão 7 · Per Vitam, Ad Astra.**

Cópia independente do BioLab 3.0, com quatro ferramentas e uma página inicial:

1. Explorador de DNA.
2. Explorador Celular.
3. Atlas do Corpo Humano.
4. Biblioteca Científica.

O Explorador de Proteínas foi retirado da navegação, da página inicial, das rotas e do código de produção. Seus arquivos PDB, renderizador e estilos exclusivos não integram esta distribuição. Os temas teóricos de proteínas e as referências da Biblioteca foram preservados.

## Abrir no Live Server ou localmente

Abra esta pasta no VS Code e use **Open with Live Server** em `index.html`. Também é possível usar Node.js 20 ou superior:

```sh
node server.mjs
```

Acesse http://127.0.0.1:4173. Não é necessário instalar dependências para usar o site. Abrir o HTML por duplo clique pode bloquear os módulos JavaScript; use um servidor HTTP.

## Correção funcional dos cliques

A reprodução no Edge confirmou dois problemas diferentes:

- A versão 3.0 capturava o ponteiro no SVG inteiro já no início do pressionamento. Ao soltar, o navegador encaminhava `pointerup` e `click` para o SVG, perdendo o identificador da estrutura. O painel permanecia com a descrição inicial.
- Em telas de toque, o navegador pode ajustar o alvo de uma área estreita para um elemento vizinho. Isso foi observado entre retículo e ribossomos e entre vasos e pulmões.

A versão 3.1 registra a estrutura que está realmente sob as coordenadas do ponteiro e a seleciona no término de um toque sem arraste. A captura só começa depois de um movimento de arraste superior a seis pixels. Arrastar não seleciona uma estrutura por engano, e o clique seguinte continua funcionando. Teclado e ativação assistiva permanecem disponíveis.

Os testes anteriores de DOM disparavam `click` diretamente e não cobriam essa sequência real de captura e ajuste de toque. Esta versão inclui testes com mouse e toque do navegador, sem disparar artificialmente cliques nos órgãos ou organelas.

## Painéis de informação

Ao entrar nas células ou no atlas, aparece **“Selecione uma estrutura para conhecer sua função.”** A primeira seleção substitui a mensagem pelo nome, função e descrição. O atlas também apresenta sistema anatômico e localização.

As informações permanecem até outra seleção. Alterar o tipo celular ou o sistema limpa a seleção anterior para evitar uma descrição fora do contexto. No computador, o painel fica ao lado da figura. Em larguras menores, ele fica logo abaixo e é trazido à área visível após a seleção. **Voltar à ilustração** permite continuar explorando, mantendo a descrição escolhida.

## Usar as ferramentas

- **DNA:** rotação, zoom, seleção de bases, informações, complementaridade e orientação antiparalela preservados.
- **Células:** alterne animal/vegetal, clique ou toque diretamente nas estruturas. Todos os componentes presentes têm identificação e descrição. Use os botões de zoom e arraste para deslocar o desenho.
- **Corpo humano:** explore 22 estruturas na visão integrada ou nos cinco sistemas. Selecione diretamente no desenho; a lista oferece uma alternativa adicional.
- **Biblioteca:** 13 temas, conteúdo e busca preservados, incluindo os dez temas da primeira versão e os três acrescentados na 3.0.

Use Tab e Enter/Espaço para selecionar estruturas SVG. As setas deslocam os novos desenhos; + e − ajustam o zoom. Centralizar restaura a vista. Os botões visíveis também funcionam por toque.

## Publicar no GitHub Pages

Copie o conteúdo do ZIP para a raiz de um repositório dedicado ou para a pasta `docs`. Em Settings → Pages escolha a branch e a pasta. Não há compilação ou dependência de produção. Preserve os caminhos relativos dos módulos e estilos. As rotas usam fragmentos (`#cells`, `#anatomy`) e foram verificadas sob um prefixo de subdiretório. Nenhuma publicação foi realizada.

## Arquivos principais

- `index.html`, `app.js`: entrada, página inicial e cinco rotas.
- `style.css`, `favicon.svg`: identidade visual preservada.
- `atlas.css`: estilos dos novos exploradores, sem o módulo molecular.
- `cells.js`, `anatomy.js`, `catalog.js`: desenhos, informações e seleção.
- `svg-controls.js`: separação de toque, clique, teclado e arraste.
- `selection-panel.js`: instrução inicial e apresentação persistente das informações.
- `genetics.js`: utilidades herdadas, utilizadas pelo DNA e testes de regressão.
- `server.mjs`: servidor opcional para desenvolvimento.
- `tests.mjs`, `selection.test.mjs`: cálculos e regressões da seleção.
- `browser.test.mjs`, `browser-tools.mjs`: verificação com navegador real.
- `relatorios/`: resultados registrados e capturas de teste incluídas.
- `FONTES.md`, `CREDITOS.md`, `LICENCAS.md`, `TESTES.md`: referências e documentação.

Ferramentas baixadas, cópias de diagnóstico e scripts internos de preparação ficam fora do ZIP.

## Executar os testes

Sem dependências:

```sh
npm test
```

Para os testes em navegador:

```sh
npm install --ignore-scripts
npm run test:browser
```

Playwright Core é uma dependência apenas de desenvolvimento. No Windows, o teste usa o Edge instalado no caminho padrão. A variável `BIOLAB_BROWSER` pode indicar outro executável compatível de Chrome/Chromium/Edge. O teste abre um perfil temporário, inicia seu próprio servidor local e encerra ambos ao terminar. Não usa o perfil pessoal do navegador.

Os resultados efetivamente executados, as dimensões verificadas e as limitações estão em TESTES.md. Os testes de toque são emulação no navegador; não substituem uma auditoria em diferentes aparelhos físicos ou motores de navegador.

## Limitações científicas

DNA, células e anatomia são representações esquemáticas. A hélice não tem precisão atômica. Células são cortes ilustrativos sem escala, com posições e quantidades didáticas; há variações e especializações celulares. O modelo vegetal é fotossintetizante, não representa toda célula de uma planta.

O atlas mostra uma vista anterior simplificada. Alguns órgãos estão expostos ou sobrepostos; trajetos, proporções e número de estruturas foram reduzidos para facilitar a exploração. As descrições indicam localização orientativa, não precisão clínica. Não é ferramenta diagnóstica, modelo cirúrgico ou catálogo completo do corpo.
