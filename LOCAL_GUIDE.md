# Guia de Execução Local 🚀

Como o teste no Railway expirou, você pode rodar todo o projeto no seu próprio computador. Isso é ótimo porque o robô não terá "amnésia" (os dados serão salvos no seu disco) e você não terá custos.

## Passo 1: Configurar Variáveis de Ambiente
Crie um arquivo chamado `.env` dentro da pasta `server/` e coloque o seguinte conteúdo:

```env
PORT=3001
OPENROUTER_API_KEY=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
GEMINI_API_KEY=AIzaSyCaLBQcX54A9FUW1biKbS7WU8nvBsEThHI
PUBLIC_URL=http://localhost:3001
MP_ACCESS_TOKEN=SEU_ACCESS_TOKEN_DO_MERCADO_PAGO
```

## Passo 2: Instalar Dependências
Abra o terminal na pasta raiz do projeto e execute:

### Servidor (Backend)
```powershell
cd server
npm install
```

### Cliente (Frontend)
```powershell
cd ../client
npm install
```

## Passo 3: Rodar o Projeto
Você precisará de dois terminais abertos:

**Terminal 1 (Backend):**
```powershell
cd server
node index.js
```

**Terminal 2 (Frontend):**
```powershell
cd client
npm run dev
```

## Passo 4: Acessar o Painel
1. Abra o navegador em `http://localhost:5173`.
2. Faça login com seu Google.
3. Escaneie o QR Code que aparecerá na tela.

---

### Notas Importantes:
- **Persistência**: O arquivo `database.json` será criado na pasta `server/`. Ele contém todas as configurações e não será apagado.
- **Mercado Pago**: Para os pagamentos funcionarem de verdade (receber a confirmação automática), você precisaria usar algo como o `ngrok` para expor o seu `localhost` para a internet. Caso contrário, você terá que aprovar os usuários manualmente pelo Painel Admin.
- **Chrome**: O robô usará o navegador em modo "oculto" (headless). Se quiser ver o navegador abrindo, mude para `headless: false` no arquivo `server/index.js` (linha 140).
