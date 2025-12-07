/**
 * Mobile-friendly API helper
 * Works in both web (Next.js) and mobile (Capacitor) environments
 */

// Determine if we're running in a mobile app
export function isMobileApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Capacitor
  if ((window as any).Capacitor) {
    return (window as any).Capacitor.isNativePlatform();
  }
  
  // Check user agent for mobile
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Get API base URL
export function getApiBaseUrl(): string {
  // In mobile app, use the deployed URL or configured API URL
  if (isMobileApp()) {
    return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_URL || '';
  }
  
  // In web app, use relative URLs for API routes
  return '';
}

/**
 * Make an API request that works in both web and mobile
 */
export async function apiRequest(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl ? `${baseUrl}/api${endpoint}` : `/api${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

/**
 * Helper for GET requests
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const response = await apiRequest(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Helper for POST requests
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

