import { Injectable, Logger } from '@nestjs/common';

export interface ErrorReportContext {
  requestId?: string;
  url?: string;
  method?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

@Injectable()
export class ErrorMonitoringService {
  private readonly logger = new Logger(ErrorMonitoringService.name);
  private readonly dsn: string | undefined;
  private readonly isEnabled: boolean;

  constructor() {
    this.dsn = process.env.ERROR_MONITORING_DSN?.trim();
    this.isEnabled = Boolean(this.dsn && this.dsn.length > 0);

    if (this.isEnabled) {
      this.logger.log('Monitoramento de erros externo habilitado.');
    }
  }

  captureException(error: unknown, context: ErrorReportContext = {}): void {
    if (!this.isEnabled) {
      return;
    }

    // Ponto de integração para Sentry / OpenTelemetry / Datadog
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.warn(
      `[ErrorMonitoring] Evento capturado (${context.requestId ?? 'sem-id'}): ${err.message}`,
    );
  }

  isConfigured(): boolean {
    return this.isEnabled;
  }
}
