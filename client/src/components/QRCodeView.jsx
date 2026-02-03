import { useEffect, useState } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Loader2, LogOut, Play, Pause, Square, RefreshCw } from 'lucide-react';

function QRCodeView({ socket, userId }) {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('disconnected'); // disconnected, loading, connected, authenticated
    const [isPaused, setIsPaused] = useState(false);

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
        <div className="dashboard-view">
            <header className="page-header">
                <div className="flex-between w-full">
                    <div>
                        <h2>Dashboard</h2>
                        <p>Controle o seu agente inteligente</p>
                    </div>

                    <div className="bot-controls">
                        {status === 'disconnected' ? (
                            <button className="control-btn start" onClick={handleStart}>
                                <Play size={18} /> Iniciar Bot
                            </button>
                        ) : (
                            <>
                                <button className={`control-btn pause ${isPaused ? 'resume' : ''}`} onClick={handlePause}>
                                    {isPaused ? <><Play size={18} /> Retomar</> : <><Pause size={18} /> Pausar IA</>}
                                </button>
                                <button className="control-btn stop" onClick={handleStop}>
                                    <Square size={18} /> Parar Bot
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="status-cards">
                <div className="card status-card">
                    <div className="flex-between">
                        <div>
                            <h3>Status da Operação</h3>
                            <div className="flex-align gap-2 mt-2">
                                <div className={`status-badge ${status}`}>
                                    {status === 'disconnected' && <AlertCircle size={16} />}
                                    {(status === 'connected' || status === 'authenticated') && <CheckCircle size={16} />}
                                    {status === 'loading' && <RefreshCw size={16} className="spin" />}
                                    <span>
                                        {status === 'authenticated' ? 'Autenticado' :
                                            status === 'connected' ? 'Pronto' :
                                                status === 'loading' ? 'Iniciando...' : 'Desconectado'}
                                    </span>
                                </div>
                                {isPaused && status !== 'disconnected' && (
                                    <div className="status-badge paused">
                                        <Pause size={16} />
                                        <span>IA Pausada</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="qr-section">
                {status === 'loading' ? (
                    <div className="loading-qr card">
                        <Loader2 className="spin" size={48} />
                        <h3>Iniciando WhatsApp...</h3>
                        <p>Isso pode levar até 30 segundos na nuvem.</p>
                    </div>
                ) : status === 'connected' || status === 'authenticated' ? (
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
