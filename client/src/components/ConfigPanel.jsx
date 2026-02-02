import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

function ConfigPanel({ socket }) {
    const [instruction, setInstruction] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Request current config on mount
        socket.on('config', (data) => {
            if (data && data.systemInstruction) {
                setInstruction(data.systemInstruction);
            }
        });

        return () => {
            socket.off('config');
        }
    }, [socket]);

    const handleSave = () => {
        socket.emit('updateConfig', { systemInstruction: instruction });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="config-view">
            <header className="page-header">
                <h2>Agent Configuration</h2>
                <p>Define how your AI agent behaves</p>
            </header>

            <div className="config-form">
                <div className="form-group">
                    <label>System Instruction (Prompt)</label>
                    <div className="helper-text">Describe the persona and rules for your AI agent.</div>
                    <textarea
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        className="premium-textarea"
                        rows={10}
                        placeholder="e.g. You are a helpful support agent for a shoe store..."
                    />
                </div>

                <div className="form-actions">
                    <button onClick={handleSave} className="premium-button">
                        <Save size={18} />
                        Save Configuration
                    </button>
                    {saved && <span className="save-indicator">Changes saved!</span>}
                </div>
            </div>
        </div>
    );
}

export default ConfigPanel;
