'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AiTutorChatProps {
  username: string
}

export default function AiTutorChat({ username }: AiTutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto scroll ke bawah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      })

      const data = await res.json()

      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
        if (data.session_id) setSessionId(data.session_id)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi ya!' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Koneksi bermasalah. Coba lagi!' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-800 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-base">🤖</div>
        <div>
          <div className="font-bold text-sm text-white">Professor Nova</div>
          <div className="text-xs text-teal-400">AI Chemistry Tutor</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs text-slate-400">Online</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[280px] max-h-[380px]">
        {/* Pesan awal kalau belum ada chat */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pt-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              🤖
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-sm p-4 max-w-sm">
              <p className="text-sm text-slate-300 leading-relaxed">
                "Selamat datang kembali, <span className="text-teal-400 font-semibold">{username}</span>! Sesi terakhirmu membahas asam dan basa. Siap tantangan stoikiometri hari ini? 🧪"
              </p>
            </div>
          </div>
        )}

        {/* Pesan chat */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1">
                🤖
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-teal-500/20 border border-teal-500/30 text-white rounded-br-sm'
                : 'bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1">
              🤖
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 focus-within:border-teal-500/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya Professor Nova..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-8 h-8 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0 text-sm"
          >
            ➤
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 text-center">Enter untuk kirim</p>
      </div>
    </div>
  )
}
