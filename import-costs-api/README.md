# Import Costs API

API RESTful desenvolvida em .NET 8 para gerenciamento de custos de importação.

## 🚀 Tecnologias

- .NET 8
- ASP.NET Core Web API
- Swagger/OpenAPI

## 📋 Pré-requisitos

- .NET 8 SDK instalado
- Visual Studio 2022, VS Code ou similar

## ▶️ Como executar

### Desenvolvimento

```bash
cd import-costs-api
dotnet run
```

A aplicação estará disponível em:
- HTTPS: https://localhost:7xxx
- HTTP: http://localhost:5xxx

**O Swagger UI será aberto automaticamente na raiz (/)** quando executar em modo Development.

### Build

```bash
dotnet build
```

### Publicação

```bash
dotnet publish -c Release -o bin\Publish
```

## 🚀 Deploy

O projeto inclui um script PowerShell completo que automatiza todo o processo de build e deploy:

```powershell
.\deploy.ps1
```

**O script faz:**
1. Limpeza de builds anteriores
2. Compilação em modo Release
3. Publish de arquivos de produção
4. Upload automático via FTP para `www.comex133.com.br/api`
5. Mostra progresso com contador de arquivos

**Saída esperada:**
```
DEPLOY AUTOMATICO - Import Costs API
[1/6] Limpando builds anteriores... OK
[2/6] Compilando aplicacao... OK
[3/6] Publicando arquivos... OK
[4/6] Preparando FTP... OK (cria: comex133.com.br/wwwroot/api)
[5/6] Limpando diretorio remoto... OK
[6/6] Enviando arquivos...
[1/13 - 8%] appsettings.Development.json
[2/13 - 15%] appsettings.json
...
SUCESSO!
```

Para limpar o FTP antes de fazer um novo deploy:
```powershell
.\clean_ftp.ps1
```

## 📚 Endpoints disponíveis

### Weather Forecast (Minimal API)
- `GET /weatherforecast` - Retorna previsão do tempo (exemplo)

### Products (Controller)
- `GET /api/products` - Lista todos os produtos
- `GET /api/products/{id}` - Busca produto por ID
- `POST /api/products` - Cria novo produto
- `PUT /api/products/{id}` - Atualiza produto existente
- `DELETE /api/products/{id}` - Remove produto

## 🧪 Testando a API

### Via Swagger UI
Acesse `https://localhost:7xxx` após executar a aplicação.

### Via cURL - Exemplos

**Listar produtos:**
```bash
curl https://localhost:7xxx/api/products
```

**Criar produto:**
```bash
curl -X POST https://localhost:7xxx/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Produto Novo","price":299.99,"category":"Eletrônicos"}'
```

**Atualizar produto:**
```bash
curl -X PUT https://localhost:7xxx/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Produto Atualizado","price":199.99,"category":"Eletrônicos"}'
```

**Deletar produto:**
```bash
curl -X DELETE https://localhost:7xxx/api/products/1
```

## 📁 Estrutura do Projeto

```
import-costs-api/
├── Controllers/
│   └── ProductsController.cs  # Controller de produtos (CRUD completo)
├── Properties/
│   └── launchSettings.json
├── appsettings.json
├── appsettings.Development.json
├── Program.cs                 # Configuração da aplicação
├── import-costs-api.csproj
├── deploy.ps1                 # Script de build e deploy via FTP
├── clean_ftp.ps1              # Script de limpeza do FTP
└── README.md
```

## 🔧 Configuração do Swagger

O Swagger está configurado para:
- Exibir na raiz da aplicação (`/`)
- Documentação completa da API
- Teste interativo de endpoints
- Informações de versão e descrição

## 📝 Notas

- Os dados dos produtos são armazenados em memória (lista estática)
- Em ambiente de produção, seria necessário implementar persistência de dados (banco de dados)
- A API inclui logs básicos usando ILogger
- HTTPS Redirection está habilitado
