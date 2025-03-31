import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Obtener el token de autenticación para incluirlo en los headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function apiRequest(
  url: string,
  method: string = "GET",
  data?: any,
  customHeaders?: HeadersInit
): Promise<any> {
  const authHeaders = getAuthHeaders();
  
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      ...customHeaders
    }
  };
  
  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }
  
  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  
  // Para métodos como DELETE o algunas peticiones que no devuelven contenido
  if (res.status === 204) {
    return null;
  }
  
  return res.json().catch(() => null); // Si no es un JSON, devolver null
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authHeaders = getAuthHeaders();
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: authHeaders
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false, // No recargar datos automáticamente para evitar peticiones excesivas
      refetchOnWindowFocus: true, // Recargar solo cuando la ventana vuelve a estar en foco
      staleTime: 10000, // Los datos se consideran obsoletos después de 10 segundos para reducir peticiones
      retry: 2, // Reintentar peticiones fallidas (máximo 2 veces)
      retryDelay: 1000 // Esperar 1 segundo entre reintentos
    },
    mutations: {
      retry: 2 // Reintentar mutaciones fallidas (máximo 2 veces)
    },
  },
});
