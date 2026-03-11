import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('ghareswad_token');
        if (token) {
            authAPI.getMe()
                .then((res) => setUser(res.data))
                .catch(() => localStorage.removeItem('ghareswad_token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const data = res.data;
        localStorage.setItem('ghareswad_token', data.token);
        setUser(data);
        return data;
    };

    const register = async (formData) => {
        const res = await authAPI.register(formData);
        const data = res.data;
        localStorage.setItem('ghareswad_token', data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('ghareswad_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            isChef: user?.role === 'chef',
            isCustomer: user?.role === 'customer',
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
