import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('AppStart API')
    .setDescription('API REST do AppStart - Especificação OpenAPI 3.0')
    .setVersion('1.0.0')
    .addCookieAuth('appstart_session', {
      type: 'apiKey',
      in: 'cookie',
      name: 'appstart_session',
      description: 'Cookie de sessão local opaca',
    })
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication): void {
  const document = buildOpenApiDocument(app);
  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'AppStart API Documentation',
  });
}
