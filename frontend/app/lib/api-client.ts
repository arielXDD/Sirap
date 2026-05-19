import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('token') || '';
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }
}

interface ApiOptions extends RequestInit {
  skipToast?: boolean;
}

async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipToast, ...fetchOptions } = options;

  const isFormData = fetchOptions.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
    cache: 'no-store',
  });

  if (response.status === 401) {
    redirectToLogin();
    throw new Error('No autorizado');
  }

  if (response.status === 403) {
    if (!skipToast) toast.error('No tienes permisos para realizar esta acción');
    throw new Error('Prohibido');
  }

  if (response.status === 429) {
    if (!skipToast) toast.error('Demasiadas solicitudes. Espera un momento e intenta de nuevo.');
    throw new Error('Too Many Requests');
  }

  if (response.status >= 500) {
    if (!skipToast) toast.error('Error del servidor. Intenta de nuevo más tarde.');
    throw new Error(`Error del servidor: ${response.status}`);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body?.message || `Error ${response.status}`;
    if (!skipToast) toast.error(Array.isArray(message) ? message.join(', ') : message);
    
    const error = new Error(Array.isArray(message) ? message.join(', ') : message);
    (error as any).status = response.status;
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T = any>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { method: 'GET', ...options }),

  post: <T = any>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body), ...options }),

  patch: <T = any>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: <T = any>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { method: 'DELETE', ...options }),
};

export default api;
