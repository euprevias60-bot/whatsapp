import { useEffect, useState } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

function QRCodeView({ socket }) {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('disconnected'); // disconnected, connected, authenticated

    useEffect(() => {
        // Request status on mount
        socket.emit('requestStatus');

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
    }, [socket]);

    return (
        <div className="dashboard-view">
            <header className="page-header">
                <h2>Dashboard</h2>
                <p>Manage your WhatsApp connection</p>
            </header>

            <div className="status-cards">
                <div className="card status-card">
                    <h3>Connection Status</h3>
                    <div className={`status-badge ${status}`}>
                        {status === 'disconnected' && <AlertCircle size={16} />}
                        {status === 'connected' && <CheckCircle size={16} />}
                        {status === 'authenticated' && <CheckCircle size={16} />}
                        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                </div>
            </div>

            <div className="qr-section">
                {status === 'connected' || status === 'authenticated' ? (
                    <div className="success-state">
                        <div className="icon-circle">
                            <Smartphone size={48} />
                        </div>
                        <h3>WhatsApp Connected</h3>
                        <p>Your AI agent is active and listening to messages.</p>
                    </div>
                ) : (
                    <div className="qr-container">
                        <h3>Scan QR Code</h3>
                        <p>Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device</p>
                        {qrCode ? (
                            <img src={qrCode} alt="WhatsApp QR Code" className="qr-image" />
                        ) : (
                            <div className="loading-qr">
                                <Loader2 className="spin" size={32} />
                                <p>Waiting for QR Code...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QRCodeView;
