import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Optional,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProblemDetailsDto } from '../dto/problem-details.dto';
import { ErrorMonitoringService } from '../observability/error-monitoring.service';

const HTTP_STATUS_CODES: Record<number, { code: string; title: string }> = {
  [HttpStatus.BAD_REQUEST]: { code: 'BAD_REQUEST', title: 'Requisição inválida' },
  [HttpStatus.UNAUTHORIZED]: { code: 'UNAUTHORIZED', title: 'Não autenticado' },
  [HttpStatus.FORBIDDEN]: { code: 'FORBIDDEN', title: 'Acesso negado' },
  [HttpStatus.NOT_FOUND]: { code: 'NOT_FOUND', title: 'Recurso não encontrado' },
  [HttpStatus.CONFLICT]: { code: 'CONFLICT', title: 'Conflito de dados' },
  [HttpStatus.UNPROCESSABLE_ENTITY]: { code: 'UNPROCESSABLE_ENTITY', title: 'Entidade não processável' },
  [HttpStatus.TOO_MANY_REQUESTS]: { code: 'TOO_MANY_REQUESTS', title: 'Muitas requisições' },
  [HttpStatus.INTERNAL_SERVER_ERROR]: { code: 'INTERNAL_SERVER_ERROR', title: 'Erro interno do servidor' },
  [HttpStatus.SERVICE_UNAVAILABLE]: { code: 'SERVICE_UNAVAILABLE', title: 'Serviço indisponível' },
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  constructor(
    @Optional()
    @Inject(ErrorMonitoringService)
    private readonly errorMonitoring?: ErrorMonitoringService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-request-id'] as string | undefined) ||
      request.requestId ||
      undefined;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Erro interno do servidor';
    let code = 'INTERNAL_SERVER_ERROR';
    let detail = 'Ocorreu um erro inesperado no servidor.';
    let errors: Record<string, string[]> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      const statusMeta = HTTP_STATUS_CODES[status] || {
        code: `HTTP_${status}`,
        title: exception.name.replace(/Exception$/, ''),
      };

      title = statusMeta.title;
      code = statusMeta.code;

      if (typeof res === 'string') {
        detail = res;
      } else if (typeof res === 'object' && res !== null) {
        const errorRecord = res as Record<string, unknown>;

        if (Array.isArray(errorRecord.message)) {
          // Nest standard validation pipe output
          code = 'VALIDATION_ERROR';
          title = 'Dados inválidos';
          detail = 'Um ou mais campos precisam ser corrigidos.';
          errors = this.groupValidationMessages(errorRecord.message as string[]);
        } else if (typeof errorRecord.errors === 'object' && errorRecord.errors !== null) {
          errors = errorRecord.errors as Record<string, string[]>;
          if (typeof errorRecord.detail === 'string') detail = errorRecord.detail;
          if (typeof errorRecord.message === 'string') detail = errorRecord.message;
        } else if (typeof errorRecord.message === 'string') {
          detail = errorRecord.message;
        } else if (typeof errorRecord.detail === 'string') {
          detail = errorRecord.detail;
        }

        if (typeof errorRecord.code === 'string') {
          code = errorRecord.code;
        }
        if (typeof errorRecord.title === 'string') {
          title = errorRecord.title;
        }
      }
    } else {
      const err = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(`Unhandled exception on ${request.method} ${request.url}: ${err.message}`, err.stack);
      this.errorMonitoring?.captureException(err, {
        requestId,
        url: request.url,
        method: request.method,
      });
    }

    const type = `https://appstart.example/problems/${code.toLowerCase().replace(/_/g, '-')}`;

    const problem: ProblemDetailsDto = {
      type,
      title,
      status,
      detail,
      instance: request.url,
      code,
      ...(requestId ? { requestId } : {}),
      timestamp: new Date().toISOString(),
      ...(errors ? { errors } : {}),
    };

    response
      .status(status)
      .header('Content-Type', 'application/problem+json')
      .json(problem);
  }

  private groupValidationMessages(messages: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    for (const msg of messages) {
      const spaceIdx = msg.indexOf(' ');
      if (spaceIdx > 0) {
        const field = msg.slice(0, spaceIdx);
        const text = msg.slice(spaceIdx + 1);
        if (!grouped[field]) grouped[field] = [];
        grouped[field].push(text);
      } else {
        if (!grouped.general) grouped.general = [];
        grouped.general.push(msg);
      }
    }
    return grouped;
  }
}
