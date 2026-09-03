import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, KeyRound, Save, Shield, User } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ActionFeedback } from '../components/ui/state-feedback';
import { userControllerUpdateMe } from '../lib/api-client';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve possuir pelo menos 2 caracteres.')
    .max(120, 'O nome deve possuir no máximo 120 caracteres.')
    .transform((v) => v.trim()),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, manageAccount, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await userControllerUpdateMe({ name: data.name });
      return res.data;
    },
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso!' });
      await refetchUser();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset({ name: user?.name });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { detail?: string })?.detail ||
        (error as { message?: string })?.message ||
        'Não foi possível atualizar o perfil.';
      setFeedback({ type: 'error', message: msg });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    setFeedback(null);
    updateMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meu Perfil
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Consulte suas informações de identificação e atualize seus dados pessoais.
        </p>
      </div>

      {feedback && (
        <ActionFeedback
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Account Details & Self Service Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Dados Cadastrais
          </CardTitle>
          <CardDescription>
            Campos como e-mail, papel e identificador são gerenciados centralmente pela administração do sistema.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input
              label="Nome Completo"
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">E-mail Cadastrado</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate block">
                  {user?.email}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Perfil de Acesso</span>
                <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'} className="text-[10px]">
                  {user?.role}
                </Badge>
              </div>
            </div>

            {/* Read-only Security Details */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Status da Conta</span>
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Conta Ativa & Verificada</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">ID Único Local</span>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate block">
                  {user?.id}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={manageAccount}
              className="text-xs gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Gerenciar Conta & Senha
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!isDirty}
              isLoading={updateMutation.isPending}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
