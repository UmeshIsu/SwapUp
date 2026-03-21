import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall } from '@/src/services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    plan?: string;
    workerId?: string;
    phone?: string;
    department?: string;
    avatarUrl?: string;
    availabilityPreferences?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FALLBACK_USER: User = {
    id: 'local-user',
    name: 'Employee User',
    email: 'employee@example.com',
    role: 'EMPLOYEE',
    workerId: 'EMP-001',
    plan: 'Basic',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchProfile(token);
        } else {
            setUser((currentUser) => currentUser ?? FALLBACK_USER);
            setIsLoading(false);
        }
    }, [token]);

    const fetchProfile = async (activeToken: string) => {
        setIsLoading(true);
        try {
            const data = await apiCall('/user/profile', { token: activeToken });
            setUser(data?.user ?? FALLBACK_USER);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setUser((currentUser) => currentUser ?? FALLBACK_USER);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData ?? FALLBACK_USER);
        setIsLoading(false);
    };

    const logout = () => {
        setToken(null);
        setUser(FALLBACK_USER);
        setIsLoading(false);
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...userData });
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
