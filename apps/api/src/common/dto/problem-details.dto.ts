import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemDetailsDto {
  @ApiProperty({ example: 'https://appstart.example/problems/validation-error' })
  type!: string;

  @ApiProperty({ example: 'Dados inválidos' })
  title!: string;

  @ApiProperty({ example: 400 })
  status!: number;

  @ApiProperty({ example: 'Um ou mais campos precisam ser corrigidos.' })
  detail!: string;

  @ApiProperty({ example: '/api/v1/users' })
  instance!: string;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code!: string;

  @ApiPropertyOptional({ example: '01J...' })
  requestId?: string;

  @ApiProperty({ example: '2026-08-31T20:00:00.000Z' })
  timestamp!: string;

  @ApiPropertyOptional({
    example: { email: ['Informe um e-mail válido.'] },
    additionalProperties: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  errors?: Record<string, string[]>;
}
