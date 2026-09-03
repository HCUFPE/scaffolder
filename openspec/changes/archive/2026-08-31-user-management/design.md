## Context

O Keycloak é a fonte de verdade para identidade, credenciais e roles de realm. A aplicação mantém um perfil local vinculado ao `sub` do provedor para autorização, estado local e relações de domínio. Essa separação evita senhas no banco da aplicação sem obrigar módulos de negócio a consultar o Keycloak a cada requisição.

## Goals / Non-Goals

**Goals:**
- Vincular cada perfil local a exatamente uma identidade Keycloak por `keycloakUserId` único.
- Manter e-mail normalizado, nome, snapshot de papel e estado ativo local.
- Permitir administração básica pela aplicação com provisionamento correspondente no Keycloak.
- Permitir autoatendimento controlado sem alteração de papéis ou identidade protegida.
- Bloquear acesso quando o perfil estiver desativado localmente.

**Non-Goals:**
- Armazenar ou verificar senhas na aplicação.
- Implementar cadastro público ou um segundo diretório de identidades.
- Implementar gestão avançada de organizações ou multi-tenant.

## Decisions

- `keycloakUserId` armazena a claim OIDC `sub`, é obrigatório e possui restrição única.
- O e-mail é normalizado antes de persistência e comparação e também possui restrição única.
- Keycloak é a fonte de verdade para credenciais e roles; a aplicação mantém `roleSnapshot` com o mapeamento `admin -> ADMIN` e `user -> USER`.
- O estado `isActiveLocal` é um bloqueio soberano da aplicação: um usuário válido no Keycloak não acessa a aplicação se estiver desativado localmente.
- A criação administrativa provisiona primeiro a identidade no Keycloak e depois o perfil local. Falhas parciais devem ser compensadas quando seguro ou registradas como erro reconciliável, sem retornar sucesso enganoso.
- Credenciais iniciais e recuperação de senha usam fluxos gerenciados pelo Keycloak; senhas não são persistidas nem registradas pela aplicação.
- Alterações administrativas de papel e status são coordenadas com o Keycloak e refletidas no perfil local.
- Atualizações de nome ou e-mail devem definir explicitamente o sistema autoritativo e evitar divergência silenciosa; na baseline, operações da aplicação sincronizam ambos os lados.
- Cadastro público permanece desabilitado no realm. Contas são criadas por administradores ou por processos externos futuros fora deste escopo.

## Risks / Trade-offs

- **Falha parcial entre Keycloak e PostgreSQL** → Usar operações idempotentes, compensação e logs correlacionados para reconciliação.
- **Divergência de e-mail ou papel** → Sincronizar no login e nas operações administrativas, preservando restrições locais.
- **Indisponibilidade da Admin API** → Falhar de forma diagnosticável sem gravar estado local como concluído.
- **Mass assignment** → Usar DTOs explícitos e impedir mudanças de `keycloakUserId`, papel e estado por autoatendimento.
- **Remoção física causar perda de rastreabilidade** → Preferir desativação local e no provedor.
