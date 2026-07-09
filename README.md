# UAUVEXA Headless Store

Vitrine propria da UAUVEXA usando a Nuvemshop como motor de produtos e checkout.

## Rodar localmente

```powershell
npm run dev
```

Abra:

```text
http://localhost:4177
```

No Windows, tambem da para abrir:

```text
abrir-site-local.bat
```

## Integracao com Nuvemshop

Hoje o site funciona com catalogo demo e imagens reais. Para puxar produtos reais, defina:

```powershell
$env:NUVEMSHOP_STORE_ID="6644013"
$env:NUVEMSHOP_ACCESS_TOKEN="SEU_ACCESS_TOKEN"
$env:NUVEMSHOP_USER_AGENT="UAUVEXA Headless Store (uauvexa@gmail.com)"
npm run dev
```

O token nao deve ficar no navegador. Ele fica somente no servidor (`server.js`), que expoe `/api/products` para o site.

## Deploy na Vercel

1. Suba esta pasta para um repositorio no GitHub.
2. Na Vercel, clique em `Add New > Project`.
3. Importe o repositorio.
4. Configure:
   - Framework Preset: `Other`
   - Build Command: deixe vazio
   - Output Directory: deixe vazio
5. Em `Environment Variables`, adicione:
   - `NUVEMSHOP_STORE_ID`
   - `NUVEMSHOP_ACCESS_TOKEN`
   - `NUVEMSHOP_USER_AGENT`
6. Clique em `Deploy`.

## Proximo passo tecnico

- Criar app privada/externa no portal de parceiros da Nuvemshop.
- Gerar `access_token` da loja com permissao `Read products`.
- Trocar o botao de compra para criar carrinho/checkout oficial ou mandar para URL do produto na Nuvemshop.
- Publicar o site em Vercel, Render, Railway ou hospedagem Node.

Veja tambem:

```text
DEPLOY-VERCEL.md
```
