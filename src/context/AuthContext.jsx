import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "access_token";

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     RESTORE SESSION
  ===================================================== */
  useEffect(() => {

    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]));

      setToken(storedToken);

      // ✅ UNIVERSAL USER OBJECT (EMAIL + GOOGLE + FUTURE MOBILE)
      setUser({
        user_id: payload.user_id || null,  
        email: payload.email || null,
        phone: payload.phone || null,
        name: payload.name || "Customer"
      });

    } catch (error) {
      console.error("Token decode error", error);

      localStorage.removeItem(TOKEN_KEY);

      setUser(null);
      setToken(null);
    }

    setLoading(false);

  }, []);

  /* =====================================================
     LOGIN (COMMON FOR ALL TYPES)
  ===================================================== */
  const login = (newToken, userData = {}) => {

    localStorage.setItem(TOKEN_KEY, newToken);

    setToken(newToken);

    // ✅ HANDLE ALL LOGIN TYPES
    setUser({
      user_id: userData.user_id || null,  
      email: userData?.email || null,
      phone: userData?.phone || null,
      name: userData?.name || "Customer"
    });
  };

  /* =====================================================
     LOGOUT
  ===================================================== */
  const logout = () => {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user_id"); // 🔥 ADD THIS

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};