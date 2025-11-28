
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthorizedPlate {
  id: string;
  plate: string;
  description?: string;
  createdAt: string;
}

export interface AccessLog {
  id: string;
  plate: string;
  status: 'AUTHORIZED' | 'DENIED';
  timestamp: string;
  imageUrl?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    // MOCKING API CALLS FOR DEVELOPMENT
    console.log(`[MockAPI] ${options.method || 'GET'} ${endpoint}`);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate latency

    if (endpoint === '/auth/login') {
        if (JSON.parse(options.body as string).email === 'admin@siscav.com') {
            return {
                token: 'mock-jwt-token',
                user: { id: '1', email: 'admin@siscav.com', name: 'Admin' }
            } as T;
        }
        throw new Error('Invalid credentials');
    }

    if (endpoint === '/whitelist') {
        return [
            { id: '1', plate: 'ABC1234', description: 'Director Car', createdAt: new Date().toISOString() },
            { id: '2', plate: 'XYZ9876', description: 'Staff Van', createdAt: new Date().toISOString() },
        ] as T;
    }

    if (endpoint === '/logs') {
        return [
            { id: '1', plate: 'ABC1234', status: 'AUTHORIZED', timestamp: new Date().toISOString(), imageUrl: '/placeholder-car.jpg' },
            { id: '2', plate: 'UNKNOWN', status: 'DENIED', timestamp: new Date(Date.now() - 3600000).toISOString(), imageUrl: '/placeholder-car.jpg' },
        ] as T;
    }

    // END MOCK

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getWhitelist(): Promise<AuthorizedPlate[]> {
    return this.request<AuthorizedPlate[]>('/whitelist');
  }

  async addPlate(plate: string, description?: string): Promise<AuthorizedPlate> {
      // Mock
      return { id: Math.random().toString(), plate, description, createdAt: new Date().toISOString() };
  }
  
  async removePlate(id: string): Promise<void> {
      // Mock
  }

  async getLogs(): Promise<AccessLog[]> {
    return this.request<AccessLog[]>('/logs');
  }
  
  async openGate(): Promise<void> {
      // Mock
      console.log('Gate opened remotely');
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1');
