import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  Database,
  FileCode2,
  KeyRound,
  ListTodo,
  Plus,
  Server,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import {
  healthControllerLive,
  healthControllerReady,
  tasksControllerFindAll,
  userControllerList,
} from '../lib/api-client';
import type { PaginatedTasksResponseDto, PaginatedUsersResponseDto } from '../lib/api-client/models';

export function DashboardPage() {
  const { user, isAdmin } = useAuth();

  // Health Queries
  const { data: liveData } = useQuery({
    queryKey: ['health', 'live'],
    queryFn: async () => {
      const res = await healthControllerLive();
      return res.data;
    },
    staleTime: 30000,
  });

  const { data: readyData } = useQuery({
    queryKey: ['health', 'ready'],
    queryFn: async () => {
      const res = await healthControllerReady();
      return res.data;
    },
    staleTime: 30000,
  });

  // Tasks Query for real-time stats
  const { data: tasksResponse } = useQuery({
    queryKey: ['tasks', { page: 1, pageSize: 50 }],
    queryFn: async () => {
      const res = await tasksControllerFindAll({ page: 1, pageSize: 50 });
      return res.data;
    },
  });

  // Users Query for real-time stats (Admin only)
  const { data: usersResponse } = useQuery({
    queryKey: ['users', { page: 1, pageSize: 50 }],
    queryFn: async () => {
      const res = await userControllerList({ page: 1, pageSize: 50 });
      return res.data;
    },
    enabled: isAdmin,
  });

  const paginatedTasks =
    tasksResponse && 'data' in (tasksResponse as PaginatedTasksResponseDto)
      ? (tasksResponse as PaginatedTasksResponseDto)
      : null;

  const tasksList = paginatedTasks?.data || [];
  const totalTasks = paginatedTasks?.meta?.total ?? tasksList.length;
  const pendingTasks = tasksList.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
  const completedTasks = tasksList.filter((t) => t.status === 'COMPLETED').length;

  const paginatedUsers =
    usersResponse && 'data' in (usersResponse as PaginatedUsersResponseDto)
      ? (usersResponse as PaginatedUsersResponseDto)
      : null;
  const totalUsers = paginatedUsers?.meta?.total ?? 1;

  const isHealthy = liveData && readyData;

  return (
    <div className="space-y-8">
      {/* Reusable PageHeader Component */}
      <PageHeader
        category="Painel de Controle"
        badgeText={user?.role}
        badgeVariant={isAdmin ? 'default' : 'secondary'}
        title={`Olá, ${user?.name || 'Desenvolvedor'}!`}
        subtitle="Tudo pronto na sua aplicação. Esta baseline está configurada com autenticação federada OIDC headless, sessões opacas seguras e contrato OpenAPI sincronizado."
      >
        <Link to="/tasks">
          <Button size="sm" className="gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            Meu Perfil
          </Button>
        </Link>
        {isAdmin && (
          <Link to="/users">
            <Button variant="secondary" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Reusable StatCard Components (OneUI Two-Layered Stat Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tarefas Criadas"
          value={totalTasks}
          icon={ListTodo}
          iconBgClass="bg-blue-50 dark:bg-blue-950/60"
          iconColorClass="text-blue-600 dark:text-blue-400"
          actionText="Gerenciar tarefas"
          actionHref="/tasks"
          actionColorClass="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        />

        <StatCard
          title="Em Andamento"
          value={pendingTasks}
          icon={Clock}
          iconBgClass="bg-amber-50 dark:bg-amber-950/60"
          iconColorClass="text-amber-600 dark:text-amber-400"
          actionText="Ver pendentes"
          actionHref="/tasks?status=PENDING"
          actionColorClass="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
        />

        <StatCard
          title="Concluídas"
          value={completedTasks}
          icon={CheckCircle2}
          iconBgClass="bg-green-50 dark:bg-green-950/60"
          iconColorClass="text-green-600 dark:text-green-400"
          actionText="Ver histórico"
          actionHref="/tasks?status=COMPLETED"
          actionColorClass="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
        />

        <StatCard
          title={isAdmin ? 'Usuários Cadastrados' : 'Sessão OIDC'}
          value={isAdmin ? totalUsers : 'Ativo'}
          icon={isAdmin ? Users : ShieldCheck}
          iconBgClass="bg-indigo-50 dark:bg-indigo-950/60"
          iconColorClass="text-indigo-600 dark:text-indigo-400"
          actionText={isAdmin ? 'Gerenciar usuários' : 'Ver meu perfil'}
          actionHref={isAdmin ? '/users' : '/profile'}
          actionColorClass="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        />
      </div>

      {/* Architecture & Engineering Standards Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-blue-600" />
                Contrato & Type-Safety
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">OpenAPI 3.0</Badge>
            </div>
            <CardDescription className="text-xs">
              Comunicação totalmente tipada via cliente TypeScript gerado automaticamente com Orval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Cliente gerado em <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">@/lib/api-client</code></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Formulários declarativos com <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">React Hook Form + Zod</code></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Detecção de divergência em CI via <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">pnpm api:check</code></span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-600" />
                Saúde da Infraestrutura
              </CardTitle>
              <Badge variant={isHealthy ? 'success' : 'warning'} className="text-[10px]">
                {isHealthy ? '100% Operacional' : 'Checando...'}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Verificação de integridade do runtime NestJS e conexão relacional do PostgreSQL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>API Liveness (/health/live)</span>
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">Ativo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                <span>PostgreSQL (/health/ready)</span>
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">Conectado</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                <span>Serviço de Identidade</span>
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Protegido</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
