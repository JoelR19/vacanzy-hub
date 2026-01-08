const API_BASE_URL = "http://localhost:3000/api";

interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Si es 404 o 401, devolvemos null para indicar que no hay datos/sesión
    if (response.status === 404 || response.status === 401) return null;
    if (response.status === 204) return {} as T;

    const result: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error en el servidor");
    }

    return result.data ?? null;
  } catch (error) {
    console.error(`Error en API (${endpoint}):`, error);
    return null;
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role: "CODER" }),
    }),
  logout: () => fetchApi("/auth/logout", { method: "POST" }),
  getProfile: () => fetchApi("/auth/profile"),
};

export const vacanciesApi = {
  getAll: (params?: { page?: number; limit?: number; title?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.title) searchParams.append("title", params.title);
    if ((params as any)?.includeInactive)
      searchParams.append("includeInactive", "true");
    return fetchApi(`/vacancies?${searchParams.toString()}`);
  },
  create: (data: any) =>
    fetchApi("/vacancies", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: string) =>
    fetchApi(`/vacancies/${id}/status`, { method: "PATCH" }),
};

export const applicationsApi = {
  apply: (vacancyId: string) =>
    fetchApi("/applications", {
      method: "POST",
      body: JSON.stringify({ vacancyId }),
    }),
  getMyApplications: () => fetchApi("/applications/my-applications"),
  updateStatus: (id: string, status: "aceptada" | "rechazada") =>
    fetchApi(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
