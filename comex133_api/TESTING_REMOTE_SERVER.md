# Guia de Teste - Comex133 API no Servidor Remoto

## Servidor Remoto
**URL Base:** `http://www.viaveritascomex.com.br/api`

## Configuração

### 1. Requisitos
- VS Code com extensão **REST Client** instalada
- Arquivo `comex133_api.http` na raiz do projeto

### 2. Credenciais Padrão para Testes
```
E-mail:  admin@comex133.com.br
Senha:   Pa$$word
```

> ⚠️ **IMPORTANTE:** A API requer autenticação JWT. Cada requisição (exceto login) precisa de um token Bearer válido.

## Workflow de Testes

### Passo 1: Health Check
Verifique se a API está online:
```
GET http://www.viaveritascomex.com.br/api/health
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-16T10:30:00Z",
    "databaseStatus": "connected"
  },
  "message": "Health check realizado com sucesso",
  "statusCode": 200
}
```

### Passo 2: Login
Autentique-se para obter tokens:
```
POST http://www.viaveritascomex.com.br/api/auth/login
Content-Type: application/json

{
  "email": "admin@comex133.com.br",
  "senha": "Pa$$word"
}
```

**Resposta esperada (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "email": "admin@comex133.com.br",
      "name": "Administrador",
      "roles": ["Admin"]
    }
  },
  "message": "Login realizado com sucesso",
  "statusCode": 200
}
```

**Ações após login:**
1. Copie o valor do campo `data.accessToken`
2. Cole em `@accessToken` no arquivo `comex133_api.http`
3. Copie o valor do campo `data.refreshToken`
4. Cole em `@refreshToken` no arquivo `comex133_api.http`

### Passo 3: Testes Autenticados

Agora você pode testar endpoints protegidos. Substitua `{{accessToken}}` pelo token copiado:

#### 3.1 Obter dados do usuário autenticado
```
GET http://www.viaveritascomex.com.br/api/auth/me
Authorization: Bearer {{accessToken}}
```

#### 3.2 Listar clientes
```
GET http://www.viaveritascomex.com.br/api/clientes?page=1&pageSize=10
Authorization: Bearer {{accessToken}}
```

#### 3.3 Listar solicitações de orçamento
```
GET http://www.viaveritascomex.com.br/api/solicitacoes-orcamento?page=1&pageSize=10
Authorization: Bearer {{accessToken}}
```

#### 3.4 Listar portos
```
GET http://www.viaveritascomex.com.br/api/portos-origem?page=1&pageSize=10
Authorization: Bearer {{accessToken}}

GET http://www.viaveritascomex.com.br/api/portos-destino?page=1&pageSize=10
Authorization: Bearer {{accessToken}}
```

## Endpoints Disponíveis

### Authentication (`/api/auth`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|-------------|-----------|
| `POST` | `/login` | ❌ Não | Autentica usuário e retorna tokens |
| `POST` | `/refresh` | ❌ Não | Renova access token com refresh token |
| `POST` | `/logout` | ✅ Sim | Revoga o refresh token (logout) |
| `GET` | `/me` | ✅ Sim | Retorna dados do usuário autenticado |

### Health (`/api/health`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|-------------|-----------|
| `GET` | `/` | ❌ Não | Verifica saúde da API e conexão com BD |

### Business Entities
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|-------------|-----------|
| `GET` | `/clientes` | ✅ Sim | Lista cliente com paginação |
| `GET` | `/importadores` | ✅ Sim | Lista importadores |
| `GET` | `/portos-origem` | ✅ Sim | Lista portos de origem |
| `GET` | `/portos-destino` | ✅ Sim | Lista portos de destino |
| `GET` | `/solicitacoes-orcamento` | ✅ Sim | Lista solicitações de orçamento |
| `GET` | `/despachantes` | ✅ Sim | Lista despachantes |
| `GET` | `/usuarios` | ✅ Sim | Lista usuários |

## Troubleshooting

### ❌ "401 Unauthorized"
**Causa:** Token expirado ou inválido
**Solução:** Execute o login novamente e atualize o token

### ❌ "403 Forbidden"
**Causa:** Usuário não tem permissão para acessar o recurso
**Solução:** Verifique as roles do usuário

### ❌ "500 Internal Server Error"
**Causa:** Erro no servidor
**Solução:** 
- Verifique os logs do servidor remoto
- Confirme que a API está em execução
- Valide a sintaxe da requisição

### ❌ "Connection refused"
**Causa:** Servidor remoto está indisponível
**Solução:**
- Verifique a conectividade: `ping www.viaveritascomex.com.br`
- Confirme que a URL está correta
- Aguarde a disponibilidade do servidor

## Usando o Arquivo comex133_api.http

### No VS Code
1. Abra `comex133_api.http`
2. Clique em `Send Request` acima de qualquer bloco para executar
3. A resposta aparecerá em um painel à direita

### Alternativa: RestClient Extensão
A extensão **REST Client** fornece comentários úteis:
- `###` separa diferentes requisições
- `@nomeVar = valor` define variáveis reutilizáveis
- Histórico de requisições é mantido

## Observações Importantes

1. **Segurança:** Nunca commite tokens ou credenciais no repositório
2. **Expiração:** Access tokens expiram a cada 60 minutos
3. **Refresh:** Use o refresh token para obter um novo access token sem fazer login novamente
4. **CORS:** A API está configurada para aceitar requisições de `http://www.viaveritascomex.com.br`

## Próximos Passos

Após validar que a API está respondendo corretamente:

1. **Frontend:** Atualize as chamadas da API Angular para usar `http://www.viaveritascomex.com.br/api`
2. **CI/CD:** Configure testes automáticos com as credenciais corretas
3. **Monitoramento:** Configure logs e alertas para monitorar a saúde da API

---

**Última atualização:** 2026-04-16  
**Versão da API:** 1.0 (Phase 4 - Solicitações Orçamento)
