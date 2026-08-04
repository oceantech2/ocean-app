# 🪟 Ocean App - Guia Rápido Windows

## 1️⃣ Extrair o ZIP

1. Baixe `ocean-app.zip`
2. Clique direito > **Extrair para...**
3. Escolha `C:\dev\`

Resultado:
```
C:\dev\ocean-app\
```

## 2️⃣ Setup Automático (Recomendado)

**Opção A: CMD (Linha de Comando)**

```bash
cd C:\dev\ocean-app
setup.bat
```

**Opção B: PowerShell**

```bash
cd C:\dev\ocean-app
powershell -ExecutionPolicy Bypass -File setup.ps1
```

Isso vai:
- ✅ Criar venv do Python
- ✅ Instalar dependências do backend
- ✅ Instalar dependências do frontend
- ✅ Criar arquivo .env

## 3️⃣ Rodar a Aplicação

**Terminal 1 - Backend:**
```bash
cd C:\dev\ocean-app\backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd C:\dev\ocean-app\frontend
npm run dev
```

## ✅ Pronto!

- Acesse: **http://localhost:5173**
- Usuário: qualquer nome
- Senha: **123456**

---

## 🐳 Com Docker (Opcional)

Se tiver Docker Desktop instalado:

```bash
cd C:\dev\ocean-app
docker-compose up -d
```

Depois acesse normalmente em http://localhost:5173

---

## ⚠️ Problemas Comuns

### Python não encontrado
- Instale: https://www.python.org/downloads/
- Marque "Add Python to PATH" durante instalação
- Reinicie o terminal

### Node.js não encontrado
- Instale: https://nodejs.org/ (versão LTS)
- Reinicie o terminal

### Erro de permissão no PowerShell
```bash
powershell -ExecutionPolicy Bypass -File setup.ps1
```

### Porta 5173/8000 já em uso
```bash
# Mude a porta no frontend/vite.config.ts
# Ou mate os processos usando as portas
```

---

## 🚀 Próximo Passo

Assim que conseguir rodar, pode chamar **Claude Code** para:
1. Implementar páginas faltantes
2. Adicionar funcionalidades
3. Deploy em VPS

Bom desenvolvimento! 🎉
