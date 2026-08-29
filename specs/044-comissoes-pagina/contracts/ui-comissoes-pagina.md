# Contrato UI: Página Comissões

**Feature**: `044-comissoes-pagina`  
Página: `frontend/src/pages/Bonus.tsx` (arquivo pode permanecer; textos e rota mudam)  
Rota: `/comissoes` | Endereço antigo `/bonus`: **sem rota e sem redirect**  
permKey: `bonus` (inalterado)

## Navegação

| Elemento | Antes | Depois |
|----------|-------|--------|
| Menu | Bônus → `/bonus` | **Comissões** → `/comissoes` |
| Ícone | mapeado em `/bonus` | mapeado em `/comissoes` |
| Configurações (catálogo) | Bônus / desc de bônus | Comissões / desc de comissões |
| `/bonus` | abre a página | não abre nenhuma tela do produto |

## Cabeçalho da página

- Título: **Comissões** + total do **recorte ativo** (ano inteiro, mês ou trimestre).
- Ações admin: Importar CSV, Exportar CSV (se houver linhas visíveis), Exportar PDF.
- **Sem** botão Novo bônus / Nova comissão / equivalente.
- Visualizador: sem importar; exportar/PDF conforme regra atual de dados visíveis.

## Filtros

| Controle | Comportamento |
|----------|----------------|
| Pessoa da equipe | Igual ao atual (Todos + elegíveis). |
| Ano | Igual ao atual; ao mudar, mantém tipo de recorte e número de mês/trimestre. |
| Recorte | **Ano inteiro** (padrão) **ou** **Mês** **ou** **Trimestre**. Só um ativo. |
| Mês | Visível/útil só se recorte = Mês; jan–dez. |
| Trimestre | Visível/útil só se recorte = Trimestre; 1º–4º civis. |

Padrão na primeira carga da sessão: ano civil corrente + ano inteiro.

## Listagem, total, exportação

- Seguem pessoa + ano + recorte (mês ou trimestre ou ano inteiro).
- Estado vazio: **Nenhuma comissão encontrada** (ou equivalente sem a palavra bônus).
- Exportação CSV/PDF usa o conjunto **visível** (filtrado).

## Gráfico

- Título/legenda: vocabulário **Comissões**.
- Série: 12 meses do **ano** selecionado, **independente** do recorte da listagem.

## Modal

- Abre só para **Editar comissão**.
- Sem ramo “novo” na UI (sem `abrirCriar`).
- Campos: rótulo **Valor da comissão** (não Valor Bônus).
- Toasts/confirm: comissão/comissões.

## Importação CSV

- Título visível: **Importar comissões via CSV** (ou equivalente).
- Colunas de arquivo podem permanecer os nomes técnicos atuais (`valor_bonus`, …).

## Outras telas (rótulos)

| Tela | Antes | Depois |
|------|-------|--------|
| Dashboard (categoria) | Bônus | **Comissões** |
| Contas a Pagar sub `bonus` | Bônus | **Comissões** |
| Contas a Pagar legado `bonus` | Bônus (legado) | **Comissões (legado)** |
| Contas a Pagar sub `comissao` | Comissão | inalterado |
| Auditoria (filtro/célula) | Bonus | **Comissão** (valor interno da API continua `Bonus`) |

## Papéis

- `admin` e `visualizador`: mesma nomenclatura e mesmos filtros.
- `visualizador`: somente leitura (sem editar, excluir, importar), como hoje.

## Arquivos tocados (referência)

- `frontend/src/utils/paginasCatalogo.ts`
- `frontend/src/App.tsx` (key `bonus` → página; rota via catálogo `/comissoes`; **sem** rota `/bonus`)
- `frontend/src/components/navIcons.tsx`
- `frontend/src/pages/Bonus.tsx`
- `frontend/src/store/index.ts` (`usePageFilters`)
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Contas.tsx`
- `frontend/src/pages/Auditoria.tsx`
- `backend/app/services/categorias_contas.py` (rótulos `bonus` / legado)
- `backend/app/api/routes/bonus.py` e `backend/app/main.py` (textos visíveis / tag OpenAPI)
