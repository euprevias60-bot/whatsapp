import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

function SupportWidget({ socket, user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        socket.emit('sendSupportMessage', {
            userId: user.id,
            userEmail: user.email,
            message: message
        });

        setMessage('');
        setSent(true);
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div className="support-widget-container">
            {isOpen && (
                <div className="support-chat-box glass-effect">
                    <div className="support-header">
                        <div className="flex-align gap-2">
                            <div className="support-dot"></div>
                            <span>Suporte ao Cliente</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="close-btn">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="support-body">
                        {sent ? (
                            <div className="support-success">
                                <p>Mensagem enviada com sucesso! O administrador Mateus entrará em contato em breve.</p>
                            </div>
                        ) : (
                            <>
                                <p>Olá! Como podemos ajudar você hoje? Deixe sua dúvida abaixo.</p>
                                <form onSubmit={handleSubmit} className="support-form">
                                    <textarea
                                        placeholder="Digite sua mensagem aqui..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn-send-support">
                                        <Send size={16} />
                                        Enviar Mensagem
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <button
                className={`support-float-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <MessageCircle size={28} />
            </button>
        </div>
    );
}

export default SupportWidget;
