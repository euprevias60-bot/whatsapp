import { useState } from 'react';
import { Sparkles, Check, CreditCard, Zap, Shield, MessageSquare, Loader2 } from 'lucide-react';

function SubscriptionWall({ userId }) {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${window.location.hostname === 'localhost' ? 'http://localhost:3001' : ''}/api/create-preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    planName: 'Pro AI Unlimited',
                    price: 59.90
                })
            });

            const data = await response.json();
            if (data.init_point) {
                window.location.href = data.init_point; // Redirect to Mercado Pago
            } else {
                alert('Erro ao gerar pagamento. Tente novamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        { icon: <Zap size={20} />, text: "IA Gemini 2.0: Respostas ultra-rápidas" },
        { icon: <Shield size={20} />, text: "Modo Takeover: Pausa automática ao digitar" },
        { icon: <MessageSquare size={20} />, text: "Contexto infinito: IA lembra do histórico" },
        { icon: <Sparkles size={20} />, text: "Persona customizável para sua marca" },
    ];

    return (
        <div className="subscription-wall">
            <div className="sub-card glass-effect">
                <div className="sub-badge">
                    <Sparkles size={16} />
                    <span>Acesso Premium</span>
                </div>

                <h2>Ative sua Inteligência Artificial</h2>
                <p className="sub-desc">Seu assistente está pronto para trabalhar, falta apenas configurar sua assinatura para começar a vender no automático.</p>

                <div className="sub-price">
                    <span className="currency">R$</span>
                    <span className="value">59,90</span>
                    <span className="period">/mês</span>
                </div>

                <div className="benefits-list">
                    {benefits.map((b, i) => (
                        <div key={i} className="benefit-item">
                            <div className="benefit-icon">{b.icon}</div>
                            <span>{b.text}</span>
                            <Check className="check-icon" size={16} />
                        </div>
                    ))}
                </div>

                <button
                    className="subscribe-main-btn"
                    onClick={handleSubscribe}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="spin" size={20} />
                            Processando...
                        </>
                    ) : (
                        <>
                            <CreditCard size={20} />
                            Assinar Agora via Mercado Pago
                        </>
                    )}
                </button>

                <p className="sub-footer-text">
                    Cancelamento fácil a qualquer momento. Pagamento 100% seguro.
                </p>
            </div>
        </div>
    );
}

export default SubscriptionWall;
