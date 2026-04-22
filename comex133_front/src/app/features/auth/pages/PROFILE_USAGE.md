# 👤 Profile/Usuário - Feature de Gerenciamento de Conta

Página completa para o usuário visualizar informações básicas e alterar senha.

## 🎯 Funcionalidades

### 1. Visualizar Informações do Perfil
- **Usuário**: Nome de login do usuário
- **Email**: Email associado à conta (se disponível)
- **Papel**: Role do usuário (admin, cliente, despachante, maritimo)
- **ID**: Identificador único do usuário

### 2. Alterar Senha
- Validação de senha atual
- Confirmação de nova senha
- Requisito mínimo de 6 caracteres
- Nova senha diferente da atual
- Feedback em tempo real

## 📍 Como Acessar

### Via Menu Lateral
Clique no painel de usuário na sidebar (onde mostra seu nome e role)

### Via Header
Clique no nome de usuário no topo direito da aplicação

### Via URL Direta
Navegue para `/profile`

## 🎨 Identidade Visual

O componente mantém a identidade visual da aplicação:

- **Cards**: Mesmo padrão dos outros componentes
- **Botões**: Primário (gradiente) e Secundário (neutro)
- **Cores**: Usa CSS variables da aplicação
- **Notificações**: Toast animado com 4 tipos:
  - ✅ **Success** (verde)
  - ❌ **Error** (vermelho)
  - ⚠️ **Warning** (amarelo)
  - ℹ️ **Info** (azul)

## 🔐 Fluxo de Alteração de Senha

1. Usuário preenche os 3 campos obrigatórios:
   - Senha atual
   - Nova senha
   - Confirmação da nova senha

2. Sistema valida:
   - Todas as senhas preenchidas
   - Senha mínima de 6 caracteres
   - Nova senha diferente da atual
   - Nova senha = confirmação

3. Se validação passar:
   - Botão "Alterar Senha" habilitado
   - Clica para enviar

4. Simulação de requisição (1.5s):
   - Botão desabilita
   - Inputs desabilitados
   - Mostrar "Processando..."

5. Resposta "bem-sucedida":
   - Toast de sucesso aparece
   - Formulário limpo
   - Após 2s, logout automático
   - Redireciona para /login

## 📋 Estados do Formulário

### Desabilitado
- Quando carregando requisição
- Inputs ficam sem opacidade
- Botão "Alterar Senha" sem hover

### Habilitado
- Todos os campos preenchidos corretamente
- Botão com efeito hover
- Cursor pointer nos inputs

### Com Erro
- Mensagem vermelha abaixo dos inputs
- Exemplos:
  - "Verifique os campos. As senhas devem ter no mínimo 6 caracteres..."
  - "A nova senha deve ser diferente da senha atual."

## 🔔 Notificações

### Toast de Sucesso
```
✅ Senha alterada com sucesso! Você será desconectado em breve.
```
- Aparece por 4 segundos
- Posicionado em bottom-right
- Slide out animation
- Botão X para fechar manualmente

## 💾 Dados Simulados

**Importante**: Toda a funcionalidade de alteração de senha é FAKE:
- Não salva em nenhum lugar
- Não faz requisição HTTP real
- Apenas simula o fluxo UX/UI
- Prepara para integração futura com API

## 🔧 Personalização Futura

Para integrar com API real:

```typescript
// Criar service real
@Injectable()
export class UserService {
  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post('/api/users/change-password', {
      currentPassword,
      newPassword
    });
  }
}

// Usar no component
onChangePassword() {
  this.userService.changePassword(...)
    .subscribe(
      success => this.showNotification({type: 'success'}),
      error => this.showNotification({type: 'error'})
    );
}
```

## 📱 Responsivo

- **Desktop**: Formulário em 2 colunas para campos de entrada
- **Mobile**: Formulário em 1 coluna
- **Toast**: Adapta tamanho em telas pequenas

## 🎭 Interações

### Hover
- Botões mudam cor/sombra
- Campos de input ganham border azul ao focar

### Validação
- Botão fica desabilitado se formulário inválido
- Mensagem de erro desaparece quando campo é alterado
- Feedback instantâneo

### Loading
- Spinner implícito (texto muda para "Processando...")
- Inputs e botões desabilitados
- Previne múltiplos cliques

## 🚀 Exemplo de Uso

```typescript
// Usuário admin/admin clica em "Perfil"
// Vê informações: admin, admin@arduana.com, ADMIN, id: 1

// Preenche:
// - Senha atual: admin
// - Nova senha: senha123
// - Confirmar: senha123

// Clica "Alterar Senha"
// Vê loading por 1.5s
// Toast: "Senha alterada com sucesso! Você será desconectado em breve."
// Após 2s, logout automático
// Redireciona para /login
```

---

**Status**: ✅ Completo e funcional (fake)
