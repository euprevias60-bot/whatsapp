import { useEffect, useState } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Loader2, LogOut, Play, Pause, Square, RefreshCw, MessageSquare, Clock, Activity, ShieldCheck, Zap } from 'lucide-react';

function QRCodeView({ socket, userId }) {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('disconnected'); // disconnected, loading, connected, authenticated
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!userId) return;

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

        socket.on('paused_status', (paused) => {
            setIsPaused(paused);
        });

        return () => {
            socket.off('qr');
            socket.off('status');
            socket.off('paused_status');
        };
    }, [socket, userId]);

    const handleStart = () => {
        socket.emit('start_bot', userId);
    };

    const handleStop = () => {
        if (window.confirm("Isso irá desconectar seu WhatsApp e fechar o robô. Continuar?")) {
            socket.emit('stop_bot', userId);
        }
    };

    const handlePause = () => {
        socket.emit('pause_bot', userId);
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>Central de Comando</h1>
                    <p>Gerencie sua automação de WhatsApp com inteligência artificial</p>
                </div>

                <div className="action-group">
                    {status === 'disconnected' ? (
                        <button className="btn-primary-glow" onClick={handleStart}>
                            <Play size={18} /> Ligar Assistente
                        </button>
                    ) : (
                        <div className="bot-actions">
                            <button className={`btn-status ${isPaused ? 'resume' : 'pause'}`} onClick={handlePause}>
                                {isPaused ? <><Play size={18} /> Retomar IA</> : <><Pause size={18} /> Pausar IA</>}
                            </button>
                            <button className="btn-danger" onClick={handleStop}>
                                <Square size={18} /> Desativar
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="dashboard-stats">
                <div className="dash-stat-card glass-effect">
                    <div className="stat-header">
                        <Activity size={20} className="icon-purple" />
                        <span>Status</span>
                    </div>
                    <div className="stat-value">
                        <h3 className={status}>
                            {status === 'authenticated' ? 'Operacional' : status === 'connected' ? 'Pronto' : status === 'loading' ? 'Iniciando' : 'Offline'}
                        </h3>
                    </div>
                </div>

                <div className="dash-stat-card glass-effect">
                    <div className="stat-header">
                        <Zap size={20} className="icon-blue" />
                        <span>Motor de IA</span>
                    </div>
                    <div className="stat-value">
                        <h3>Gemini 2.0</h3>
                    </div>
                </div>

                <div className="dash-stat-card glass-effect">
                    <div className="stat-header">
                        <ShieldCheck size={20} className="icon-green" />
                        <span>Segurança</span>
                    </div>
                    <div className="stat-value">
                        <h3>Criptografia Ativa</h3>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-area">
                <div className="connection-card glass-effect">
                    <div className="card-top">
                        <div className="flex-align gap-3">
                            <div className="phone-icon-bg">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h3>Conexão com Dispositivo</h3>
                                <p>Sincronize seu WhatsApp para começar</p>
                            </div>
                        </div>
                        <div className={`status-indicator ${status}`}>
                            {status === 'authenticated' ? 'Conectado' : 'Aguardando'}
                        </div>
                    </div>

                    <div className="connection-content">
                        {status === 'loading' ? (
                            <div className="loading-stage">
                                <Loader2 className="spin" size={60} />
                                <h3>Preparando Instância...</h3>
                                <p>Estamos configurando seu servidor dedicado de IA.</p>
                            </div>
                        ) : status === 'connected' || status === 'authenticated' ? (
                            <div className="connected-stage">
                                <div className="success-lottie-placeholder">
                                    <CheckCircle size={80} className="success-pulse" />
                                </div>
                                <h2>Tudo Pronto!</h2>
                                <p>Sua inteligência artificial está ativa e monitorando conversas.</p>
                                {isPaused && <div className="pause-banner">Assistente Pausado Manualmente</div>}
                            </div>
                        ) : qrCode ? (
                            <div className="qr-stage">
                                <div className="qr-frame">
                                    <img src={qrCode} alt="WhatsApp QR" />
                                </div>
                                <div className="qr-steps">
                                    <h4>Passo a Passo:</h4>
                                    <ul>
                                        <li><span>1</span> Abra o WhatsApp no celular</li>
                                        <li><span>2</span> Vá em Aparelhos Conectados</li>
                                        <li><span>3</span> Escaneie este código QR</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="offline-stage">
                                <AlertCircle size={48} className="warn-icon" />
                                <h3>Sistema Offline</h3>
                                <p>Clique no botão "Ligar Assistente" acima para gerar seu acesso.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QRCodeView;
