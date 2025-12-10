import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, updateProfile as apiUpdateProfile, getAllUsers, getProfile as apiGetProfile, deleteAccount as apiDeleteAccount } from '../api/auth';

const AuthContext = createContext();

const KEYS = {
    THEME: 'elevatex_theme_final',
    TOKEN: 'token',
    USER: 'user'
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState({});
    const [theme, setTheme] = useState('dark');
    const [loading, setLoading] = useState(true);

    // Fetch all users for leaderboard and lookup
    const fetchUsers = async () => {
        try {
            const usersList = await getAllUsers();
            const usersMap = usersList.reduce((acc, user) => {
                acc[user.name] = user;
                return acc;
            }, {});
            setUsers(usersMap);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    useEffect(() => {
        // Load theme
        const savedTheme = localStorage.getItem(KEYS.THEME) || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');

        // Load session
        const token = localStorage.getItem(KEYS.TOKEN);
        const savedUser = JSON.parse(localStorage.getItem(KEYS.USER) || 'null');

        if (token && savedUser) {
            setCurrentUser(savedUser);
        }

        // Fetch users
        fetchUsers().finally(() => setLoading(false));
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem(KEYS.THEME, newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const login = async (email, password) => {
        try {
            const data = await apiLogin(email, password);
            localStorage.setItem(KEYS.TOKEN, data.token);
            localStorage.setItem(KEYS.USER, JSON.stringify(data));
            setCurrentUser(data);
            await fetchUsers(); // Refresh users list
            return data;
        } catch (error) {
            console.error("Login failed", error);
            throw error.response?.data?.message || "Login failed";
        }
    };

    const register = async (name, email, password) => {
        try {
            const data = await apiRegister(name, email, password);
            localStorage.setItem(KEYS.TOKEN, data.token);
            localStorage.setItem(KEYS.USER, JSON.stringify(data));
            setCurrentUser(data);
            await fetchUsers();
            return data;
        } catch (error) {
            console.error("Registration failed", error);
            const message = error.response?.data?.message;
            const validationErrors = error.response?.data?.errors;

            if (validationErrors && Array.isArray(validationErrors)) {
                throw validationErrors.map(err => err.message).join('. ');
            }

            throw message || error.message || "Registration failed";
        }
    };

    const loginAsGuest = () => {
        const guestUser = { name: 'Guest', xp: 0, coins: 0, bio: 'Guest User', avatar: `https://api.dicebear.com/7.x/personas/svg?seed=guest` };
        setCurrentUser(guestUser);
        // Don't save guest to local storage as logged in user
    };

    const logout = () => {
        // Clear all user-related data from localStorage
        localStorage.removeItem(KEYS.TOKEN);
        localStorage.removeItem(KEYS.USER);
        localStorage.clear(); // Clear everything to be safe

        // Reset state
        setCurrentUser(null);
        setUsers({});

        // Redirect to home page
        window.location.href = '/';
    };

    const updateUser = async (username, updates) => {
        try {
            // We ignore username param as backend uses token to identify user
            const updatedUser = await apiUpdateProfile(updates);

            // Update local state
            setCurrentUser(updatedUser);
            localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));

            // Update users map
            setUsers(prev => ({
                ...prev,
                [updatedUser.name]: updatedUser
            }));
        } catch (error) {
            console.error("Update failed", error);
            throw error;
        }
    };

    const refreshProfile = async () => {
        try {
            const updatedUser = await apiGetProfile();

            // Update local state
            setCurrentUser(updatedUser);
            localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));

            // Update users map
            setUsers(prev => ({
                ...prev,
                [updatedUser.name]: updatedUser
            }));

            return updatedUser;
        } catch (error) {
            console.error("Refresh failed", error);
            throw error;
        }
    };

    const getUserProfile = () => {
        if (!currentUser) return null;
        // Return from users map to ensure latest data, or fallback to currentUser
        return users[currentUser.name] || currentUser;
    };

    const deleteAccount = async () => {
        try {
            await apiDeleteAccount();
            logout();
            return true;
        } catch (error) {
            console.error("Delete account failed", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            user: currentUser, // Alias for compatibility
            users,
            theme,
            toggleTheme,
            login,
            register,
            loginAsGuest,
            logout,
            getUserProfile,
            updateUser,
            refreshProfile,
            deleteAccount,
            fetchUsers,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
