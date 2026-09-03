---
name: appstart-architecture-review
description: Auditoria de qualidade arquitetural, boas práticas pedagógicas e regras de segurança para o template AppStart.
---

# AppStart Architecture Review (Auditor de Conformidade Arquitetural)

Use esta skill para auditar e revisar códigos criados por alunos ou mantenedores, garantindo a preservação das invariantes arquiteturais do AppStart.

---

## 📋 Lista de Verificação de Auditoria

1. **Segurança de Autenticação & BFF:**
   - [ ] As credenciais, senhas ou tokens Keycloak trafegam no código do frontend? *(Resposta esperada: NÃO)*.
   - [ ] As mutações de dados (`POST`, `PUT`, `PATCH`, `DELETE`) estão protegidas por CSRF e origin validation?
   - [ ] As rotas privadas verificam o papel do usuário no backend (`RolesGuard`) e não apenas na UI?

2. **Governança de Dados & Persistência:**
   - [ ] Todas as novas entidades do Prisma possuem `id UUID`, `ownerId UUID` e `deletedAt DateTime?`?
   - [ ] As exclusões usam *Soft Delete* (`deletedAt: new Date()`) em vez de exclusão física?
   - [ ] As migrations criadas são versionadas com timestamp e utilizam consultas SQL numeradas?

3. **Contrato de API & Tipagem:**
   - [ ] Todos os DTOs do NestJS utilizam `class-validator` e anotações `@ApiProperty()`?
   - [ ] O script `pnpm api:check` roda sem divergências?

4. **Experiência do Usuário (UX):**
   - [ ] As telas React tratam os 4 estados principais: Carregamento (*Loading*), Vazio (*Empty*), Erro (*Error*) e Sucesso (*Success*)?
   - [ ] Formulários utilizam validação por schema Zod com inferência de tipo?
   - [ ] Erros da API respeitam o padrão RFC 7807 (Problem Details)?

5. **Testes e Build:**
   - [ ] Todos os testes unitários do backend e frontend passam (`pnpm check:all`)?
