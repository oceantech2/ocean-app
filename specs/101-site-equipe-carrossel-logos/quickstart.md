# Quickstart: validar o carrossel da Equipe e as logos

## Subir o site local

```bash
cd frontend && npm run dev
```

Abrir `http://site.localhost:5193/` (entrada do site, feature 100).

## Equipe (User Story 1)

1. Computador (≥1024 px): a Equipe mostra 3 consultores, setas à direita do título e 8 indicadores abaixo; o primeiro indicador destacado.
2. Sem mexer, esperar ~6 s: o carrossel desliza 1 consultor. Esperar passar dos 8: depois de Anna Luiza Reguffe vem Fabio d'Ave, no mesmo sentido, sem voltar.
3. Pôr o mouse sobre a seção por 15 s: não avança. Tirar o mouse: volta a avançar ~6 s depois.
4. Clicar "Anterior" a partir do início: aparece Anna Luiza Reguffe à esquerda, deslizando para a direita.
5. Clicar várias vezes seguidas em "Próximo": cada clique avança 1, sem espaço vazio.
6. Clicar no 5º indicador: Mariana Cals passa a ser a primeira visível.
7. Clicar na foto, no nome e no ícone de um consultor: o LinkedIn dele abre em nova aba.
8. Tab pelo teclado: foco passa pelas setas, indicadores e só pelos links dos consultores visíveis; com foco dentro, não avança sozinho.
9. Largura de tablet (~800 px): 2 por vez. Celular (~390 px): 1 por vez; deslizar o dedo para a esquerda/direita troca o consultor.
10. Ativar "reduzir movimento" no sistema (ou emular no DevTools): sem troca automática e sem animação ao clicar.

## Clientes (User Story 2)

1. Seção "Empresas que confiam na Ocean": as 12 logos, na ordem Equatorial, PRIO, Constellation, BW Energy, Bunker One, Foresea, V.Ships, Welltec, Salinas Gold, Cladtek, CNPC Brasil, Prosafe.
2. Emular tela 2× (DevTools, DPR 2) e aproximar: logos sem borrão (Constellation e CNPC: levemente suaves, aceitas — research §6).
3. DevTools → Network → filtro `clientes`: soma das 12 abaixo de 300 KB.

## Build

```bash
cd frontend && npx tsc --noEmit && npx vite build
```
