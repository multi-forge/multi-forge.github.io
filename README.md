# MultiForge Link Gateway

Roteador permanente e universal de links e QR Codes físicos hospedado gratuitamente no GitHub Pages.

URL Principal: **[https://multi-forge.github.io](https://multi-forge.github.io)**

---

### O Que Esse Projeto Resolve

Quando você imprime um QR Code em uma placa de portão, balcão ou adesivo (ex: para motoboys darem entrada ou clientes verem o cardápio), o endereço impresso é fixo.
Se o servidor mudar de IP, se o túnel Tailscale / Cloudflare mudar de domínio ou se você migrar de infraestrutura:
- ❌ **Sem o Gateway**: A placa física é perdida e precisa ser reimpressa.
- ✅ **Com o Gateway**: O QR Code impresso aponta sempre para `https://multi-forge.github.io/motoboy`. Você apenas altera o destino no arquivo `routes.json` e a placa continua funcionando para sempre.

---

### Rotas Ativas

| Atalho Permanente | Destino Atual | Descrição |
| :--- | :--- | :--- |
| `https://multi-forge.github.io/motoboy` | `.../motoboy` | Check-in do motoboy no portão |
| `https://multi-forge.github.io/cozinha` | `.../cozinha` | Painel KDS da cozinha |
| `https://multi-forge.github.io/qrcode` | `.../qrcode` | Placa de impressão para o portão |
| `https://multi-forge.github.io/alexa` | `.../cozinha` | Atalho para Echo Show / Silk |
| `https://multi-forge.github.io/server` | `.../` | Acesso raiz ao servidor |

---

### Como Adicionar ou Alterar um Atalho

#### Método 1: Direto pelo Celular / Navegador (GitHub Web)
1. Abra o arquivo [`routes.json`](routes.json) neste repositório.
2. Clique no ícone de lápis (Editar).
3. Modifique ou adicione seu novo atalho (ex: `"cardapio": "https://..."`).
4. Clique em **Commit changes**.
5. O GitHub Actions (`rebuild.yml`) gera automaticamente a pasta estática e o QR Code em SVG! E o `404.html` já começa a redirecionar no mesmo segundo.

#### Método 2: Localmente via Terminal
```bash
# 1. Edite o routes.json
nano routes.json

# 2. Gere as páginas estáticas e os vetores QR
node build.js

# 3. Suba para o GitHub
git add -A
git commit -m "feat: nova rota"
git push
```

---

### Redirecionamento Dinâmico sem Repositório

Você também pode redirecionar para qualquer link na hora usando o parâmetro `?to=`:
- Exemplo: `https://multi-forge.github.io/?to=https://google.com`
O gateway processa o parâmetro e redireciona imediatamente.
