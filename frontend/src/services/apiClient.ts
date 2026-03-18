// -------------------------------------------------------
// apiClient.ts
// Base fetch wrapper — attaches token & base URL for all service calls
// Uses the real auth token from AsyncStorage (set by AuthContext on login)
// -------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../utils/config';

export const BASE_URL = API_BASE_URL;

// ---------------------------------------------------------------------------
// Token helpers — reads from AsyncStorage (written by AuthContext on login)
// ---------------------------------------------------------------------------

export const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch {
        return null;
    }
};

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------
type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function apiRequest<T>(
    method: Method,
    path: string,
    body?: object,
    params?: Record<string, string>
): Promise<T> {
    const token = await getAuthToken();

    let url = `${BASE_URL}${path}`;

    if (params && Object.keys(params).length > 0) {
        const query = new URLSearchParams(params).toString();
        url = `${url}?${query}`;
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
    }

    return data as T;
}
