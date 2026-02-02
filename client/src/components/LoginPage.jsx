import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Chrome, Check, ShieldCheck, UserCircle } from 'lucide-react';
import '../index.css';

function LoginPage({ onLogin }) {
    const [error, setError] = useState(null);

    const handleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("Login Success:", decoded);
            onLogin({
                id: decoded.sub,
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture
            });
        } catch (err) {
            setError("Erro ao processar login com Google.");
        }
    };

    const handleMockLogin = () => {
        // Fallback para teste sem ter o Client ID configurado ainda
        onLogin({
            id: 'mock_user_123',
            name: 'Usuário de Teste',
            email: 'teste@exemplo.com',
            picture: ''
        });
    };

    return (
        <div className="login-container">
            <div className="background-glow"></div>
            <div className="background-glow-2"></div>

            <div className="login-card glass-effect">
                <div className="login-header">
                    <div className="logo-circle">
                        <ShieldCheck size={32} color="#4f46e5" />
                    </div>
                    <h1>WhatsApp AI Agent</h1>
                    <p className="subtitle">Faça login para gerenciar seus robôs personalizados</p>
                </div>

                <div className="login-actions">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => setError("Falha na autenticação com Google.")}
                        theme="filled_black"
                        shape="pill"
                        text="continue_with"
                        width="100%"
                    />

                    {error && <p className="error-text">{error}</p>}

                    <div className="divider">
                        <span>ou</span>
                    </div>

                    <button className="dev-login-btn" onClick={handleMockLogin}>
                        <UserCircle size={18} />
                        Acesso Rápido (Demo)
                    </button>
                </div>

                <div className="features-mini">
                    <div className="feature-item">
                        <Check size={14} className="check-icon" />
                        <span>Múltiplas Contas</span>
                    </div>
                    <div className="feature-item">
                        <Check size={14} className="check-icon" />
                        <span>Privacidade Garantida</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
