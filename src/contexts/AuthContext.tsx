import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type User = {
  id: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  name: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Verifică dacă utilizatorul este autentificat la încărcarea inițială
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Aici poți face un request către backend pentru a verifica autentificarea
        // Exemplu simplificat:
        const token = localStorage.getItem('token');
        if (token) {
          // Verifică token-ul cu backend-ul
          // const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
          // const userData = await response.json();
          // setUser(userData);
        }
      } catch (error) {
        console.error('Eroare la verificarea autentificării:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Exemplu de login simplificat
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      
      // Simulare login de admin pentru testare
      if (email === 'admin@example.com' && password === 'admin123') {
        const mockUser = {
          id: '1',
          email: 'admin@example.com',
          role: 'admin' as const,
          name: 'Administrator'
        };
        setUser(mockUser);
        localStorage.setItem('token', 'mock-token');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Eroare la autentificare:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth trebuie folosit în cadrul unui AuthProvider');
  }
  return context;
};
