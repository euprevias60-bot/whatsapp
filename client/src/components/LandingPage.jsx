import { ChevronRight, MessageSquare, Zap, Shield, Smartphone, ArrowRight, Bot } from 'lucide-react';

function LandingPage({ onStart, t }) {
    return (
        <div className="landing-container">
            {/* Animated Background */}
            <div className="landing-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <nav className="landing-nav">
                <div className="logo">
                    <div className="logo-icon">AI</div>
                    <span>{t('brand')}</span>
                </div>
                <button className="nav-btn" onClick={onStart}>{t('login')}</button>
            </nav>

            <main className="landing-hero">
                <div className="hero-content">
                    <div className="badge">
                        <Zap size={14} />
                        <span>{t('hero_badge')}</span>
                    </div>
                    <h1>{t('hero_title_1')}<span>{t('hero_title_2')}</span>{t('hero_title_3')}</h1>
                    <p>{t('hero_desc')}</p>

                    <div className="hero-actions">
                        <button className="primary-landing-btn" onClick={onStart}>
                            {t('get_started')}
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <strong>+10k</strong>
                            <span>{t('stats_msg')}</span>
                        </div>
                        <div className="divider-v"></div>
                        <div className="stat-item">
                            <strong>99%</strong>
                            <span>{t('stats_satisfaction')}</span>
                        </div>
                        <div className="divider-v"></div>
                        <div className="stat-item">
                            <strong>24/7</strong>
                            <span>{t('stats_active')}</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="floating-card chat-card">
                        <div className="chat-header">
                            <div className="chat-avatar"></div>
                            <span>{t('bot_online')}</span>
                        </div>
                        <div className="chat-bubble">Olá, vocês têm o modelo X disponível?</div>
                        <div className="chat-bubble bot">Sim! Temos em 3 cores. Deseja ver as fotos? ✨</div>
                    </div>
                    <div className="floating-card status-card-mini">
                        <div className="pulse-dot"></div>
                        <span>{t('bot_online')}</span>
                    </div>
                </div>
            </main>

            <section className="features-section">
                <div className="section-header">
                    <h2>{t('features_title')}</h2>
                    <p>{t('features_subtitle')}</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="f-icon purple">
                            <Bot size={24} />
                        </div>
                        <h3>{t('feature_1_title')}</h3>
                        <p>{t('feature_1_desc')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon blue">
                            <Shield size={24} />
                        </div>
                        <h3>{t('feature_2_title')}</h3>
                        <p>{t('feature_2_desc')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon green">
                            <Smartphone size={24} />
                        </div>
                        <h3>{t('feature_3_title')}</h3>
                        <p>{t('feature_3_desc')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon orange">
                            <MessageSquare size={24} />
                        </div>
                        <h3>{t('feature_4_title')}</h3>
                        <p>{t('feature_4_desc')}</p>
                    </div>
                </div>
            </section>

            <section className="pricing-section">
                <div className="section-header">
                    <h2>{t('pricing_title')}</h2>
                    <p>{t('pricing_subtitle')}</p>
                </div>

                <div className="pricing-grid">
                    <div className="pricing-card featured">
                        <div className="featured-badge">{t('pricing_featured')}</div>
                        <div className="p-header">
                            <h3>{t('pricing_pro_title')}</h3>
                            <div className="price">{t('pricing_pro_price')}<span>{t('pricing_pro_period')}</span></div>
                        </div>
                        <ul className="p-features">
                            <li><CheckCircle size={16} /> {t('benefit_1')}</li>
                            <li><CheckCircle size={16} /> {t('benefit_2')}</li>
                            <li><CheckCircle size={16} /> {t('benefit_3')}</li>
                            <li><CheckCircle size={16} /> {t('benefit_4')}</li>
                        </ul>
                        <button className="pricing-btn" onClick={onStart}>{t('subscribe_now')}</button>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <p>{t('footer_text')}</p>
            </footer>
        </div>
    );
}

// Helper para os ícones de check na lista
function CheckCircle({ size }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: '#10b981', marginRight: '10px' }}
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}

export default LandingPage;
