import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../access/access.decorators';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthCheckResponse {
  status: string;
  checks?: {
    database: string;
  };
}

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness health check' })
  @ApiResponse({ status: 200, schema: { example: { status: 'live' } } })
  live(): { status: string } {
    return { status: 'live' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness health check incluindo conectividade com banco' })
  @ApiResponse({
    status: 200,
    schema: { example: { status: 'ready', checks: { database: 'up' } } },
  })
  @ApiResponse({ status: 503, type: ProblemDetailsDto })
  async ready(): Promise<HealthCheckResponse> {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return {
        status: 'ready',
        checks: {
          database: 'up',
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        code: 'DATABASE_UNAVAILABLE',
        title: 'Serviço indisponível',
        detail: 'Não foi possível estabelecer comunicação com o banco de dados.',
        checks: {
          database: 'down',
        },
      });
    }
  }
}
