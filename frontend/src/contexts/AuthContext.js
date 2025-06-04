import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [githubToken, setGithubToken] = useState(localStorage.getItem('githubToken'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${password}`
        }
      });
      
      if (response.status === 200) {
        setToken(password);
        setGithubToken(password);
        localStorage.setItem('githubToken', password);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setGithubToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('githubToken');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    token,
    githubToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 