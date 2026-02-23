import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { ShieldCheck, UserCircle, Check } from 'lucide-react';
import '../index.css';

function LoginPage({ onLogin, t }) {
    const [error, setError] = useState(null);

    const handleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            onLogin({
                id: decoded.sub,
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture
            });
        } catch (err) {
            setError(t('login_error') || "Erro ao processar login.");
        }
    };

    const handleMockLogin = (email = 'teste@exemplo.com', name = 'Usuário de Teste') => {
        onLogin({
            id: 'mock_' + (email === 'mateusolivercrew@gmail.com' ? 'admin' : 'user'),
            name: name,
            email: email,
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
                    <p className="subtitle">{t('login_desc')}</p>
                </div>

                <div className="login-actions">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => setError(t('login_error') || "Falha na autenticação.")}
                        theme="filled_black"
                        shape="pill"
                        text="continue_with"
                        width="100%"
                    />

                    {error && <p className="error-text">{error}</p>}

                    <div className="divider">
                        <span>{t('brand') === 'WhatsApp Premium Agent' ? 'or' : 'ou'}</span>
                    </div>

                    <div className="bypass-buttons">
                        <button className="dev-login-btn" onClick={() => handleMockLogin()}>
                            <UserCircle size={18} />
                            {t('demo_access')}
                        </button>

                        <button className="dev-login-btn admin-btn" onClick={() => handleMockLogin('mateusolivercrew@gmail.com', 'Administrador')}>
                            <ShieldCheck size={18} />
                            {t('admin_login')}
                        </button>
                    </div>
                </div>

                <div className="features-mini">
                    <div className="feature-item">
                        <Check size={14} className="check-icon" />
                        <span>{t('benefit_1')}</span>
                    </div>
                    <div className="feature-item">
                        <Check size={14} className="check-icon" />
                        <span>{t('benefit_4')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
