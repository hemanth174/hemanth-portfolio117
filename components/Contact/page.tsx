'use client'
import { useState } from 'react'
import { transition } from "../Skills/page"

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !message.trim()) {
            setStatus('error');
            setErrorMessage('Please fill in all fields.');
            return;
        }

        setStatus('sending');
        setErrorMessage('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong.');
            }

            setStatus('success');
            setName('');
            setEmail('');
            setMessage('');

            // Reset success message after 5 seconds
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err) {
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Failed to send message.');
        }
    };

    return (
        <section id="section7" className="min-h-screen bg-black text-white px-6 md:px-10 py-24 font-mono">
            <div className="mx-auto">
                <div className="mb-16">
                    <h2 className={`text-yellow-400 text-sm md:text-4xl tracking-widest font-bold flex items-center gap-4 uppercase font-roboto ${transition}`}>
                        CONTACT
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-start">
                    {/* Left Column: Socials */}
                    <div className="flex flex-col gap-10">
                        <h1 className="text-4xl md:text-7xl font-bold leading-tight tracking-tight uppercase">
                            Let&apos;s build <br /> something <span className="text-yellow-400">great.</span>
                        </h1>

                        <div className="flex flex-wrap gap-4 mt-8">
                            <a 
                                href="https://github.com/hemanth174" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:bg-yellow-300 px-8 py-3 text-white hover:text-black  border-2 border-yellow-400 transition-all tracking-[0.2em] font-bold text-sm hover:rounded-lg"
                            >
                                GITHUB
                            </a>
                            <a 
                                href="https://www.linkedin.com/in/hemanth-atthuluri/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:bg-yellow-300 px-8 py-3 text-white hover:text-black  border-2 border-yellow-400 transition-all tracking-[0.2em] font-bold text-sm hover:rounded-lg"
                            >
                                LINKEDIN
                            </a>
                            <a 
                                href="mailto:ramasaiahemanth@gmail.com" 
                                className="hover:bg-yellow-300 px-8 py-3 text-white hover:text-black  border-2 border-yellow-400 transition-all tracking-[0.2em] font-bold text-sm hover:rounded-lg"
                            >
                                EMAIL
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="bg-zinc-900/20 p-8 md:p-12 rounded-2xl border border-zinc-900 shadow-2xl">
                        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2 group">
                                <label className="text-zinc-600 text-xs font-bold tracking-widest group-focus-within:text-yellow-400 transition-colors">NAME</label>
                                <input 
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="bg-transparent border-b border-zinc-800 py-3 focus:border-yellow-400 outline-none transition-all text-white placeholder:text-zinc-700" 
                                />
                            </div>

                            <div className="flex flex-col gap-2 group">
                                <label className="text-zinc-600 text-xs font-bold tracking-widest group-focus-within:text-yellow-400 transition-colors">EMAIL</label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your Email"
                                    className="bg-transparent border-b border-zinc-800 py-3 focus:border-yellow-400 outline-none transition-all text-white placeholder:text-zinc-700" 
                                />
                            </div>

                            <div className="flex flex-col gap-2 group">
                                <label className="text-zinc-600 text-xs font-bold tracking-widest group-focus-within:text-yellow-400 transition-colors">MESSAGE</label>
                                <textarea 
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell me about your project..."
                                    className="bg-transparent border-b border-zinc-800 py-3 focus:border-yellow-400 outline-none transition-all text-white placeholder:text-zinc-700 resize-none" 
                                />
                            </div>

                            {/* Status Messages */}
                            {status === 'success' && (
                                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold animate-pulse">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Message sent successfully!
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errorMessage}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={status === 'sending'}
                                className={`w-full font-bold py-5 tracking-[0.3em] transition-all transform shadow-lg shadow-yellow-400/10 mt-4 uppercase ${
                                    status === 'sending'
                                        ? 'bg-yellow-300/50 text-black/50 cursor-not-allowed'
                                        : 'bg-yellow-300 text-black hover:bg-yellow-400 hover:-translate-y-1'
                                }`}
                            >
                                {status === 'sending' ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        SENDING...
                                    </span>
                                ) : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
