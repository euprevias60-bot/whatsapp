import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

function SupportWidget({ socket, user, t }) {
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
                            <span>{t('support_title')}</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="close-btn">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="support-body">
                        {sent ? (
                            <div className="support-success">
                                <p>{t('brand') === 'WhatsApp Premium Agent' ? 'Message sent successfully! Admin will contact you soon.' : 'Mensagem enviada com sucesso! O administrador Mateus entrará em contato em breve.'}</p>
                            </div>
                        ) : (
                            <>
                                <p>{t('support_placeholder')}</p>
                                <form onSubmit={handleSubmit} className="support-form">
                                    <textarea
                                        placeholder={t('support_placeholder')}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn-send-support">
                                        <Send size={16} />
                                        {t('support_send')}
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
