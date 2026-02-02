import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import QRCodeView from './components/QRCodeView';
import ConfigPanel from './components/ConfigPanel';
import LoginPage from './components/LoginPage';
import './index.css';
import { LayoutDashboard, Settings, LogOut, MessageSquare, User } from 'lucide-react';

// Connect to socket
// Connect to socket - automatically detects if it should use localhost or the production URL
const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user && user.id) {
      socket.emit('join', user.id);
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.reload(); // Reset states
  };

  // Substitute with YOUR real Google Client ID from Google Cloud Console
  const GOOGLE_CLIENT_ID = "412723349811-io0r5hluk9id4qu0r3859p2k7hvun1vj.apps.googleusercontent.com";

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginPage onLogin={handleLogin} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="user-profile">
          <div className="avatar">
            {user.picture ? <img src={user.picture} alt="Profile" /> : <User size={20} />}
          </div>
          <div className="user-info">
            <h4>{user.name}</h4>
            <span>Logado</span>
          </div>
        </div>

        <div className="nav-links">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <Settings size={20} />
            Configuração
          </button>
        </div>
        <div className="nav-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            Sair da Conta
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <QRCodeView socket={socket} userId={user.id} />}
        {activeTab === 'config' && <ConfigPanel socket={socket} userId={user.id} />}
      </main>
    </div>
  );
}

export default App;
