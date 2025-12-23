/**
 * Authentication utilities
 * Handles JWT token decoding and user data management
 */

export interface User {
  id: string;
  role: 'student' | 'professor' | 'doctor' | 'admin' | 'staff';
  email?: string;
  name?: string;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: In production, token verification should be done server-side
 */
export function decodeToken(token: string): { id: string; role: string; iat?: number; exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Get user from token and fetch profile data
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.id || !decoded.role) {
    return null;
  }

  // Check if token is expired
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem('token');
    return null;
  }

  // Fetch user profile based on role
  try {
    const { apiClient } = await import('./api');
    let profileResponse;
    
    if (decoded.role === 'student') {
      profileResponse = await apiClient.get(`/students/${decoded.id}`);
    } else if (decoded.role === 'professor') {
      profileResponse = await apiClient.get(`/professors/${decoded.id}`);
    } else if (decoded.role === 'staff') {
      profileResponse = await apiClient.get(`/staff/${decoded.id}`);
    } else if (decoded.role === 'studentAffair') {
      profileResponse = await apiClient.get(`/studentaffairsofficer/${decoded.id}`);
    } else {
      // Admin or other roles
      return {
        id: decoded.id,
        role: decoded.role as User['role'],
      };
    }

    if (profileResponse.success && profileResponse.data) {
      const userData = profileResponse.data;
      return {
        id: decoded.id,
        role: decoded.role as User['role'],
        email: userData.universityMail || userData.email,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email?.split('@')[0],
        ...userData,
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return basic user info from token if profile fetch fails
    return {
      id: decoded.id,
      role: decoded.role as User['role'],
    };
  }

  return {
    id: decoded.id,
    role: decoded.role as User['role'],
  };
}

/**
 * Save token and user to localStorage
 */
export function saveAuth(token: string, user?: User) {
  localStorage.setItem('token', token);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

/**
 * Clear auth data from localStorage
 */
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Get stored token
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Get stored user (without fetching from API)
 */
export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}