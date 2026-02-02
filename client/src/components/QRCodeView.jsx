import { useEffect, useState } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react';

function QRCodeView({ socket, userId }) {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('disconnected'); // disconnected, connected, authenticated

    useEffect(() => {
        if (!userId) return;

        // Request status on mount for this specific user
        socket.emit('requestStatus', userId);

        socket.on('qr', (data) => {
            setQrCode(data);
            setStatus('disconnected');
        });

        socket.on('status', (s) => {
            console.log("Status received:", s);
            setStatus(s);
            if (s === 'connected' || s === 'authenticated') {
                setQrCode('');
            }
        });

        return () => {
            socket.off('qr');
            socket.off('status');
        };
    }, [socket, userId]);

    const handleWhatsAppLogout = () => {
        if (window.confirm("Deseja realmente desconectar o WhatsApp desta conta?")) {
            socket.emit('logout_whatsapp', userId);
        }
    };

    return (
        <div className="dashboard-view">
            <header className="page-header">
                <h2>Dashboard</h2>
                <p>Gerencie sua conexão com o WhatsApp</p>
            </header>

            <div className="status-cards">
                <div className="card status-card">
                    <div className="flex-between">
                        <div>
                            <h3>Status da Conexão</h3>
                            <div className={`status-badge ${status}`}>
                                {status === 'disconnected' && <AlertCircle size={16} />}
                                {status === 'connected' && <CheckCircle size={16} />}
                                {status === 'authenticated' && <CheckCircle size={16} />}
                                <span>{status === 'authenticated' ? 'Autenticado' : status === 'connected' ? 'Pronto' : 'Desconectado'}</span>
                            </div>
                        </div>
                        {(status === 'connected' || status === 'authenticated') && (
                            <button className="secondary-btn logout-wa" onClick={handleWhatsAppLogout}>
                                <LogOut size={16} />
                                Desconectar WhatsApp
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="qr-section">
                {status === 'connected' || status === 'authenticated' ? (
                    <div className="success-state">
                        <div className="icon-circle success">
                            <Smartphone size={48} />
                        </div>
                        <h3>WhatsApp Conectado!</h3>
                        <p>Seu agente de IA está ativo e respondendo mensagens automaticamente.</p>
                    </div>
                ) : (
                    <div className="qr-container card">
                        <h3>Vincular Novo Dispositivo</h3>
                        <p className="instruction">1. Abra o WhatsApp no seu celular<br />2. Toque em Apresentações ou Configurações e selecione Aparelhos Conectados<br />3. Toque em Conectar um Aparelho e aponte para esta tela.</p>

                        <div className="qr-display">
                            {qrCode ? (
                                <img src={qrCode} alt="WhatsApp QR Code" className="qr-image" />
                            ) : (
                                <div className="loading-qr">
                                    <Loader2 className="spin" size={32} />
                                    <p>Gerando código QR...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QRCodeView;
