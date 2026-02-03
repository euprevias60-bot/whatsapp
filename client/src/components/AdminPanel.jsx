import { useState, useEffect } from 'react';
import { Users, Calendar, ShieldCheck, Mail, Clock, MessageSquare, Send } from 'lucide-react';

function AdminPanel({ socket, userId }) {
    const [users, setUsers] = useState({});
    const [supportMessages, setSupportMessages] = useState([]);
    const [view, setView] = useState('users'); // 'users' or 'support'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.emit('requestAllUsers', userId);
        socket.emit('requestSupportMessages', userId);

        socket.on('allUsersList', (data) => {
            setUsers(data);
            setLoading(false);
        });

        socket.on('supportMessagesList', (data) => {
            setSupportMessages(data);
        });

        socket.on('newSupportMessage', (data) => {
            setSupportMessages(data);
        });

        return () => {
            socket.off('allUsersList');
            socket.off('supportMessagesList');
            socket.off('newSupportMessage');
        };
    }, [socket, userId]);

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading-state">Carregando dados da administração...</div>
            </div>
        );
    }

    const userList = Object.entries(users);

    return (
        <div className="admin-container animate-in">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>Painel Administrativo</h1>
                    <p>Visão geral de usuários e mensagens de suporte</p>
                </div>
                <div className="admin-tabs glass-effect">
                    <button
                        className={`admin-tab-btn ${view === 'users' ? 'active' : ''}`}
                        onClick={() => setView('users')}
                    >
                        <Users size={18} />
                        <span>Usuários</span>
                    </button>
                    <button
                        className={`admin-tab-btn ${view === 'support' ? 'active' : ''}`}
                        onClick={() => setView('support')}
                    >
                        <MessageSquare size={18} />
                        <span>Suporte</span>
                        {supportMessages.length > 0 && <span className="support-badge-count">{supportMessages.length}</span>}
                    </button>
                </div>
            </header>

            {view === 'users' ? (
                <div className="admin-view-content">
                    <div className="dashboard-stats">
                        <div className="dash-stat-card glass-effect">
                            <div className="stat-header">
                                <Users size={20} className="icon-purple" />
                                <span>Total de Usuários</span>
                            </div>
                            <div className="stat-value">
                                <h3>{userList.length}</h3>
                            </div>
                        </div>

                        <div className="dash-stat-card glass-effect">
                            <div className="stat-header">
                                <ShieldCheck size={20} className="icon-green" />
                                <span>Assinantes Ativos</span>
                            </div>
                            <div className="stat-value">
                                <h3>{userList.filter(([_, u]) => u.isSubscribed).length}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="admin-table-container glass-effect">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Usuário</th>
                                    <th>E-mail</th>
                                    <th>Cadastro</th>
                                    <th>Status</th>
                                    <th>Expira em</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userList.map(([id, u]) => (
                                    <tr key={id}>
                                        <td>
                                            <div className="user-id-badge">{id.substring(0, 8)}...</div>
                                        </td>
                                        <td>
                                            <div className="flex-align gap-2">
                                                <Mail size={14} className="dim-text" />
                                                {u.email || 'Não informado'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex-align gap-2">
                                                <Calendar size={14} className="dim-text" />
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '---'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${u.isSubscribed ? 'active' : 'inactive'}`}>
                                                {u.isSubscribed ? 'Assinante' : 'Gratuito'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex-align gap-2">
                                                <Clock size={14} className="dim-text" />
                                                {u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toLocaleDateString('pt-BR') : '---'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="support-messages-grid">
                    {supportMessages.length === 0 ? (
                        <div className="empty-support glass-effect">
                            <MessageSquare size={48} className="dim-text" />
                            <h3>Nenhuma mensagem de suporte</h3>
                            <p>As dúvidas dos seus usuários aparecerão aqui.</p>
                        </div>
                    ) : (
                        supportMessages.map((msg, index) => (
                            <div key={index} className="admin-support-card glass-effect">
                                <div className="support-card-header">
                                    <div className="user-info">
                                        <Mail size={16} className="icon-purple" />
                                        <strong>{msg.userEmail || 'Usuário Desconhecido'}</strong>
                                    </div>
                                    <span className="msg-time">{new Date(msg.timestamp).toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="support-card-body">
                                    <p>{msg.message}</p>
                                </div>
                                <div className="support-card-footer">
                                    <a
                                        href={`mailto:${msg.userEmail}?subject=Suporte WhatsApp AI`}
                                        className="btn-reply-email"
                                    >
                                        <Send size={14} />
                                        <span>Responder via E-mail</span>
                                    </a>
                                </div>
                            </div>
                        )).reverse()
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
