import { ChevronRight, MessageSquare, Zap, Shield, Smartphone, ArrowRight, Bot } from 'lucide-react';

function LandingPage({ onStart }) {
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
                    <span>WhatsApp Bot</span>
                </div>
                <button className="nav-btn" onClick={onStart}>Entrar</button>
            </nav>

            <main className="landing-hero">
                <div className="hero-content">
                    <div className="badge">
                        <Zap size={14} />
                        <span>Nova era de atendimento</span>
                    </div>
                    <h1>Transforme seu WhatsApp em uma <span>Máquina de Vendas</span> com IA</h1>
                    <p>Atenda seus clientes 24/7 com inteligência artificial de última geração. Automação inteligente que parece humana.</p>

                    <div className="hero-actions">
                        <button className="primary-landing-btn" onClick={onStart}>
                            Começar Agora Gratuitamente
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <strong>+10k</strong>
                            <span>Mensagens/dia</span>
                        </div>
                        <div className="divider-v"></div>
                        <div className="stat-item">
                            <strong>99%</strong>
                            <span>Satisfação</span>
                        </div>
                        <div className="divider-v"></div>
                        <div className="stat-item">
                            <strong>24/7</strong>
                            <span>Ativo</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="floating-card chat-card">
                        <div className="chat-header">
                            <div className="chat-avatar"></div>
                            <span>Cliente</span>
                        </div>
                        <div className="chat-bubble">Olá, vocês têm o modelo X disponível?</div>
                        <div className="chat-bubble bot">Sim! Temos em 3 cores. Deseja ver as fotos? ✨</div>
                    </div>
                    <div className="floating-card status-card-mini">
                        <div className="pulse-dot"></div>
                        <span>Bot Online</span>
                    </div>
                </div>
            </main>

            <section className="features-section">
                <div className="section-header">
                    <h2>Por que escolher nosso Bot?</h2>
                    <p>Tecnologia avançada para resultados extraordinários</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="f-icon purple">
                            <Bot size={24} />
                        </div>
                        <h3>Persona Customizável</h3>
                        <p>Defina exatamente como sua IA deve falar e se comportar com seus clientes.</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon blue">
                            <Shield size={24} />
                        </div>
                        <h3>Takeover Humano</h3>
                        <p>O bot pausa automaticamente quando você envia uma mensagem manual.</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon green">
                            <Smartphone size={24} />
                        </div>
                        <h3>Integração Simples</h3>
                        <p>Escaneie o QR Code e em menos de 1 minuto seu bot estará pronto para falar.</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon orange">
                            <MessageSquare size={24} />
                        </div>
                        <h3>Histórico Inteligente</h3>
                        <p>A IA entende o contexto da conversa para dar respostas precisas.</p>
                    </div>
                </div>
            </section>

            <section className="pricing-section">
                <div className="section-header">
                    <h2>Planos e Preços</h2>
                    <p>Escolha o plano ideal para o seu negócio crescer</p>
                </div>

                <div className="pricing-grid">
                    <div className="pricing-card featured">
                        <div className="featured-badge">Plano Único</div>
                        <div className="p-header">
                            <h3>Acesso Pro AI</h3>
                            <div className="price">R$ 59<span>,90/mês</span></div>
                        </div>
                        <ul className="p-features">
                            <li><CheckCircle size={16} /> WhatsApp Ilimitado</li>
                            <li><CheckCircle size={16} /> IA Gemini 2.0 Flash</li>
                            <li><CheckCircle size={16} /> Human Takeover (Pausa Automática)</li>
                            <li><CheckCircle size={16} /> Suporte Prioritário</li>
                        </ul>
                        <button className="pricing-btn" onClick={onStart}>Assinar Agora</button>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <p>&copy; 2024 WhatsApp AI Agent. O futuro do atendimento automatizado.</p>
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
