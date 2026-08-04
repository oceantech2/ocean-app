# Como Usar Ocean App com Claude Code

## 📌 Antes de Começar

1. **Clone/copie a estrutura:**
   ```bash
   cd seu-diretorio
   cp -r ocean-app .
   ```

2. **Setup Inicial:**
   ```bash
   # Backend
   cd ocean-app/backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Rodar Localmente:**
   ```bash
   # Terminal 1 - Backend
   cd ocean-app/backend
   source venv/bin/activate
   uvicorn app.main:app --reload

   # Terminal 2 - Frontend
   cd ocean-app/frontend
   npm run dev
   ```

## 🤖 Usar com Claude Code

### Estrutura Pronta para Claude Trabalhar

O projeto está dividido em **módulos** que Claude pode completar independentemente:

```
ocean-app/
├── backend/
│   ├── app/api/routes/
│   │   ├── ✅ auth.py              (Pronto)
│   │   ├── ✅ colaboradores.py     (Pronto)
│   │   ├── ✅ nfs.py               (Pronto)
│   │   ├── ✅ contas.py            (Pronto)
│   │   ├── ✅ bonus.py             (Pronto)
│   │   ├── ✅ ferias.py            (Pronto)
│   │   ├── ✅ dh.py                (Pronto)
│   │   └── ✅ relatorios.py        (Pronto)
│   └── app/
│       ├── ✅ main.py              (Pronto)
│       ├── ✅ config.py            (Pronto)
│       ├── ✅ database.py          (Pronto)
│       ├── ✅ models/__init__.py   (Pronto)
│       └── ✅ schemas.py           (Pronto)
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── ✅ Dashboard.tsx     (Funcional)
        │   ├── ❌ NFs.tsx           (TODO)
        │   ├── ❌ Colaboradores.tsx (TODO)
        │   ├── ❌ Contas.tsx        (TODO)
        │   ├── ❌ Bonus.tsx         (TODO)
        │   ├── ❌ Ferias.tsx        (TODO)
        │   ├── ❌ DH.tsx            (TODO)
        │   └── ❌ Relatorios.tsx    (TODO)
        ├── components/
        │   ├── ✅ Login.tsx         (Pronto)
        │   └── ✅ Layout.tsx        (Pronto)
        ├── ✅ services/api.ts       (Pronto)
        ├── ✅ store/index.ts        (Pronto)
        ├── ✅ types/index.ts        (Pronto)
        └── ✅ App.tsx               (Pronto)
```

## 📋 Tarefas por Prioridade

### Phase 1: Páginas Principais (Semana 1)

**NFs.tsx** - Gestão de Notas Fiscais
```
Features:
- Listar NFs com paginação
- Filtrar por mês/ano/status
- Cores: verde (paga), amarelo (vencida), vermelho (pendente)
- Botões: Criar, Editar, Deletar, Marcar como Paga
- Totais: Bruto Pago, Líquido Pago, A Receber
- Modal para criar/editar NF
```

**Colaboradores.tsx** - Gestão de Colaboradores
```
Features:
- CRUD completo
- Listar apenas ativos por padrão
- Filtro por cargo
- Modal para criar/editar
- Marcar como desligado (soft delete)
- Validar CPF
```

**Contas.tsx** - Contas a Pagar
```
Features:
- Agrupar por centro de custo
- Filtro por status (pago/pendente)
- Marcar como pago com data
- Totais por centro de custo
- Calcular juros se vencido
```

### Phase 2: Funcionalidades Complexas (Semana 2)

**Bonus.tsx** - Cálculo de Bônus
```
Features:
- Listar bônus por colaborador/mês
- Calcular automático: (faturamento_liquido * percentual) por etapa
- Editar percentuais na mão
- Agrupar 1-12 meses
- Gráfico de evolução
```

**Ferias.tsx** - Controle de Férias
```
Features:
- Criar registro por colaborador/ano
- Dias direito vs dias tirados
- Aprovar/rejeitar
- Aviso quando próximo do vencimento (31 de janeiro)
```

**DH.tsx** - Documento de Horas
```
Features:
- Form para preenchimento (empresa, posição, tipo)
- Gerar assunto automático
- Enviar email para financeiro e CEO
- Listar enviados no mês
- Filtrar por colaborador
```

### Phase 3: Relatórios (Semana 3)

**Relatorios.tsx** - Dashboard Avançado
```
Features:
- Gráficos: Faturamento, Bonus Mensal, Placements, Impostos
- Filtros por ano/período
- Export PDF
- Tabelas de detalhamento
- Comparativo período anterior
```

## 🔄 Workflow com Claude Code

### Passo 1: Abrir no Claude Code
```bash
# No seu terminal, abra o Claude Code apontando para o diretório
code-claude /home/seu-usuario/ocean-app
```

### Passo 2: Instruir Claude para Implementação

**Exemplo 1 - Implementar NFs Page:**
```
"Implemente a página src/pages/NFs.tsx com:

