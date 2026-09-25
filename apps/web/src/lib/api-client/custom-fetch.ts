export interface CustomFetchOptions extends RequestInit {
  params?: Record<string, unknown>;
}

export const customFetch = async <T>(
  url: string,
  options: CustomFetchOptions = {},
): Promise<T> => {
  const { params, ...fetchOptions } = options;

  let requestUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const response = await fetch(requestUrl, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    let errorBody: unknown;
    const text = await response.text();
    try {
      errorBody = text ? JSON.parse(text) : undefined;
    } catch {
      errorBody = text;
    }
    throw errorBody;
  }

  let data: unknown = undefined;
  if (response.status !== 204) {
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    if (contentType && contentType.includes('application/json')) {
      try {
        data = text ? JSON.parse(text) : undefined;
      } catch {
        data = text;
      }
    } else {
      data = text;
    }
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as unknown as T;
};
