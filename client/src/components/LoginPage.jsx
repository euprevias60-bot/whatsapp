import { useState } from 'react';
import { Chrome, Check } from 'lucide-react';
import '../index.css';

function LoginPage({ onLogin }) {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = () => {
        setLoading(true);
        // Simulate API call / Redirect
        setTimeout(() => {
            setLoading(false);
            onLogin({ name: "Usuario Google", photo: "https://lh3.googleusercontent.com/a/default-user" });
        }, 1500);
    };

    return (
        <div className="login-container">
            <div className="background-glow"></div>
            <div className="background-glow-2"></div>

            <div className="login-card glass-effect">
                <div className="login-header">
                    <div className="logo-circle">
                        <span className="logo-text">AI</span>
                    </div>
                    <h1>Bem-vindo</h1>
                    <p className="subtitle">Gerencie seu agente inteligente de WhatsApp</p>
                </div>

                <button
                    className="google-btn"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loader"></span>
                    ) : (
                        <>
                            <Chrome size={20} />
                            <span>Continuar com Google</span>
                        </>
                    )}
                </button>

                <div className="features-mini">
                    <div className="feature-item">
                        <Check size={14} className="check-icon" />
                        <span>Configuração Persistente</span>
                    </div>
                    <div className="feature-item">
                        <Check size={14} className="check-icon" />
                        <span>Conexão Segura</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
