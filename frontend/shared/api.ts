/**
 * API Client Configuration using Axios
 * Handles all API requests directly to the backend
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// Direct connection to backend server (no proxy needed)
// Make requests directly to backend on port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const data = error.response.data as any;
          const errorMessage = data?.message || `HTTP error! status: ${error.response.status}`;
          return Promise.reject(new Error(errorMessage));
        } else if (error.request) {
          // Request made but no response received
          if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Request timeout: The server took too long to respond. Please check your connection and try again.'));
          }
          return Promise.reject(new Error('Network error: Unable to connect to the server. Please check if the backend is running on port 8000.'));
        } else {
          // Something else happened
          return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
        }
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url: endpoint });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url: endpoint, data });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url: endpoint, data });
  }

  async delete<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url: endpoint, data });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url: endpoint, data });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
// Auth API
export const authApi = {
  register: async (role: string, data: any) => {
    return apiClient.post<AuthResponse>(`/auth/register/${role}`, data);
  },
  
  login: async (role: string, email: string, password: string) => {
    return apiClient.post<AuthResponse>(`/auth/login/${role}`, {
      [role === 'student' ? 'universityMail' : 'email']: email,
      password,
    });
  },
  
  requestPasswordReset: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },
  
  verifyResetCode: async (email: string, code: string) => {
    return apiClient.post('/auth/verify-reset-code', { email, code });
  },
  
  resetPassword: async (email: string, code: string, newPassword: string) => {
    return apiClient.post('/auth/reset-password', { email, code, newPassword });
  },
};
// Student API
export const studentApi = {
  getProfile: async (id: string) => {
    return apiClient.get(`/students/${id}`);
  },
  
  updateProfile: async (id: string, data: any) => {
    return apiClient.put(`/students/${id}`, data);
  },
  
  list: async () => {
    return apiClient.get('/students');
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/students/${id}`);
  },
  
  getJoinedClubs: async (id: string) => {
    return apiClient.get(`/students/${id}/clubs`);
  },
  
  getAttendedEvents: async (id: string) => {
    return apiClient.get(`/students/${id}/events`);
  },
  
  getResearchApplications: async (id: string) => {
    return apiClient.get(`/students/${id}/research-applications`);
  },
  
  getStats: async (id: string) => {
    return apiClient.get(`/students/${id}/stats`);
  },
  
  getApplications: async (id: string) => {
    return apiClient.get(`/students/${id}/applications`);
  },
};

// Professor API
export const professorApi = {
  getProfile: async (id: string) => {
    return apiClient.get(`/professors/${id}`);
  },
  
  updateProfile: async (id: string, data: any) => {
    return apiClient.put(`/professors/${id}`, data);
  },
  
  list: async () => {
    return apiClient.get('/professors');
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/professors/${id}`);
  },
  
  getProjectApplications: async (id: string) => {
    return apiClient.get(`/professors/${id}/project-applications`);
  },
  
  getStats: async (id: string) => {
    return apiClient.get(`/professors/${id}/stats`);
  },
};

// Student Affairs Officer API
export const studentAffairsOfficerApi = {
  getProfile: async (id: string) => {
    return apiClient.get(`/studentaffairsofficer/${id}`);
  },
  
  updateProfile: async (id: string, data: any) => {
    return apiClient.put(`/studentaffairsofficer/${id}`, data);
  },
  
  list: async () => {
    return apiClient.get('/studentaffairsofficer');
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/studentaffairsofficer/${id}`);
  },
  
  getStats: async (id: string) => {
    return apiClient.get(`/studentaffairsofficer/${id}/stats`);
  },
};

// Club API
export const clubApi = {
  list: async () => {
    return apiClient.get('/clubs');
  },
  
  get: async (id: string) => {
    return apiClient.get(`/clubs/${id}`);
  },
  
  create: async (data: any) => {
    return apiClient.post('/clubs', data);
  },
  
  update: async (id: string, data: any) => {
    return apiClient.put(`/clubs/${id}`, data);
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/clubs/${id}`);
  },
};

// Event API
export const eventApi = {
  list: async () => {
    return apiClient.get('/events');
  },
  
  get: async (id: string) => {
    return apiClient.get(`/events/${id}`);
  },
  
  getByClub: async (clubId: string) => {
    return apiClient.get(`/events/club/${clubId}`);
  },
  
  create: async (data: any) => {
    return apiClient.post('/events', data);
  },
  
  update: async (id: string, data: any) => {
    return apiClient.put(`/events/${id}`, data);
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/events/${id}`);
  },
};

// Research Project API
export const researchApi = {
  list: async () => {
    return apiClient.get('/research');
  },
  
  get: async (id: string) => {
    return apiClient.get(`/research/${id}`);
  },
  
  getByProfessor: async (professorID: string) => {
    return apiClient.get(`/research/professor/${professorID}`);
  },
  
  create: async (data: any) => {
    return apiClient.post('/research', data);
  },
  
  update: async (id: string, data: any) => {
    return apiClient.put(`/research/${id}`, data);
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/research/${id}`);
  },
};

// Lost and Found API
export const lostFoundApi = {
  list: async () => {
    return apiClient.get('/lostfound');
  },
  
  get: async (id: string) => {
    return apiClient.get(`/lostfound/${id}`);
  },
  
  create: async (data: any) => {
    return apiClient.post('/lostfound', data);
  },
  
  update: async (id: string, data: any) => {
    return apiClient.put(`/lostfound/${id}`, data);
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/lostfound/${id}`);
  },
};

// Application API
export const applicationApi = {
  list: async () => {
    return apiClient.get('/applies');
  },
  
  create: async (data: any) => {
    return apiClient.post('/applies', data);
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/applies/${id}`);
  },
};

// Join Club API
export const joinApi = {
  join: async (data: any) => {
    return apiClient.post('/joins', data);
  },
  
  leave: async (studentID: string, clubID: string) => {
    return apiClient.delete(`/joins/${studentID}/${clubID}`);
  },

  getClubMembers: async (clubID: string) => {
    return apiClient.get(`/joins/club/${clubID}`);
  },
};

// Attend Event API
export const attendApi = {
  attend: async (data: any) => {
    return apiClient.post('/attends', data);
  },
  
  unattend: async (studentID: string, eventID: string) => {
    return apiClient.delete(`/attends/${studentID}/${eventID}`);
  },

  getEventAttendees: async (eventID: string) => {
    return apiClient.get(`/attends/event/${eventID}`);
  },
};

// Conducts (Research Project Applications) API
export const conductsApi = {
  list: async () => {
    return apiClient.get('/conducts');
  },

  create: async (data: any) => {
    return apiClient.post('/conducts', data);
  },

  updateStatus: async (studentID: string, projectID: string, status: string) => {
    return apiClient.put(`/conducts/${studentID}/${projectID}`, { status });
  },
  
  delete: async (studentID: string, projectID: string) => {
    return apiClient.delete(`/conducts/${studentID}/${projectID}`);
  },
};

// Admin API
export const adminApi = {
  getSummary: async () => {
    return apiClient.get('/admin/summary');
  },
  
  getAllUsers: async () => {
    return apiClient.get('/admin/users');
  },
};

// Internship API
export const internshipApi = {
  list: async () => {
    return apiClient.get('/internships');
  },
  
  get: async (id: string) => {
    return apiClient.get(`/internships/${id}`);
  },
  
  create: async (data: any) => {
    return apiClient.post('/internships', data);
  },
  
  update: async (id: string, data: any) => {
    return apiClient.put(`/internships/${id}`, data);
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/internships/${id}`);
  },
};

// Recommends API (for studentAffair to recommend internships)
export const recommendsApi = {
  list: async () => {
    return apiClient.get('/recommends');
  },
  
  recommend: async (data: any) => {
    return apiClient.post('/recommends', data);
  },
  
  remove: async (professorID: string, internshipID: string) => {
    return apiClient.delete(`/recommends/${professorID}/${internshipID}`);
  },
};

// Applies API (for students to apply for internships)
export const appliesApi = {
  apply: async (data: any) => {
    return apiClient.post('/applies', data);
  },
  
  withdraw: async (studentID: string, internshipID: string) => {
    return apiClient.delete(`/applies/${studentID}/${internshipID}`);
  },
  
  getByStudent: async (studentID: string) => {
    return apiClient.get(`/applies/student/${studentID}`);
  },
};

// Contact API
export const contactApi = {
  sendMessage: async (data: { name: string; email: string; subject: string; message: string }) => {
    return apiClient.post('/contact', data);
  },
};
