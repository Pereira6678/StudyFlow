export type OpenLibraryBook = {
  key: string;
  title: string;
  authors: string[];
  firstPublishYear: number | null;
  coverUrl: string | null;
  workUrl: string | null;
};

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type FetchFunction = (
  input: string,
  init?: RequestInit,
) => Promise<FetchResponse>;

const OPEN_LIBRARY_ORIGIN = 'https://openlibrary.org';
const SEARCH_FIELDS = ['key', 'title', 'author_name', 'first_publish_year', 'cover_i'];
const SEARCH_LIMIT = 10;

export function buildOpenLibrarySearchUrl(query: string): string {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    throw new Error('Digite um título ou assunto para pesquisar.');
  }

  return `${OPEN_LIBRARY_ORIGIN}/search.json?q=${encodeURIComponent(normalizedQuery)}`
    + `&fields=${SEARCH_FIELDS.join(',')}&limit=${SEARCH_LIMIT}`;
}

export function buildOpenLibraryWorkUrl(key: unknown): string | null {
  if (typeof key !== 'string' || !/^\/works\/OL\d+W$/.test(key)) {
    return null;
  }

  return `${OPEN_LIBRARY_ORIGIN}${key}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseOpenLibraryResponse(payload: unknown): OpenLibraryBook[] {
  if (!isRecord(payload) || !Array.isArray(payload.docs)) {
    throw new Error('A Open Library retornou uma resposta em formato inválido.');
  }

  return payload.docs.flatMap((entry): OpenLibraryBook[] => {
    if (!isRecord(entry) || typeof entry.title !== 'string' || !entry.title.trim()) {
      return [];
    }

    const authors = Array.isArray(entry.author_name)
      ? entry.author_name.filter(
          (author): author is string => typeof author === 'string' && author.trim().length > 0,
        )
      : [];
    const firstPublishYear = Number.isInteger(entry.first_publish_year)
      && Number(entry.first_publish_year) > 0
      && Number(entry.first_publish_year) <= 9999
      ? Number(entry.first_publish_year)
      : null;
    const coverId = Number.isSafeInteger(entry.cover_i) && Number(entry.cover_i) > 0
      ? Number(entry.cover_i)
      : null;

    return [{
      key: typeof entry.key === 'string' ? entry.key : '',
      title: entry.title.trim(),
      authors,
      firstPublishYear,
      coverUrl: coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`
        : null,
      workUrl: buildOpenLibraryWorkUrl(entry.key),
    }];
  });
}

export async function searchOpenLibraryBooks(
  query: string,
  fetcher: FetchFunction = fetch,
): Promise<OpenLibraryBook[]> {
  const url = buildOpenLibrarySearchUrl(query);
  let response: FetchResponse;

  try {
    response = await fetcher(url, { headers: { Accept: 'application/json' } });
  } catch {
    throw new Error('Não foi possível conectar à Open Library. Verifique sua conexão e tente novamente.');
  }

  if (!response.ok) {
    throw new Error(`A Open Library respondeu com erro HTTP ${response.status}. Tente novamente.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('A Open Library retornou uma resposta que não pôde ser lida.');
  }

  return parseOpenLibraryResponse(payload);
}
