import { useState, useEffect } from 'react';
import { Users, Calendar, ShieldCheck, Mail, Clock } from 'lucide-react';

function AdminPanel({ socket, userId }) {
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.emit('requestAllUsers', userId);

        socket.on('allUsersList', (data) => {
            setUsers(data);
            setLoading(false);
        });

        return () => socket.off('allUsersList');
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
        <div className="admin-container">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>Painel Administrativo</h1>
                    <p>Visão geral de usuários e assinaturas do sistema</p>
                </div>
            </header>

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
    );
}

export default AdminPanel;
