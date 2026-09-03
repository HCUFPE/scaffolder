# Glossário e Conceitos Fundamentais

Este documento serve como material de consulta e apoio pedagógico para alunos e desenvolvedores entenderem os principais conceitos técnicos utilizados no **AppStart**.

---

### 1. BFF (Backend for Frontend)
Um padrão de arquitetura em que o backend atua como um mediador seguro para o frontend. Em vez de a SPA receber tokens JWT confidenciais e comunicá-los diretamente, o backend lida com a autenticação com o provedor e emite para o navegador apenas cookies HTTP-only opacos.

### 2. OIDC (OpenID Connect) & OAuth 2.0
- **OAuth 2.0:** Protocolo de autorização que permite conceder acesso a recursos sem expor a senha do usuário.
- **OpenID Connect (OIDC):** Camada de identidade construída sobre o OAuth 2.0 que padroniza como informações do usuário autenticado (`id_token`, perfil, e-mail) são trocadas de forma segura.

### 3. PKCE (Proof Key for Code Exchange)
Mecanismo de segurança para fluxos de autorização OIDC/OAuth que previne ataques de interceptação de código de autorização através da geração dinâmica de um *code_verifier* e *code_challenge*.

### 4. CSRF (Cross-Site Request Forgery)
Tipo de ataque no qual um site malicioso induz o navegador do usuário a executar ações indesejadas em uma aplicação web na qual o usuário está atualmente autenticado. No AppStart, a proteção é garantida por cookies `SameSite=Lax` e pelo `CsrfGuard` em todas as mutações (`POST`, `PUT`, `PATCH`, `DELETE`).

### 5. RFC 7807 (Problem Details for HTTP APIs)
Padrão internacional da IETF que define um formato JSON legível por humanos e estruturado para transportar detalhes de erros em respostas HTTP (contendo campos como `type`, `title`, `status`, `detail` e `instance`).

### 6. Remoção Lógica (*Soft Delete*)
Técnica de banco de dados onde registros "excluídos" não são apagados fisicamente da tabela (`DELETE FROM ...`), mas sim marcados com uma data/hora no campo `deletedAt`. Isso permite auditoria, recuperação de dados e integridade histórica.

### 7. Controle de Propriedade (*Ownership*)
Padrão de autorização onde cada registro pertence a um usuário específico (`ownerId`). Usuários comuns têm permissão restrita para visualizar e alterar somente os itens sob sua posse, enquanto administradores (`ADMIN`) possuem visão global.

### 8. TanStack React Query (Server State Management)
Biblioteca para React que automatiza o carregamento, cache, sincronização em segundo plano e invalidação de dados remotos vindos de APIs REST, eliminando a necessidade de gerenciar manualmente estados booleanos como `loading`, `error` e dados em `useEffect`.

### 9. Schemas Zod & Type Inference
Ferramenta de validação declarativa de schemas TypeScript que permite validar entradas do usuário em tempo de execução e inferir automaticamente os tipos TypeScript correspondentes com `z.infer<typeof schema>`.
