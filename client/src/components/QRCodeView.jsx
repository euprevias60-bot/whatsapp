import { useEffect, useState } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Loader2, Play, Pause, Square, Activity, ShieldCheck, Zap } from 'lucide-react';

function QRCodeView({ socket, userId, t }) {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('disconnected');
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!userId) return;
        socket.emit('requestStatus', userId);
        socket.on('qr', (data) => {
            setQrCode(data);
            setStatus('disconnected');
        });
        socket.on('status', (s) => {
            setStatus(s);
            if (s === 'connected' || s === 'authenticated') setQrCode('');
        });
        socket.on('paused_status', (paused) => setIsPaused(paused));
        return () => {
            socket.off('qr');
            socket.off('status');
            socket.off('paused_status');
        };
    }, [socket, userId]);

    const handleStart = () => socket.emit('start_bot', userId);
    const handleStop = () => {
        if (window.confirm(t('brand') === 'WhatsApp Premium Agent' ? "This will disconnect your WhatsApp. Continue?" : "Isso irá desconectar seu WhatsApp e fechar o robô. Continuar?")) {
            socket.emit('stop_bot', userId);
        }
    };
    const handlePause = () => socket.emit('pause_bot', userId);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>{t('dashboard')}</h1>
                    <p>{t('hero_badge')}</p>
                </div>

                <div className="action-group">
                    {status === 'disconnected' ? (
                        <button className="btn-primary-glow" onClick={handleStart}>
                            <Play size={18} /> {t('brand') === 'WhatsApp Premium Agent' ? 'Start Assistant' : 'Ligar Assistente'}
                        </button>
                    ) : (
                        <div className="bot-actions">
                            <button className={`btn-status ${isPaused ? 'resume' : 'pause'}`} onClick={handlePause}>
                                {isPaused ? <><Play size={18} /> {t('resume_bot')}</> : <><Pause size={18} /> {t('pause_bot')}</>}
                            </button>
                            <button className="btn-danger" onClick={handleStop}>
                                <Square size={18} /> {t('brand') === 'WhatsApp Premium Agent' ? 'Deactivate' : 'Desativar'}
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
                            {status === 'authenticated' ? (t('brand') === 'WhatsApp Premium Agent' ? 'Operational' : 'Operacional') :
                                status === 'connected' ? (t('brand') === 'WhatsApp Premium Agent' ? 'Ready' : 'Pronto') :
                                    status === 'loading' ? (t('brand') === 'WhatsApp Premium Agent' ? 'Starting' : 'Iniciando') : 'Offline'}
                        </h3>
                    </div>
                </div>

                <div className="dash-stat-card glass-effect">
                    <div className="stat-header">
                        <Zap size={20} className="icon-blue" />
                        <span>{t('brand') === 'WhatsApp Premium Agent' ? 'AI Engine' : 'Motor de IA'}</span>
                    </div>
                    <div className="stat-value"><h3>Gemini 2.0</h3></div>
                </div>

                <div className="dash-stat-card glass-effect">
                    <div className="stat-header">
                        <ShieldCheck size={20} className="icon-green" />
                        <span>{t('brand') === 'WhatsApp Premium Agent' ? 'Security' : 'Segurança'}</span>
                    </div>
                    <div className="stat-value"><h3>{t('brand') === 'WhatsApp Premium Agent' ? 'Active Encryption' : 'Criptografia Ativa'}</h3></div>
                </div>
            </div>

            <div className="dashboard-main-area">
                <div className="connection-card glass-effect">
                    <div className="card-top">
                        <div className="flex-align gap-3">
                            <div className="phone-icon-bg"><Smartphone size={24} /></div>
                            <div>
                                <h3>{t('brand') === 'WhatsApp Premium Agent' ? 'Device Connection' : 'Conexão com Dispositivo'}</h3>
                                <p>{t('feature_3_desc')}</p>
                            </div>
                        </div>
                        <div className={`status-indicator ${status}`}>
                            {status === 'authenticated' ? (t('brand') === 'WhatsApp Premium Agent' ? 'Connected' : 'Conectado') : (t('brand') === 'WhatsApp Premium Agent' ? 'Waiting' : 'Aguardando')}
                        </div>
                    </div>

                    <div className="connection-content">
                        {status === 'loading' ? (
                            <div className="loading-stage">
                                <Loader2 className="spin" size={60} />
                                <h3>{t('brand') === 'WhatsApp Premium Agent' ? 'Preparing Instance...' : 'Preparando Instância...'}</h3>
                                <p>{t('brand') === 'WhatsApp Premium Agent' ? 'Configuring your dedicated AI server.' : 'Estamos configurando seu servidor dedicado de IA.'}</p>
                            </div>
                        ) : status === 'connected' || status === 'authenticated' ? (
                            <div className="connected-stage">
                                <CheckCircle size={80} className="success-pulse" />
                                <h2>{t('brand') === 'WhatsApp Premium Agent' ? 'All Ready!' : 'Tudo Pronto!'}</h2>
                                <p>{t('brand') === 'WhatsApp Premium Agent' ? 'Your AI is active and monitoring conversations.' : 'Sua inteligência artificial está ativa e monitorando conversas.'}</p>
                                {isPaused && <div className="pause-banner">{t('brand') === 'WhatsApp Premium Agent' ? 'Assistant Manually Paused' : 'Assistente Pausado Manualmente'}</div>}
                            </div>
                        ) : qrCode ? (
                            <div className="qr-stage">
                                <div className="qr-frame"><img src={qrCode} alt="WhatsApp QR" /></div>
                                <div className="qr-steps">
                                    <h4>{t('brand') === 'WhatsApp Premium Agent' ? 'Step-by-Step:' : 'Passo a Passo:'}</h4>
                                    <ul>
                                        <li><span>1</span> {t('brand') === 'WhatsApp Premium Agent' ? 'Open WhatsApp on your phone' : 'Abra o WhatsApp no celular'}</li>
                                        <li><span>2</span> {t('brand') === 'WhatsApp Premium Agent' ? 'Go to Linked Devices' : 'Vá em Aparelhos Conectados'}</li>
                                        <li><span>3</span> {t('brand') === 'WhatsApp Premium Agent' ? 'Scan this QR code' : 'Escaneie este código QR'}</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="offline-stage">
                                <AlertCircle size={48} className="warn-icon" />
                                <h3>{t('brand') === 'WhatsApp Premium Agent' ? 'System Offline' : 'Sistema Offline'}</h3>
                                <p>{t('brand') === 'WhatsApp Premium Agent' ? 'Click "Start Assistant" to generate access.' : 'Clique no botão acima para gerar seu acesso.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QRCodeView;
