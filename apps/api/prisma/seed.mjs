import process from 'node:process';
import pg from 'pg';

const { Client } = pg;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  await client.connect();
  await client.query('SELECT 1');
  await client.end();

  console.log('Seed da aplicação concluído.');
  console.log(`Usuário administrador provisionado no Keycloak: ${process.env.DEV_ADMIN_EMAIL}`);
  console.log(`Usuário comum provisionado no Keycloak: ${process.env.DEV_USER_EMAIL}`);
  console.log('Perfis locais são sincronizados no primeiro login pelo BFF.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
