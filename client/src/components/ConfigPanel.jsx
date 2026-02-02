import { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';

function ConfigPanel({ socket, userId }) {
    const [instruction, setInstruction] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // Current config is sent by the server upon joining
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
                <h2>Persona da IA</h2>
                <p>Defina a personalidade e as regras do seu robô</p>
            </header>

            <div className="config-form card">
                <div className="form-group">
                    <label className="flex-align">
                        <Sparkles size={16} className="margin-right" />
                        Instrução do Sistema (Prompt)
                    </label>
                    <div className="helper-text">Descreva detalhadamente como a IA deve agir, o que ela deve vender ou como deve responder aos clientes.</div>
                    <textarea
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        className="premium-textarea"
                        rows={12}
                        placeholder="Ex: Você é um vendedor amigável de uma loja de roupas. Seu objetivo é ajudar o cliente a escolher o tamanho certo e informar que entregamos em todo o Brasil..."
                    />
                </div>

                <div className="form-actions">
                    <button onClick={handleSave} className="premium-button">
                        <Save size={18} />
                        Salvar Configurações
                    </button>
                    {saved && <div className="save-indicator bounce-in">✓ Configurações salvas com sucesso!</div>}
                </div>
            </div>
        </div>
    );
}

export default ConfigPanel;
