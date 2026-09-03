import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { buildOpenApiDocument } from './openapi';
import { PrismaService } from './prisma/prisma.service';

async function generate(): Promise<void> {
  try {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'health/(.*)'],
    });

    const document = buildOpenApiDocument(app);
    await app.close();

    const outputPath = resolve(process.cwd(), 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2) + '\n', 'utf8');
    console.log(`[openapi] Especificação salva com sucesso em: ${outputPath}`);
  } catch (error) {
    console.error('[openapi] Erro gerando especificação OpenAPI:', error);
    process.exit(1);
  }
}

void generate();
