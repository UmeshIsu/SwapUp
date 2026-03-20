import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/src/services/api';
import socketService from '@/src/services/socketService';

interface User {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: 'EMPLOYEE' | 'MANAGER';
    department?: string;
    phone?: string;
    workerId?: string;
    hotelName?: string;
    tenantId?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    selectedRole: 'EMPLOYEE' | 'MANAGER' | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setSelectedRole: (role: 'EMPLOYEE' | 'MANAGER') => void;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        phone?: string;
        workerId?: string;
        hotelName?: string;
        department?: string;
        tenantId?: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'MANAGER' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    useEffect(() => {
        if (token) {
            socketService.connect();
        } else {
            socketService.disconnect();
        }
    }, [token]);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('authToken');
            const storedUser = await AsyncStorage.getItem('user');
            const storedRole = await AsyncStorage.getItem('selectedRole');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }

            if (storedRole) {
                setSelectedRole(storedRole as 'EMPLOYEE' | 'MANAGER');
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetSelectedRole = async (role: 'EMPLOYEE' | 'MANAGER') => {
        setSelectedRole(role);
        await AsyncStorage.setItem('selectedRole', role);
    };

    const login = async (email: string, password: string) => {
        try {
            let roleToUse = selectedRole;
            if (!roleToUse) {
                const storedRole = await AsyncStorage.getItem('selectedRole');
                if (storedRole) {
                    roleToUse = storedRole as 'EMPLOYEE' | 'MANAGER';
                }
            }

            const response = await authAPI.login({ email, password, role: roleToUse || undefined });
            const { token: newToken, user: userData } = response.data;

            await AsyncStorage.setItem('authToken', newToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('selectedRole', userData.role);

            setToken(newToken);
            setUser(userData);
            setSelectedRole(userData.role);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed');
        }
    };

    const register = async (data: {
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        phone?: string;
        workerId?: string;
        hotelName?: string;
        department?: string;
        tenantId?: string;
    }) => {
        try {
            const response = await authAPI.register({
                ...data,
                role: selectedRole || 'EMPLOYEE',
            });
            const { token: newToken, user: userData } = response.data;

            await AsyncStorage.setItem('authToken', newToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));

            setToken(newToken);
            setUser(userData);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
            socketService.disconnect();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                selectedRole,
                isLoading,
                isAuthenticated: !!token && !!user,
                setSelectedRole: handleSetSelectedRole,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
