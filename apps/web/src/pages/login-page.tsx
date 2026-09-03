import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { FormField } from '../components/ui/form-field';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ui/theme-toggle';

const loginSchema = z.object({
  username: z.string().min(1, 'Informe seu usuário ou e-mail.').max(254),
  password: z.string().min(1, 'Informe sua senha.').max(128),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnTo = searchParams.get('returnTo') || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  if (!isLoading && isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setErrorMessage(null);
      await login(data);
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na autenticação. Verifique suas credenciais.';
      setErrorMessage(message);
    }
  };

  const autofillCredentials = (username: string, pass: string) => {
    setValue('username', username, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100/70 dark:bg-slate-950 p-4 relative font-sans antialiased">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xl shadow-md shadow-blue-500/25 mb-3">
            AS
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            AppStart
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plataforma Full Stack com Autenticação Centralizada
          </p>
        </div>

        {/* Native Login Card */}
        <Card className="shadow-lg border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1 text-center pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Entrar na Conta
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Informe suas credenciais para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-3.5 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-700 dark:text-red-300">
                    <span className="font-semibold block">Não foi possível entrar</span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Username Field */}
              <FormField
                label="Usuário ou E-mail"
                htmlFor="username"
                error={errors.username?.message}
                required
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="ex: admin@appstart.local"
                    className="pl-9 h-10 text-sm"
                    {...register('username')}
                  />
                </div>
              </FormField>

              {/* Password Field */}
              <FormField
                label="Senha"
                htmlFor="password"
                error={errors.password?.message}
                required
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Sua senha secreta"
                    className="pl-9 pr-10 h-10 text-sm"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold gap-2 shadow-sm mt-2"
                isLoading={isSubmitting}
              >
                <KeyRound className="h-4 w-4" />
                <span>Entrar no Sistema</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </form>
          </CardContent>

          {/* Clickable Quick Autofill Hints */}
          <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 dark:border-slate-800/80 p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/30">
            <div className="flex items-center justify-center gap-1 font-medium text-slate-700 dark:text-slate-300 text-[11px]">
              <Sparkles className="h-3 w-3 text-blue-500" />
              <span>Clique para preencher as credenciais padrão de dev:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => autofillCredentials('admin@appstart.local', 'ChangeMe123456!')}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-[11px] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Administrador</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                  admin@appstart.local
                </span>
                <code className="text-[9px] text-blue-600 dark:text-blue-400 font-mono block mt-0.5">
                  ChangeMe123456!
                </code>
              </button>

              <button
                type="button"
                onClick={() => autofillCredentials('user@appstart.local', 'ChangeMe123456!')}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-[11px] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>Usuário</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                  user@appstart.local
                </span>
                <code className="text-[9px] text-blue-600 dark:text-blue-400 font-mono block mt-0.5">
                  ChangeMe123456!
                </code>
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
