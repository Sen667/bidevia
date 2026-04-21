'use client';

import { FormEvent, useMemo, useState } from 'react';

type ChatRole = 'user' | 'assistant';

type UiMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const STARTER_PROMPTS = [
  'Résume les incidents critiques des 24 dernières heures.',
  'Donne-moi un point de situation opérationnel rapide.',
  'Quels signaux surveiller en priorité aujourd\'hui ?',
];

function newMessage(role: ChatRole, content: string): UiMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

export default function LocalAiChat() {
  const [messages, setMessages] = useState<UiMessage[]>([
    newMessage(
      'assistant',
      'Assistant local prêt. Posez une question sur la situation, le suivi ou la priorisation.'
    ),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const sendMessage = async (rawPrompt?: string) => {
    const prompt = (rawPrompt ?? input).trim();
    if (!prompt || loading) return;

    const updated = [...messages, newMessage('user', prompt)];
    setMessages(updated);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/chat/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = payload?.error || 'Erreur de réponse du serveur de chat.';
        throw new Error(message);
      }

      const reply = typeof payload?.reply === 'string' ? payload.reply : '';
      if (!reply.trim()) {
        throw new Error('Réponse vide du modèle local.');
      }

      setMessages((prev) => [...prev, newMessage('assistant', reply)]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await sendMessage();
  };

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/65 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Assistant IA Local</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Connecté à LM Studio (local)</p>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Bêta
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-[1.4rem] border border-slate-100 bg-white p-3 sm:p-4 min-h-[280px] max-h-[420px] overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-[#1C1C1E] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="w-full flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-slate-100 text-slate-500">
                Assistant en cours de réflexion...
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[1.4rem] border border-slate-100 bg-white p-3 sm:p-4 space-y-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Prompts rapides</p>
          <div className="space-y-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block" htmlFor="chat-local-input">
              Votre message
            </label>
            <textarea
              id="chat-local-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ex: Fais un briefing opérationnel en 5 lignes"
              className="w-full min-h-[110px] resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
