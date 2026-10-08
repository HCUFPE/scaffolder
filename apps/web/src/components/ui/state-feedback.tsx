import React from 'react';
import { AlertCircle, CheckCircle2, Inbox, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from './button';

export function LoadingState({ message = 'Carregando dados...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-accent-text mb-3" aria-hidden="true" />
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
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-line bg-surface-muted">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-strong text-body mb-3">
        {icon || <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h4 className="text-base font-semibold text-heading mb-1">{title}</h4>
      <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
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
    <div className="rounded-lg border border-danger-line bg-danger-subtle p-6 text-danger-text">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs opacity-90 mt-1">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="border-danger-line hover:bg-danger/10 text-danger-text h-8 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" aria-hidden="true" />
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
    success: 'bg-success-subtle border-success-line text-success-text',
    error: 'bg-danger-subtle border-danger-line text-danger-text',
    info: 'bg-info-subtle border-info-line text-info-text',
  };

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />,
    info: <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />,
  };

  return (
    <div role="alert" className={`flex items-center justify-between p-3 rounded-lg border text-xs font-medium ${styles[type]}`}>
      <div className="flex items-center gap-2">
        {icons[type]}
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          aria-label="Fechar mensagem"
          className="opacity-70 hover:opacity-100 ml-2 cursor-pointer p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
