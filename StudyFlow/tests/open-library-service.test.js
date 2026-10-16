require('ts-node').register({
  compiler: require.resolve('../node_modules/typescript'),
  compilerOptions: {
    ignoreDeprecations: '6.0',
    module: 'CommonJS',
    moduleResolution: 'node',
  },
  skipProject: true,
  transpileOnly: true,
});

const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  buildOpenLibrarySearchUrl,
  buildOpenLibraryWorkUrl,
  parseOpenLibraryResponse,
  searchOpenLibraryBooks,
} = require('../src/services/openLibraryService');

test('constrói URL de pesquisa com termo codificado e campos limitados', () => {
  const url = new URL(buildOpenLibrarySearchUrl('cálculo avançado & álgebra'));

  assert.equal(url.origin, 'https://openlibrary.org');
  assert.equal(url.pathname, '/search.json');
  assert.equal(url.searchParams.get('q'), 'cálculo avançado & álgebra');
  assert.equal(
    url.searchParams.get('fields'),
    'key,title,author_name,first_publish_year,cover_i',
  );
  assert.equal(url.searchParams.get('limit'), '10');
  assert.throws(() => buildOpenLibrarySearchUrl('  '), /Digite um título ou assunto/);
});

test('valida registros e mantém valores opcionais ausentes como indisponíveis', () => {
  const books = parseOpenLibraryResponse({
    docs: [
      {
        key: '/works/OL45804W',
        title: 'A Study of Mathematics',
        author_name: ['Ada Example', null, ''],
        first_publish_year: 1999,
        cover_i: 123,
        unneeded_field: 'ignored',
      },
      {
        key: '/works/OL789W',
        title: 'Book without metadata',
        author_name: 'not an array',
        first_publish_year: 'unknown',
        cover_i: -20,
      },
      { title: 'Invalid work URL', key: 'https://evil.example/book' },
      { key: '/works/OL123W', title: '' },
      null,
    ],
  });

  assert.deepEqual(books, [
    {
      key: '/works/OL45804W',
      title: 'A Study of Mathematics',
      authors: ['Ada Example'],
      firstPublishYear: 1999,
      coverUrl: 'https://covers.openlibrary.org/b/id/123-M.jpg?default=false',
      workUrl: 'https://openlibrary.org/works/OL45804W',
    },
    {
      key: '/works/OL789W',
      title: 'Book without metadata',
      authors: [],
      firstPublishYear: null,
      coverUrl: null,
      workUrl: 'https://openlibrary.org/works/OL789W',
    },
    {
      key: 'https://evil.example/book',
      title: 'Invalid work URL',
      authors: [],
      firstPublishYear: null,
      coverUrl: null,
      workUrl: null,
    },
  ]);
});

test('só forma links externos para caminhos de obra válidos no domínio oficial', () => {
  assert.equal(
    buildOpenLibraryWorkUrl('/works/OL123W'),
    'https://openlibrary.org/works/OL123W',
  );
  for (const invalidKey of [
    'https://evil.example/works/OL123W',
    '//evil.example/works/OL123W',
    '/authors/OL123A',
    '/works/OL123W?redirect=https://evil.example',
    '/works/../../evil',
  ]) {
    assert.equal(buildOpenLibraryWorkUrl(invalidKey), null);
  }
});

test('consulta o endpoint pela função fetch injetada e retorna resultados parseados', async () => {
  let requestUrl = '';
  let requestOptions;
  const books = await searchOpenLibraryBooks('react native', async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        docs: [{ key: '/works/OL1W', title: 'React Native', cover_i: 25 }],
      }),
    };
  });

  assert.equal(new URL(requestUrl).searchParams.get('q'), 'react native');
  assert.equal(requestOptions.headers.Accept, 'application/json');
  assert.equal(books[0].title, 'React Native');
});

test('apresenta erros HTTP, de rede e de payload em formato legível', async () => {
  await assert.rejects(
    searchOpenLibraryBooks('biology', async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    })),
    /HTTP 503/,
  );
  await assert.rejects(
    searchOpenLibraryBooks('biology', async () => {
      throw new Error('network down');
    }),
    /Não foi possível conectar à Open Library/,
  );
  await assert.rejects(
    searchOpenLibraryBooks('biology', async () => ({
      ok: true,
      status: 200,
      json: async () => ({ docs: 'invalid' }),
    })),
    /formato inválido/,
  );
  await assert.rejects(
    searchOpenLibraryBooks('biology', async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('invalid JSON');
      },
    })),
    /não pôde ser lida/,
  );
});
