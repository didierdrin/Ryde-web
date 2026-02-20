import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        if (!api.getToken()) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const data = await api.getProfile();
            if (data?.user) setUser(data.user);
            else setUser(null);
        } catch (_) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (email, password) => {
        const data = await api.login(email, password);
        if (data?.user) setUser(data.user);
        else await loadUser();
    };

    const logout = () => {
        api.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        await loadUser();
    };

    const value = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        isPassenger: user?.userType === 'PASSENGER',
        isDriver: user?.userType === 'DRIVER',
        isAdmin: user?.userType === 'ADMIN',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
