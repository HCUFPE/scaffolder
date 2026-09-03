module.exports = {
  appstartApi: {
    input: './openapi.json',
    output: {
      target: './apps/web/src/lib/api-client/index.ts',
      schemas: './apps/web/src/lib/api-client/models',
      mode: 'split',
      client: 'fetch',
      httpClient: 'fetch',
      clean: false,
      override: {
        mutator: {
          path: './apps/web/src/lib/api-client/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
};
