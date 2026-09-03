import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  ListTodo,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ActionFeedback, EmptyState, ErrorState, LoadingState } from '../components/ui/state-feedback';
import {
  tasksControllerCreate,
  tasksControllerFindAll,
  tasksControllerRemove,
  tasksControllerUpdate,
} from '../lib/api-client';
import type {
  PaginatedTasksResponseDto,
  TaskDto,
  TaskDtoPriority,
  TaskDtoStatus,
} from '../lib/api-client/models';

const taskFormSchema = z.object({
  title: z
    .string()
    .min(3, 'O título deve ter no mínimo 3 caracteres.')
    .max(150, 'O título deve ter no máximo 150 caracteres.'),
  description: z.string().max(1000, 'Máximo de 1000 caracteres.').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const editTaskFormSchema = taskFormSchema.extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
});

type EditTaskFormValues = z.infer<typeof editTaskFormSchema>;

export function TasksPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const priorityFilter = searchParams.get('priority') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Update URL Search Params helper
  const updateParams = (newParams: Record<string, string | number | undefined>) => {
    const updated = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(newParams)) {
      if (value === undefined || value === '') {
        updated.delete(key);
      } else {
        updated.set(key, String(value));
      }
    }
    setSearchParams(updated);
  };

  // Fetch Tasks with TanStack Query
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', { page, search, statusFilter, priorityFilter, sortBy, sortOrder }],
    queryFn: async () => {
      const res = await tasksControllerFindAll({
        page,
        pageSize: 8,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter as any } : {}),
        ...(priorityFilter ? { priority: priorityFilter as any } : {}),
        sortBy: sortBy as any,
        sortOrder,
      });
      return res.data;
    },
  });

  const paginatedData = response && 'data' in (response as PaginatedTasksResponseDto)
    ? (response as PaginatedTasksResponseDto)
    : null;

  const tasks: TaskDto[] = paginatedData?.data || [];
  const meta = paginatedData?.meta || { page: 1, pageSize: 8, total: 0, totalPages: 1 };

  // Form for Creating
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const res = await tasksControllerCreate({
        title: data.title,
        description: data.description || undefined,
        priority: data.priority as any,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const created = data && 'title' in (data as TaskDto) ? (data as TaskDto) : null;
      setFeedback({
        type: 'success',
        message: created ? `Tarefa "${created.title}" criada com sucesso!` : 'Tarefa criada com sucesso!',
      });
      setIsCreateOpen(false);
      resetCreate();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { detail?: string })?.detail ||
        (err as { message?: string })?.message ||
        'Não foi possível criar a tarefa.';
      setFeedback({ type: 'error', message: msg });
    },
  });

  // Edit / Status Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        priority?: TaskDtoPriority;
        status?: TaskDtoStatus;
        dueDate?: string;
      };
    }) => {
      const res = await tasksControllerUpdate(id, data as any);
      return res.data;
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Tarefa atualizada com sucesso!' });
      setEditingTask(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { detail?: string })?.detail ||
        (err as { message?: string })?.message ||
        'Falha ao atualizar a tarefa.';
      setFeedback({ type: 'error', message: msg });
    },
  });

  // Delete Mutation (Soft Delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await tasksControllerRemove(id);
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Tarefa removida com sucesso.' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { detail?: string })?.detail ||
        (err as { message?: string })?.message ||
        'Falha ao excluir a tarefa.';
      setFeedback({ type: 'error', message: msg });
    },
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'HIGH':
        return <Badge variant="warning">Alta</Badge>;
      case 'MEDIUM':
        return <Badge variant="default">Média</Badge>;
      case 'LOW':
      default:
        return <Badge variant="secondary">Baixa</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Concluída</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default">Em Andamento</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-blue-600" />
            Módulo de Referência: Tarefas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Exemplo didático com regras de negócio, ownership, busca, paginação e remoção lógica.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {feedback && (
        <ActionFeedback
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Filter and Search Controls */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título..."
                defaultValue={search}
                onChange={(e) => updateParams({ search: e.target.value || undefined, page: 1 })}
                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => updateParams({ status: e.target.value || undefined, page: 1 })}
              className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">Todos os Status</option>
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="COMPLETED">Concluída</option>
              <option value="CANCELLED">Cancelada</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => updateParams({ priority: e.target.value || undefined, page: 1 })}
              className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">Todas as Prioridades</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>

            {/* Sorting */}
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                updateParams({ sortBy: sb, sortOrder: so, page: 1 });
              }}
              className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="createdAt:desc">Mais recentes primeiro</option>
              <option value="createdAt:asc">Mais antigas primeiro</option>
              <option value="title:asc">Título (A-Z)</option>
              <option value="dueDate:asc">Prazo de entrega mais próximo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Task List / State Views */}
      {isLoading ? (
        <LoadingState message="Carregando tarefas..." />
      ) : isError ? (
        <ErrorState
          title="Erro ao buscar tarefas"
          message="Não foi possível carregar as tarefas no momento."
          onRetry={() => refetch()}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="Nenhuma tarefa encontrada"
          description={
            search || statusFilter || priorityFilter
              ? 'Nenhum registro corresponde aos filtros selecionados.'
              : 'Você ainda não possui tarefas criadas.'
          }
          action={
            search || statusFilter || priorityFilter ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Limpar todos os filtros
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                Criar primeira tarefa
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const desc = typeof task.description === 'string' ? task.description : '';
              const dueStr = typeof task.dueDate === 'string' ? task.dueDate : '';

              return (
                <Card
                  key={task.id}
                  className="overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base text-slate-900 dark:text-white line-clamp-1">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>

                      {desc && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {desc}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        {dueStr && (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(dueStr).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        {isAdmin && task.owner && (
                          <span className="text-[11px] text-slate-400">
                            Por: {task.owner.name}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {task.status !== 'COMPLETED' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                            title="Marcar como Concluída"
                            isLoading={updateMutation.isPending && updateMutation.variables?.id === task.id}
                            onClick={() =>
                              updateMutation.mutate({
                                id: task.id,
                                data: { status: 'COMPLETED' as any },
                              })
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs font-semibold">Concluir</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            title="Reabrir Tarefa"
                            isLoading={updateMutation.isPending && updateMutation.variables?.id === task.id}
                            onClick={() =>
                              updateMutation.mutate({
                                id: task.id,
                                data: { status: 'PENDING' as any },
                              })
                            }
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Reabrir</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Editar Tarefa"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Excluir Tarefa (Remoção Lógica)"
                          isLoading={deleteMutation.isPending && deleteMutation.variables === task.id}
                          onClick={() => {
                            if (confirm(`Deseja realmente remover a tarefa "${task.title}"?`)) {
                              deleteMutation.mutate(task.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
            <div>
              Mostrando <strong>{tasks.length}</strong> de <strong>{meta.total}</strong> tarefas
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={meta.page <= 1}
                onClick={() => updateParams({ page: Math.max(1, meta.page - 1) })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-medium">
                {meta.page} de {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={meta.page >= meta.totalPages}
                onClick={() => updateParams({ page: meta.page + 1 })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Nova Tarefa de Referência
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Crie uma tarefa demonstrando regras de negócio e validação por formulário.
            </p>

            <form
              onSubmit={handleSubmitCreate((data) => {
                setFeedback(null);
                createMutation.mutate(data);
              })}
              className="space-y-4"
            >
              <Input
                label="Título"
                placeholder="Ex.: Desenvolver novo componente"
                {...registerCreate('title')}
                error={createErrors.title?.message}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes opcionais sobre a atividade..."
                  {...registerCreate('description')}
                  className="flex w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                {createErrors.description?.message && (
                  <span className="text-xs text-red-500">{createErrors.description.message}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Prioridade
                  </label>
                  <select
                    {...registerCreate('priority')}
                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <Input
                  label="Data Limite"
                  type="date"
                  {...registerCreate('dueDate')}
                  error={createErrors.dueDate?.message}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" isLoading={createMutation.isPending}>
                  Criar Tarefa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={(data) => {
            setFeedback(null);
            updateMutation.mutate({ id: editingTask.id, data });
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function EditTaskModal({
  task,
  onClose,
  onSubmit,
  isLoading,
}: {
  task: TaskDto;
  onClose: () => void;
  onSubmit: (data: EditTaskFormValues) => void;
  isLoading: boolean;
}) {
  const isCompleted = task.status === 'COMPLETED';
  const rawDesc = typeof task.description === 'string' ? task.description : '';
  const rawDue = typeof task.dueDate === 'string' ? (task.dueDate as unknown as string).split('T')[0] : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      title: task.title,
      description: rawDesc,
      priority: task.priority as any,
      status: task.status as any,
      dueDate: rawDue,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Editar Tarefa
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Atualize os campos ou status da tarefa.
        </p>

        {isCompleted && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Regra de Negócio:</strong> Tarefas concluídas não podem ter detalhes alterados. Para editar, reabra a tarefa alterando o status para "Pendente" ou "Em Andamento".
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit((data) => {
            onSubmit({
              title: data.title,
              description: data.description || undefined,
              priority: data.priority,
              status: data.status,
              dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
            });
          })}
          className="space-y-4"
        >
          <Input
            label="Título"
            disabled={isCompleted}
            {...register('title')}
            error={errors.title?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Descrição
            </label>
            <textarea
              rows={3}
              disabled={isCompleted}
              {...register('description')}
              className="flex w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                {...register('status')}
                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="PENDING">Pendente</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="COMPLETED">Concluída</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Prioridade
              </label>
              <select
                disabled={isCompleted}
                {...register('priority')}
                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          <Input
            label="Data Limite"
            type="date"
            disabled={isCompleted}
            {...register('dueDate')}
            error={errors.dueDate?.message}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
