import { Users, Calendar, ShieldCheck, Mail, Clock, MessageSquare, Send, Crown, ShieldOff } from 'lucide-react';

function AdminPanel({ socket, userId, t }) {
    const [users, setUsers] = useState({});
    const [supportMessages, setSupportMessages] = useState([]);
    const [view, setView] = useState('users');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.emit('requestAllUsers', userId);
        socket.emit('requestSupportMessages', userId);
        socket.on('allUsersList', (data) => {
            setUsers(data);
            setLoading(false);
        });
        socket.on('supportMessagesList', (data) => setSupportMessages(data));
        socket.on('newSupportMessage', (data) => setSupportMessages(data));
        return () => {
            socket.off('allUsersList');
            socket.off('supportMessagesList');
            socket.off('newSupportMessage');
        };
    }, [socket, userId]);

    const handleToggleSubscription = (targetUserId) => {
        if (window.confirm(t('brand') === 'WhatsApp Premium Agent' ? 'Toggle subscription status for this user?' : 'Alterar status de assinatura deste usuário?')) {
            socket.emit('toggleSubscription', { adminId: userId, targetUserId });
        }
    };

    if (loading) {
        return <div className="admin-container"><div className="loading-state">{t('brand') === 'WhatsApp Premium Agent' ? 'Loading admin data...' : 'Carregando dados da administração...'}</div></div>;
    }

    const userList = Object.entries(users);

    return (
        <div className="admin-container animate-in">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>{t('admin')}</h1>
                    <p>{t('brand') === 'WhatsApp Premium Agent' ? 'Overview of users and support messages' : 'Visão geral de usuários e mensagens de suporte'}</p>
                </div>
                <div className="admin-tabs glass-effect">
                    <button className={`admin-tab-btn ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')}>
                        <Users size={18} /> <span>{t('brand') === 'WhatsApp Premium Agent' ? 'Users' : 'Usuários'}</span>
                    </button>
                    <button className={`admin-tab-btn ${view === 'support' ? 'active' : ''}`} onClick={() => setView('support')}>
                        <MessageSquare size={18} /> <span>{t('brand') === 'WhatsApp Premium Agent' ? 'Support' : 'Suporte'}</span>
                        {supportMessages.length > 0 && <span className="support-badge-count">{supportMessages.length}</span>}
                    </button>
                </div>
            </header>

            {view === 'users' ? (
                <div className="admin-view-content">
                    <div className="dashboard-stats">
                        <div className="dash-stat-card glass-effect">
                            <div className="stat-header"><Users size={20} className="icon-purple" /><span>{t('brand') === 'WhatsApp Premium Agent' ? 'Total Users' : 'Total de Usuários'}</span></div>
                            <div className="stat-value"><h3>{userList.length}</h3></div>
                        </div>
                        <div className="dash-stat-card glass-effect">
                            <div className="stat-header"><ShieldCheck size={20} className="icon-green" /><span>{t('brand') === 'WhatsApp Premium Agent' ? 'Active Subscribers' : 'Assinantes Ativos'}</span></div>
                            <div className="stat-value"><h3>{userList.filter(([_, u]) => u.isSubscribed).length}</h3></div>
                        </div>
                    </div>
                    <div className="admin-table-container glass-effect">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>{t('brand') === 'WhatsApp Premium Agent' ? 'User' : 'Usuário'}</th>
                                    <th>E-mail</th>
                                    <th>{t('brand') === 'WhatsApp Premium Agent' ? 'Registered' : 'Cadastro'}</th>
                                    <th>Status</th>
                                    <th>{t('brand') === 'WhatsApp Premium Agent' ? 'Expires' : 'Expira em'}</th>
                                    <th>{t('brand') === 'WhatsApp Premium Agent' ? 'Actions' : 'Ações'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userList.map(([id, u]) => (
                                    <tr key={id}>
                                        <td><div className="user-id-badge">{id.substring(0, 8)}...</div></td>
                                        <td><div className="flex-align gap-2"><Mail size={14} className="dim-text" />{u.email || '---'}</div></td>
                                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '---'}</td>
                                        <td><span className={`status-pill ${u.isSubscribed ? 'active' : 'inactive'}`}>{u.isSubscribed ? t('pro_plan') : t('free_plan')}</span></td>
                                        <td>{u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toLocaleDateString() : '---'}</td>
                                        <td>
                                            <button
                                                className={`action-btn-circle ${u.isSubscribed ? 'btn-deactivate' : 'btn-activate'}`}
                                                onClick={() => handleToggleSubscription(id)}
                                                title={u.isSubscribed ? 'Deactivate' : 'Activate'}
                                            >
                                                {u.isSubscribed ? <ShieldOff size={16} /> : <Crown size={16} />}
                                            </button>
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
                        <div className="empty-support glass-effect"><MessageSquare size={48} className="dim-text" /><h3>{t('brand') === 'WhatsApp Premium Agent' ? 'No support messages' : 'Nenhuma mensagem de suporte'}</h3></div>
                    ) : (
                        supportMessages.map((msg, index) => (
                            <div key={index} className="admin-support-card glass-effect">
                                <div className="support-card-header">
                                    <div className="user-info"><strong>{msg.userEmail || '---'}</strong></div>
                                    <span className="msg-time">{new Date(msg.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="support-card-body"><p>{msg.message}</p></div>
                                <div className="support-card-footer">
                                    <a href={`mailto:${msg.userEmail}?subject=Support`} className="btn-reply-email"><Send size={14} /><span>{t('brand') === 'WhatsApp Premium Agent' ? 'Reply via Email' : 'Responder via E-mail'}</span></a>
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
