import { useState } from 'react';
import io from 'socket.io-client';
import QRCodeView from './components/QRCodeView';
import ConfigPanel from './components/ConfigPanel';
import LoginPage from './components/LoginPage';
import './index.css';
import { LayoutDashboard, Settings, LogOut, MessageSquare, User } from 'lucide-react';

const socket = io('http://localhost:3001');

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="user-profile">
          <div className="avatar"></div> {/* Placeholder for user image */}
          <div className="user-info">
            <h4>{user.name}</h4>
            <span>Online</span>
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
          <button className="nav-item logout" onClick={() => setUser(null)}>
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <QRCodeView socket={socket} />}
        {activeTab === 'config' && <ConfigPanel socket={socket} />}
      </main>
    </div>
  );
}

export default App;
