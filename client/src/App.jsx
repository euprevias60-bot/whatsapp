import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import QRCodeView from './components/QRCodeView';
import ConfigPanel from './components/ConfigPanel';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SubscriptionWall from './components/SubscriptionWall';
import AdminPanel from './components/AdminPanel';
import './index.css';
import { LayoutDashboard, Settings, LogOut, MessageSquare, User, Shield } from 'lucide-react';

// Connect to socket
// Connect to socket - automatically detects if it should use localhost or the production URL
const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user && user.id) {
      // Passa o email no join para o servidor salvar
      socket.emit('join', user.id, user.email);

      socket.on('config', (data) => {
        if (data.isSubscribed !== undefined) {
          setIsSubscribed(data.isSubscribed);
        }
      });
    }
    return () => socket.off('config');
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

  const isAdmin = user?.email?.toLowerCase() === 'mateusolivercrew@gmail.com';
  console.log("Current User Email:", user?.email, "Is Admin:", isAdmin);

  if (!user) {
    if (!showLogin) {
      return <LandingPage onStart={() => setShowLogin(true)} />;
    }
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginPage onLogin={handleLogin} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="app-container">
      <nav className="sidebar-modern glass-effect">
        <div className="sidebar-brand">
          <div className="brand-logo">AI</div>
          <div className="brand-text">
            <span>WhatsApp</span>
            <small>Premium Agent</small>
          </div>
        </div>

        <div className="user-profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {user.picture ? <img src={user.picture} alt="Profile" /> : <User size={24} />}
              <div className={`status-ring ${isSubscribed ? 'premium' : 'free'}`}></div>
            </div>
            <div className="profile-meta">
              <h4>{user.name}</h4>
              <span className={`plan-badge ${isSubscribed ? 'premium' : 'free'}`}>
                {isSubscribed ? 'Plano Pro AI' : 'Plano Free'}
              </span>
            </div>
          </div>
        </div>

        <div className="nav-menu">
          <button
            className={`nav-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="nav-icon"><LayoutDashboard size={20} /></div>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-menu-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <div className="nav-icon"><Settings size={20} /></div>
            <span>Configuração</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-menu-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <div className="nav-icon"><Shield size={20} /></div>
              <span>Admin</span>
            </button>
          )}
        </div>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </nav>

      <main className="main-content-area">
        <div className="content-container">
          {activeTab === 'dashboard' && (
            isSubscribed ? (
              <QRCodeView socket={socket} userId={user.id} />
            ) : (
              <SubscriptionWall userId={user.id} />
            )
          )}
          {activeTab === 'config' && <ConfigPanel socket={socket} userId={user.id} />}
          {activeTab === 'admin' && isAdmin && <AdminPanel socket={socket} userId={user.id} />}
        </div>
      </main>
    </div>
  );
}

export default App;
