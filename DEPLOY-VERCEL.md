# Deploy da vitrine UAUVEXA

## 1. Subir para o GitHub

Crie um repositorio no GitHub chamado, por exemplo:

```text
uauvexa-store
```

O repositorio local e o primeiro commit ja foram criados pelo Codex.

Depois de criar o repositorio vazio no GitHub, rode nesta pasta:

```powershell
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/uauvexa-store.git
git push -u origin main
```

## 2. Importar na Vercel

1. Acesse a Vercel.
2. Clique em `Add New > Project`.
3. Importe o repositorio `uauvexa-store`.
4. Framework Preset: `Other`.
5. Build Command: deixe vazio.
6. Output Directory: deixe vazio.
7. Clique em `Deploy`.

## 3. Variaveis da Nuvemshop

Na Vercel, entre em:

```text
Project > Settings > Environment Variables
```

Adicione:

```text
NUVEMSHOP_STORE_ID=6644013
NUVEMSHOP_ACCESS_TOKEN=token_da_nuvemshop
NUVEMSHOP_USER_AGENT=UAUVEXA Headless Store (uauvexa@gmail.com)
```

Depois clique em `Redeploy`.

## 4. Dominio

Quando a vitrine estiver aprovada:

1. Aponte `www.uauvexa.com.br` para a Vercel.
2. Mantenha o checkout/produtos da Nuvemshop funcionando em paralelo.
3. Os botoes de compra podem direcionar para a Nuvemshop ate ativarmos criacao de carrinho via API.
