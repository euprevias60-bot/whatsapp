import { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';

function ConfigPanel({ socket, userId, t }) {
    const [instruction, setInstruction] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!userId) return;

        socket.on('config', (data) => {
            if (data && data.systemInstruction) {
                setInstruction(data.systemInstruction);
            }
        });

        return () => {
            socket.off('config');
        }
    }, [socket, userId]);

    const handleSave = () => {
        socket.emit('updateConfig', {
            userId,
            systemInstruction: instruction
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="config-view">
            <header className="page-header">
                <h2>{t('config_title')}</h2>
                <p>{t('config_desc')}</p>
            </header>

            <div className="config-form card">
                <div className="form-group">
                    <label className="flex-align">
                        <Sparkles size={16} className="margin-right" />
                        {t('ai_prompt_label')}
                    </label>
                    <div className="helper-text">{t('feature_1_desc')}</div>
                    <textarea
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        className="premium-textarea"
                        rows={12}
                        placeholder={t('ai_prompt_placeholder')}
                    />
                </div>

                <div className="form-actions">
                    <button onClick={handleSave} className="premium-button">
                        <Save size={18} />
                        {t('save_config')}
                    </button>
                    {saved && <div className="save-indicator bounce-in">✓ {t('brand') === 'WhatsApp Premium Agent' ? 'Settings saved successfully!' : 'Configurações salvas com sucesso!'}</div>}
                </div>
            </div>
        </div>
    );
}

export default ConfigPanel;
