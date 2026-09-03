import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ActionFeedback, EmptyState, ErrorState, LoadingState } from '../components/ui/state-feedback';
import {
  userControllerCreate,
  userControllerList,
  userControllerSetStatus,
} from '../lib/api-client';
import type { ManagedUserDto, PaginatedUsersResponseDto } from '../lib/api-client/models';

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve possuir ao menos 2 caracteres.').max(120),
  email: z.string().email('Informe um e-mail válido.').max(254),
  role: z.enum(['ADMIN', 'USER']),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['users', { page, search }],
    queryFn: async () => {
      const res = await userControllerList({
        page,
        pageSize: 10,
        ...(search ? { search } : {}),
      });
      return res.data;
    },
  });

  const paginatedData = response && 'data' in (response as PaginatedUsersResponseDto)
    ? (response as PaginatedUsersResponseDto)
    : null;

  const users: ManagedUserDto[] = paginatedData?.data || [];
  const meta = paginatedData?.meta || { page: 1, pageSize: 10, total: 0, totalPages: 1 };

  const statusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await userControllerSetStatus(id, { isActive });
      return res.data;
    },
    onSuccess: (data) => {
      const updatedUser = data && 'name' in (data as ManagedUserDto) ? (data as ManagedUserDto) : null;
      setFeedback({
        type: 'success',
        message: updatedUser
          ? `Status do usuário "${updatedUser.name}" atualizado para ${updatedUser.isActive ? 'Ativo' : 'Inativo'}.`
          : 'Status do usuário atualizado.',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { detail?: string })?.detail ||
        (err as { message?: string })?.message ||
        'Não foi possível atualizar o status do usuário.';
      setFeedback({ type: 'error', message: msg });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset: resetForm,
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'USER',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserFormValues) => {
      const res = await userControllerCreate(data);
      return res.data;
    },
    onSuccess: (data) => {
      const newUser = data && 'name' in (data as ManagedUserDto) ? (data as ManagedUserDto) : null;
      setFeedback({
        type: 'success',
        message: newUser
          ? `Usuário "${newUser.name}" criado e provisionado com sucesso!`
          : 'Usuário criado com sucesso!',
      });
      setIsCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { detail?: string })?.detail ||
        (err as { message?: string })?.message ||
        'Não foi possível criar o usuário.';
      setFeedback({ type: 'error', message: msg });
    },
  });

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query')?.toString().trim() || '';
    setSearch(query);
    setPage(1);
  };

  const handleCreateSubmit = (data: CreateUserFormValues) => {
    setFeedback(null);
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provisionamento, listagem e controle de acesso integrado ao serviço de identidade.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {feedback && (
        <ActionFeedback
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={onSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="query"
                defaultValue={search}
                placeholder="Buscar por nome ou e-mail..."
                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              Buscar
            </Button>
            {search && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
              >
                Limpar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Content Table / States */}
      {isLoading ? (
        <LoadingState message="Carregando lista de usuários..." />
      ) : isError ? (
        <ErrorState
          title="Erro ao carregar usuários"
          message="Não foi possível consultar a lista de usuários."
          onRetry={() => refetch()}
        />
      ) : users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description={
            search
              ? `Nenhum resultado corresponde à busca "${search}".`
              : 'Não há perfis cadastrados no sistema.'
          }
          action={
            search ? (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Limpar filtro
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                Cadastrar primeiro usuário
              </Button>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Nome</th>
                  <th className="py-3.5 px-4">E-mail</th>
                  <th className="py-3.5 px-4">Papel</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {users.map((item: ManagedUserDto) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={item.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {item.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={item.isActive ? 'success' : 'destructive'}>
                        {item.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={item.isActive ? 'outline' : 'secondary'}
                        className="text-xs h-8 gap-1.5"
                        isLoading={statusMutation.isPending && statusMutation.variables?.id === item.id}
                        onClick={() =>
                          statusMutation.mutate({ id: item.id, isActive: !item.isActive })
                        }
                      >
                        {item.isActive ? (
                          <>
                            <UserX className="h-3.5 w-3.5 text-red-500" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5 text-green-500" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div>
              Total de <strong>{meta.total}</strong> usuários (Página {meta.page} de {meta.totalPages})
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-medium">{meta.page}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Novo Usuário
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              O usuário será cadastrado no serviço de identidade e terá o perfil sincronizado localmente.
            </p>

            <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
              <Input
                label="Nome Completo"
                placeholder="Ex.: Ada Lovelace"
                {...register('name')}
                error={formErrors.name?.message}
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="Ex.: ada@example.com"
                {...register('email')}
                error={formErrors.email?.message}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Papel de Acesso
                </label>
                <select
                  {...register('role')}
                  className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="USER">USER (Aluno / Usuário Comum)</option>
                  <option value="ADMIN">ADMIN (Administrador)</option>
                </select>
                {formErrors.role?.message && (
                  <span className="text-xs text-red-500 font-medium">
                    {formErrors.role.message}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={createMutation.isPending}
                >
                  Criar e Provisionar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
