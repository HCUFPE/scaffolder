import fs from 'node:fs';
import path from 'node:path';
import { validateEnv } from './lib/env.mjs';

try {
  const env = validateEnv();
  const outputDir = path.join(process.cwd(), 'infra', 'keycloak', 'realm-import');
  const outputPath = path.join(outputDir, `${env.KEYCLOAK_REALM}.realm.json`);
  const callbackUrl = `${env.API_BASE_URL.replace(/\/$/, '')}/api/v1/auth/callback`;
  const webBaseUrl = env.WEB_BASE_URL.replace(/\/$/, '');

  const realm = {
    realm: env.KEYCLOAK_REALM,
    enabled: true,
    displayName: 'AppStart',
    passwordPolicy: `length(${env.KEYCLOAK_PASSWORD_MIN_LENGTH})`,
    roles: {
      realm: [
        { name: 'admin', description: 'Administrador da aplicação' },
        { name: 'user', description: 'Usuário padrão da aplicação' }
      ]
    },
    groups: [
      { name: 'admins', realmRoles: ['admin'] },
      { name: 'users', realmRoles: ['user'] }
    ],
    clients: [
      {
        clientId: env.KEYCLOAK_CLIENT_ID,
        name: 'AppStart Server',
        enabled: true,
        protocol: 'openid-connect',
        publicClient: false,
        secret: env.KEYCLOAK_CLIENT_SECRET,
        standardFlowEnabled: true,
        directAccessGrantsEnabled: true,
        serviceAccountsEnabled: false,
        redirectUris: [callbackUrl],
        webOrigins: [webBaseUrl],
        baseUrl: env.API_BASE_URL,
        attributes: {
          'post.logout.redirect.uris': `${webBaseUrl}/*`
        },
        protocolMappers: [
          {
            name: 'realm roles in ID token',
            protocol: 'openid-connect',
            protocolMapper: 'oidc-usermodel-realm-role-mapper',
            consentRequired: false,
            config: {
              'user.attribute': 'foo',
              'claim.name': 'realm_access.roles',
              'jsonType.label': 'String',
              multivalued: 'true',
              'id.token.claim': 'true',
              'access.token.claim': 'false',
              'userinfo.token.claim': 'true'
            }
          }
        ]
      },
      {
        clientId: env.KEYCLOAK_ADMIN_CLIENT_ID,
        name: 'AppStart User Administration',
        enabled: true,
        protocol: 'openid-connect',
        publicClient: false,
        secret: env.KEYCLOAK_ADMIN_CLIENT_SECRET,
        standardFlowEnabled: false,
        directAccessGrantsEnabled: false,
        serviceAccountsEnabled: true,
        fullScopeAllowed: false
      }
    ],
    users: [
      {
        username: `service-account-${env.KEYCLOAK_ADMIN_CLIENT_ID}`,
        enabled: true,
        serviceAccountClientId: env.KEYCLOAK_ADMIN_CLIENT_ID,
        clientRoles: {
          'realm-management': ['query-users', 'view-users', 'manage-users', 'view-realm']
        }
      },
      {
        username: env.DEV_ADMIN_EMAIL,
        email: env.DEV_ADMIN_EMAIL,
        enabled: true,
        emailVerified: true,
        firstName: env.DEV_ADMIN_NAME,
        lastName: 'AppStart',
        realmRoles: ['admin'],
        groups: ['/admins'],
        credentials: [
          {
            type: 'password',
            value: env.DEV_ADMIN_PASSWORD,
            temporary: false
          }
        ]
      },
      {
        username: env.DEV_USER_EMAIL,
        email: env.DEV_USER_EMAIL,
        enabled: true,
        emailVerified: true,
        firstName: env.DEV_USER_NAME,
        lastName: 'AppStart',
        realmRoles: ['user'],
        groups: ['/users'],
        credentials: [
          {
            type: 'password',
            value: env.DEV_USER_PASSWORD,
            temporary: false
          }
        ]
      }
    ]
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(realm, null, 2)}\n`);
  console.log(`Realm do Keycloak renderizado em ${outputPath}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
