# ADR-004: Gerenciamento de Estado Remoto com TanStack Query e Formulários com Zod + React Hook Form

## Status
Aceito

## Contexto
Aplicações React frequentemente sofrem com complexidade desnecessária em gerenciamento de estado quando misturam *estado de servidor* (dados da API) com *estado de interface* (modais abertos, abas ativas). Além disso, a validação manual de formulários resulta em código verboso e propenso a erros.

## Decisão
Adotamos:
1. **TanStack React Query:** Para gerenciar todo o ciclo de vida dos dados remotos (busca, cache, revalidação em segundo plano, invalidação pós-mutação e controle de loading/error).
2. **React Hook Form + Zod:** Para gerenciamento e validação de formulários, com inferência estática de tipos TypeScript a partir dos schemas Zod (`z.infer<typeof schema>`).

## Consequências
### Positivas
- **Cache Inteligente e Consistência:** Invalidação simples com `queryClient.invalidateQueries({ queryKey: ['...'] })` garante que telas sincronizem automaticamente após operações de escrita.
- **Performance e Renderizações Mínimas:** O React Hook Form utiliza formulários não-controlados com subscrições isoladas, evitando re-renderizações a cada caractere digitado.
- **Validação Declarativa:** Schemas Zod tornam regras de negócio do formulário legíveis e reutilizáveis entre frontend e testes.

### Negativas / Mitigações
- Curva de aprendizado inicial sobre `queryKeys` e invalidação, mitigada pelos exemplos claros no módulo de referência `tasks`.
