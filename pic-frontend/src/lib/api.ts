const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1';
const TOKEN_KEY = 'pic_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('pic_user');
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isFormData?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, isFormData = false } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  // No-content responses
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Validation errors: pick first message from errors object, or fall back to message
    const errors = data?.errors as Record<string, string[]> | undefined;
    const firstError = errors ? Object.values(errors)[0]?.[0] : undefined;
    throw new Error(firstError ?? data?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

/** Convenience wrappers */
export const get  = <T>(path: string) => apiRequest<T>(path);
export const post = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'POST', body });
export const put  = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PUT',  body });
export const del  = <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' });
export const postForm = <T>(path: string, form: FormData) =>
  apiRequest<T>(path, { method: 'POST', body: form, isFormData: true });
export const putForm = <T>(path: string, form: FormData) =>
  apiRequest<T>(path, { method: 'POST', body: form, isFormData: true }); // Laravel uses POST+_method for file uploads
