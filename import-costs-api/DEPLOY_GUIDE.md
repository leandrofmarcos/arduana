# GUIA DE DEPLOY - Import Costs API

## ✅ Pré-requisitos Verificados
- ✓ .NET 8 SDK instalado
- ✓ Build em modo Release funcionando perfeitamente
- ✓ Publish gerando arquivos corretamente
- ✓ Script PowerShell testado e validado
- ✓ Conexão FTP funcionando

## 📦 Arquivos de Deploy Criados

### 1. deploy.ps1
Script completo de build e deploy via FTP que executa:
- Limpeza de builds anteriores (`dotnet clean`)
- Build da aplicação (`dotnet build --configuration Release`)
- Publish dos arquivos (`dotnet publish`)
- Upload automático via FTP para `comex133.com.br/api`

### 2. clean_ftp.ps1
Script para limpar o diretório remoto antes de um novo deploy.
⚠️ Remove TODOS os arquivos do diretório da API no servidor.

### 3. web.config
Arquivo de configuração para hospedar a API em servidores IIS/Windows.

## 🚀 Como Fazer o Deploy

### Deploy Automático Completo (Recomendado)

Execute o script que faz TUDO automaticamente:

```powershell
cd c:\dev\prototipos-html\import-costs-api
.\deploy.ps1
```

**O script executa automaticamente:**
1. ✓ Clean - Limpeza de builds anteriores
2. ✓ Build - Compilação em modo Release
3. ✓ Publish - Geração de arquivos para produção
4. ✓ Preparação FTP - Criação de diretórios remotos
5. ✓ Limpeza - Remove arquivos antigos do servidor
6. ✓ Upload - Envia todos os arquivos com contador de progresso

**Exemplo de saída:**
```
DEPLOY AUTOMATICO - Import Costs API
=====================================
[1/6] Limpando builds anteriores...
[2/6] Compilando aplicacao...
[3/6] Publicando arquivos...
[4/6] Preparando FTP...
[5/6] Limpando diretorio remoto...
[6/6] Enviando arquivos...
[1/13 - 8%] appsettings.Development.json
[2/13 - 15%] appsettings.json
...
SUCESSO!
```

## 🧹 Limpeza do FTP

Se precisar limpar o servidor antes de fazer um novo deploy:

```powershell
.\clean_ftp.ps1
```

O script irá pedir confirmação antes de executar.

## 🔧 Configurações

### FTP (edite em deploy.ps1 e clean_ftp.ps1)
- **Host**: www.comex133.com.br
- **Usuário**: 304_leandro
- **Destino**: comex133.com.br/wwwroot/api (dentro de wwwroot)

### Aplicação
Após o deploy, a API estará disponível em:
- http://www.comex133.com.br/api

Endpoints disponíveis:
- `/weatherforecast` - Exemplo de Minimal API
- `/api/products` - CRUD de produtos
- `/api/products/{id}` - Operações com produto específico

## 📋 Checklist Pós-Deploy

1. ✓ Verificar se o servidor tem .NET 8 Runtime instalado
2. ✓ Verificar permissões de execução no servidor
3. ✓ Testar os endpoints após o deploy
4. ✓ Verificar logs em caso de erros

## ⚠️ Notas Importantes

- O script de deploy LIMPA o diretório remoto antes de fazer upload
- Certifique-se de ter backup antes de executar pela primeira vez
- O Swagger está configurado para funcionar apenas em ambiente Development
- Para produção, considere adicionar autenticação e HTTPS

## 🐛 Troubleshooting

### Erro de FTP
- Verificar credenciais no script
- Verificar conexão com o servidor
- Verificar permissões de escrita no diretório

### Erro de Build
- Executar `dotnet clean` antes do build
- Verificar se todas as dependências foram restauradas
- Verificar versão do .NET SDK

### API não responde após deploy
- Verificar se o servidor tem .NET 8 Runtime
- Verificar logs no servidor
- Verificar configurações do IIS/web.config
