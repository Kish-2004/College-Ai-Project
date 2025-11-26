// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // We just installed this

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [user, setUser] = useState(null); // Will hold { email, role }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      try {
        const decodedUser = decodeToken(storedToken);
        if (decodedUser) {
          setUser(decodedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Invalid token in storage, clearing...");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const decodeToken = (tokenToDecode) => {
    try {
      const decoded = jwtDecode(tokenToDecode);
      // Backend adds roles as: "roles": [{"authority": "ROLE_USER"}]
      const roleName = decoded.roles[0]?.authority;

      let role = "USER"; // Default to user
      if (roleName === "ROLE_ADMIN") {
        role = "ADMIN";
      }

      return {
        email: decoded.sub, // 'sub' is the email
        role: role,
      };
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  };

  const login = (newToken) => {
    const decodedUser = decodeToken(newToken);
    if (decodedUser) {
      localStorage.setItem("authToken", newToken);
      setToken(newToken);
      setUser(decodedUser);
    } else {
      console.error("Login failed: could not decode token");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  // The value we pass to all components
  const value = {
    token,
    user,
    isLoading,
    isAuthenticated: !!user, // True if 'user' is not null
    isAdmin: user?.role === "ADMIN",
    login,
    logout,
  };

  // Show a loading screen while we check the token
  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This is the hook we'll use in all our components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
