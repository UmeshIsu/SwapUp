import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>({
        id: '4b465b9f-c953-46f1-b36a-c7fa3fcfac73',
        name: 'Employee 1 (INDIAN)',
        email: 'employee1_indian@hilton.com',
        role: 'EMPLOYEE',
        workerId: 'E-I-001',
        plan: 'Premium',
        phone: '+947721100001',
        department: 'INDIAN',
        availabilityPreferences: 'Monday to Friday, 9AM to 5PM'
    });
    const [token, setToken] = useState<string | null>('mock-token');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
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
