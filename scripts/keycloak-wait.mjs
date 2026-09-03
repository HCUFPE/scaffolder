import { validateEnv } from './lib/env.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  const env = validateEnv();
  const realmUrl = `${env.KEYCLOAK_BASE_URL.replace(/\/$/, '')}/realms/${env.KEYCLOAK_REALM}/.well-known/openid-configuration`;
  const timeoutMs = 120_000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(realmUrl, { headers: { accept: 'application/json' } });
      if (response.ok) {
        const payload = await response.json();
        if (payload.issuer) {
          console.log(`Keycloak pronto em ${realmUrl}`);
          process.exit(0);
        }
      }
    } catch {
      // aguarda nova tentativa
    }

    await sleep(2_000);
  }

  throw new Error([
    'Keycloak não ficou pronto dentro do tempo esperado.',
    `Verifique os logs do container e a URL ${realmUrl}.`
  ].join('\n'));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
