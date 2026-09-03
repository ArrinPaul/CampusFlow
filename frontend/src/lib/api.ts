const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("UniKit_token");
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new Error("Network error — please check your connection and try again.");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Something went wrong" }));
    throw new Error(error.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
