import React from 'react';
import { AlertCircle, CheckCircle2, Inbox, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from './button';

export function LoadingState({ message = 'Carregando dados...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 dark:text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'Nenhum registro encontrado',
  description = 'Não há itens disponíveis para exibição no momento.',
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mb-3">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Ocorreu um erro ao carregar os dados',
  message = 'Não foi possível completar a requisição. Tente novamente mais tarde.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/40 text-red-800 dark:text-red-200 h-8 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActionFeedback({
  type = 'success',
  message,
  onClose,
}: {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-900 dark:text-green-300',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300',
  };

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />,
    info: <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />,
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border text-xs font-medium ${styles[type]}`}>
      <div className="flex items-center gap-2">
        {icons[type]}
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          aria-label="Fechar"
          className="opacity-70 hover:opacity-100 ml-2 cursor-pointer p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
