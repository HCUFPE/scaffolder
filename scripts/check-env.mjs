import { validateEnv } from './lib/env.mjs';

try {
  validateEnv();
  console.log('Arquivo .env válido.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
