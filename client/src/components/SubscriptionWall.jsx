import { useState } from 'react';
import { Sparkles, Check, CreditCard, Zap, Shield, MessageSquare, Loader2 } from 'lucide-react';

function SubscriptionWall({ userId, t }) {
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
                window.location.href = data.init_point;
            } else {
                alert(t('pay_error') || 'Erro ao gerar pagamento.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(t('conn_error') || 'Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        { icon: <Zap size={20} />, text: t('benefit_2') },
        { icon: <Shield size={20} />, text: t('benefit_3') },
        { icon: <MessageSquare size={20} />, text: t('feature_4_desc') },
        { icon: <Sparkles size={20} />, text: t('feature_1_title') },
    ];

    return (
        <div className="subscription-wall">
            <div className="sub-card glass-effect">
                <div className="sub-badge">
                    <Sparkles size={16} />
                    <span>{t('pro_plan')}</span>
                </div>

                <h2>{t('wall_title')}</h2>
                <p className="sub-desc">{t('wall_desc')}</p>

                <div className="sub-price">
                    <span className="currency">{t('pricing_pro_price').split(' ')[0]}</span>
                    <span className="value">{t('pricing_pro_price').split(' ')[1]}</span>
                    <span className="period">{t('pricing_pro_period')}</span>
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
                            ...
                        </>
                    ) : (
                        <>
                            <CreditCard size={20} />
                            {t('subscribe_now')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default SubscriptionWall;
