const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Important: This sends cookies with every request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string, role: string) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    }),

  logout: () =>
    fetchApi('/auth/logout', {
      method: 'POST',
    }),

  getProfile: () => fetchApi('/auth/profile'),
};

// Vacancies API
export const vacanciesApi = {
  getAll: (params?: { page?: number; limit?: number; title?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.title) searchParams.append('title', params.title);
    
    const query = searchParams.toString();
    return fetchApi(`/vacancies${query ? `?${query}` : ''}`);
  },

  create: (data: {
    title: string;
    description: string;
    company: string;
    location: string;
    salary: number;
    maxApplicants: number;
  }) =>
    fetchApi('/vacancies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string) =>
    fetchApi(`/vacancies/${id}/status`, {
      method: 'PATCH',
    }),
};

// Applications API
export const applicationsApi = {
  apply: (vacancyId: string) =>
    fetchApi('/applications', {
      method: 'POST',
      body: JSON.stringify({ vacancyId }),
    }),

  getMyApplications: () => fetchApi('/applications/my-applications'),

  updateStatus: (id: string, status: 'aceptada' | 'rechazada') =>
    fetchApi(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