1. Listar todas as NFs com filtros por mês, ano e status
2. Mostrar tabela com colunas: NF, Cliente, Valor Bruto, Valor Líquido, Status, Data Emissão
3. Cores: Verde (paga), Amarelo (vencida), Vermelho (pendente)
4. Botões de ação: Editar, Deletar, Marcar como Paga
5. Total inferior com: Total Bruto Pago, Total Líquido Pago, Total Pendente, Total a Receber (até dia 10 do mês seguinte)
6. Modal para criar/editar NF com todos os campos
7. Usar componentes do Recharts se necessário
8. Validar datas (dd/mm/aaaa)"
```

**Exemplo 2 - Adicionar Email Service:**
```
"Adicione um email service no backend:

1. Criar app/services/email_service.py
2. Função send_dh(dh: DH) que envia email em HTML
3. Usar nodemailer para SMTP (ou Python smtplib)
4. Chamar ao criar novo DH em app/api/routes/dh.py
5. Assunto já está pronto em app/models.py
6. Enviar para: financeiro@empresa.com e ceo@empresa.com"
```

### Passo 3: Claude Implementará

Claude vai:
1. Ler a estrutura existente
2. Entender os tipos/schemas
3. Implementar baseado no padrão existente
4. Fazer git commit ou criar arquivos novos
5. Testar (se possível)

## 🎯 Checklist de Implementação

### Backend
- [ ] Email service funcionando
- [ ] Autenticação real (usuários no BD)
- [ ] Validações de CPF/CNPJ
- [ ] Cálculo automático de bônus
- [ ] Export PDF/Excel
- [ ] Logs de auditoria
- [ ] Cache com Redis

### Frontend
- [ ] Todas as páginas implementadas
- [ ] Filtros funcionando
- [ ] Paginação
- [ ] Validações de input
- [ ] Loading states
- [ ] Error handling
- [ ] Responsivo (mobile-friendly)

### Deploy
- [ ] Docker pronto
- [ ] .env.example completo
- [ ] Migrations com Alembic
- [ ] Setup instructions
- [ ] Deploy no Railway funcionando
- [ ] HTTPS configurado

## 💡 Dicas para Claude

1. **Reutilizar padrões:**
   - Todos os CRUDs seguem o mesmo padrão em routes/
   - Todos os components usam a mesma estrutura
   - Use tipos do types/index.ts

2. **Testar incrementalmente:**
   - Complete 1 página por vez
   - Teste no navegador
   - Depois mova para a próxima

3. **Seguir convenções:**
   - Nomes de funções em português (mesma linguagem do resto)
   - Mesmos nomes de campos em todas as camadas
   - Mesmas cores e componentes

4. **Pedir ajuda clara:**
   - "Implemente [feature] seguindo o padrão de [route_existente]"
   - "Adicione validação para [campo]"
   - "Crie endpoint que [descrição]"

## 📞 Suporte

Se algo quebrar:
1. Verifique logs do backend: `docker logs ocean_backend`
2. Verifique console do navegador (F12)
3. Rode migrations: `alembic upgrade head`
4. Reinicie services: `docker-compose restart`

---

**Bom desenvolvimento! O projeto está pronto para ser expandido com Claude Code.** 🚀
