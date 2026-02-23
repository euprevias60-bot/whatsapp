import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import QRCodeView from './components/QRCodeView';
import ConfigPanel from './components/ConfigPanel';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SubscriptionWall from './components/SubscriptionWall';
import AdminPanel from './components/AdminPanel';
import SupportWidget from './components/SupportWidget';
import { translations } from './translations';
import './index.css';
import { LayoutDashboard, Settings, LogOut, MessageSquare, User, Shield, Globe } from 'lucide-react';

// Connect to socket
const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Language State
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || null);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Translation function
  const t = (key) => {
    const currentLang = lang || 'pt';
    return translations[currentLang][key] || key;
  };

  useEffect(() => {
    if (user && user.id) {
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
    window.location.reload();
  };

  const selectLanguage = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem('app_lang', selectedLang);
  };

  const GOOGLE_CLIENT_ID = "412723349811-io0r5hluk9id4qu0r3859p2k7hvun1vj.apps.googleusercontent.com";
  const isAdmin = user?.email?.toLowerCase() === 'mateusolivercrew@gmail.com';

  useEffect(() => {
    if (isAdmin) setIsSubscribed(true);
  }, [isAdmin]);

  // 1. Language Selection Screen
  if (!lang) {
    return (
      <div className="language-selector-overlay">
        <div className="language-card glass-effect">
          <div className="lang-icon">
            <Globe size={48} />
          </div>
          <h2>Select your language</h2>
          <p>Selecione seu idioma para continuar</p>

          <div className="lang-buttons">
            <button className="lang-btn" onClick={() => selectLanguage('pt')}>
              <span className="flag">🇧🇷</span>
              Português
            </button>
            <button className="lang-btn" onClick={() => selectLanguage('en')}>
              <span className="flag">🇺🇸</span>
              English
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (!showLogin) {
      return <LandingPage onStart={() => setShowLogin(true)} t={t} />;
    }
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginPage onLogin={handleLogin} t={t} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="app-container">
      <nav className="sidebar-modern glass-effect">
        <div className="sidebar-brand">
          <div className="logo-icon">AI</div>
          <div className="brand-text">
            <span>{lang === 'pt' ? 'WhatsApp' : 'WhatsApp'}</span>
            <small>{t('brand')}</small>
          </div>
        </div>

        <div className="user-profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {user.picture ? <img src={user.picture} alt="Profile" /> : <User size={24} />}
              <div className={`status-ring ${isSubscribed || isAdmin ? 'premium' : 'free'}`}></div>
            </div>
            <div className="profile-meta">
              <h4>{user.name}</h4>
              <span className={`plan-badge ${isSubscribed || isAdmin ? 'premium' : 'free'}`}>
                {isSubscribed || isAdmin ? t('pro_plan') : t('free_plan')}
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
            <span>{t('dashboard')}</span>
          </button>

          <button
            className={`nav-menu-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <div className="nav-icon"><Settings size={20} /></div>
            <span>{t('config')}</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-menu-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <div className="nav-icon"><Shield size={20} /></div>
              <span>{t('admin')}</span>
            </button>
          )}
        </div>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </nav>

      <main className="main-content-area">
        <div className="content-container">
          {activeTab === 'dashboard' && (
            (isSubscribed || isAdmin) ? (
              <QRCodeView socket={socket} userId={user.id} t={t} />
            ) : (
              <SubscriptionWall userId={user.id} t={t} />
            )
          )}
          {activeTab === 'config' && <ConfigPanel socket={socket} userId={user.id} t={t} />}
          {activeTab === 'admin' && isAdmin && <AdminPanel socket={socket} userId={user.id} t={t} />}
        </div>
      </main>

      {activeTab !== 'admin' && <SupportWidget socket={socket} user={user} t={t} />}
    </div>
  );
}

export default App;
