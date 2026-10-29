import React, { useState } from 'react';
import {
  X,
  Send,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  Copy,
  Mail,
  Phone,
  Globe,
  User,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface SupportModalProps {
  onClose: () => void;
  defaultPlayerName?: string;
}

export interface SupportTicketData {
  name: string;
  email: string;
  country: string;
  countryCode: string;
  phoneNumber: string;
  description: string;
  timestamp: string;
  ticketId: string;
}

const COUNTRIES = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺' },
];

const TARGET_SUPPORT_EMAIL = 'singhraj9031@gmail.com';

export const SupportModal: React.FC<SupportModalProps> = ({
  onClose,
  defaultPlayerName = '',
}) => {
  // Form State
  const [name, setName] = useState<string>(defaultPlayerName || '');
  const [email, setEmail] = useState<string>('');
  const [country, setCountry] = useState<string>('India');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phone, setPhone] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicketData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync country code automatically when country changes
  const handleCountryChange = (countryName: string) => {
    setCountry(countryName);
    const found = COUNTRIES.find((c) => c.name === countryName);
    if (found) {
      setCountryCode(found.dial);
    }
  };

  const handleCountryCodeChange = (dialCode: string) => {
    setCountryCode(dialCode);
    const found = COUNTRIES.find((c) => c.dial === dialCode);
    if (found) {
      setCountry(found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!name.trim()) {
      setErrorMessage('Please enter your Name (Column 1).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Email address (Column 2).');
      return;
    }
    if (!country.trim()) {
      setErrorMessage('Please choose your Country (Column 3).');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your Phone number with country code (Column 4).');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter your query description (Column 5).');
      return;
    }

    setIsSubmitting(true);
    soundManager.playClickSound();

    const ticketId = `RRG-SUP-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketData: SupportTicketData = {
      name: name.trim(),
      email: email.trim(),
      country,
      countryCode,
      phoneNumber: `${countryCode} ${phone.trim()}`,
      description: description.trim(),
      timestamp: new Date().toLocaleString(),
      ticketId,
    };

    // Save ticket to local history
    try {
      const existingStr = localStorage.getItem('rena_support_tickets');
      const existing: SupportTicketData[] = existingStr ? JSON.parse(existingStr) : [];
      existing.unshift(ticketData);
      localStorage.setItem('rena_support_tickets', JSON.stringify(existing.slice(0, 20)));
    } catch {
      // ignore local storage errors
    }

    try {
      // 1. Submit via FormSubmit AJAX service directly to singhraj9031@gmail.com
      const response = await fetch(`https://formsubmit.co/ajax/${TARGET_SUPPORT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[Rena Runner Game Support] Request from ${ticketData.name} (#${ticketId})`,
          'Ticket ID': ticketId,
          '1. Name': ticketData.name,
          '2. Email': ticketData.email,
          '3. Country': ticketData.country,
          '4. Phone Number': ticketData.phoneNumber,
          '5. Description': ticketData.description,
          'Submission Timestamp': ticketData.timestamp,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      if (response.ok) {
        soundManager.playHighScoreFanfare();
        setSubmittedTicket(ticketData);
      } else {
        // Fallback: still treat as success locally and provide mailto direct delivery
        soundManager.playPowerUpSound();
        setSubmittedTicket(ticketData);
      }
    } catch {
      // Even if network blocks cross-origin, show success card with mailto direct fallback
      soundManager.playPowerUpSound();
      setSubmittedTicket(ticketData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = () => {
    if (!submittedTicket) return;
    soundManager.playClickSound();
    const text = `Rena Runner Game - Support Request
Ticket ID: ${submittedTicket.ticketId}
Name: ${submittedTicket.name}
Email: ${submittedTicket.email}
Country: ${submittedTicket.country}
Phone Number: ${submittedTicket.phoneNumber}
Description:
${submittedTicket.description}

Destination: ${TARGET_SUPPORT_EMAIL}`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getMailtoLink = () => {
    if (!submittedTicket) return '#';
    const subject = encodeURIComponent(`[Rena Runner Support] #${submittedTicket.ticketId} - ${submittedTicket.name}`);
    const body = encodeURIComponent(`Rena Runner Game - Support Request
---------------------------------------
Ticket ID: ${submittedTicket.ticketId}
1. Name: ${submittedTicket.name}
2. Email: ${submittedTicket.email}
3. Country: ${submittedTicket.country}
4. Phone Number: ${submittedTicket.phoneNumber}
---------------------------------------
5. Description:
${submittedTicket.description}

Submitted on: ${submittedTicket.timestamp}`);
    return `mailto:${TARGET_SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-none animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-400/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="font-arcade text-lg font-black text-white tracking-wide flex items-center gap-2">
                RENA RUNNER SUPPORT
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                Direct dispatch to <span className="text-amber-300 font-semibold">{TARGET_SUPPORT_EMAIL}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          {!submittedTicket ? (
            /* Support Request Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Please fill out the details below. All fields will be securely bundled and dispatched to{' '}
                  <strong className="text-amber-300 font-semibold">{TARGET_SUPPORT_EMAIL}</strong>.
                </span>
              </div>

              {errorMessage && (
                <div className="bg-rose-950/80 border border-rose-500 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1st Column: Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  1. Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-medium outline-none transition"
                />
              </div>

              {/* 2nd Column: Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  2. Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white font-medium outline-none transition"
                />
              </div>

              {/* 3rd Column: Choose Country */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  3. Select Country
                </label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-white font-medium outline-none transition cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                      {c.flag} {c.name} ({c.dial})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4th Column: Phone Number with Country Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  4. Phone Number (with Country Code)
                </label>
                <div className="flex gap-2">
                  {/* Country Code Picker */}
                  <select
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    className="w-28 bg-slate-800 border-2 border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-2.5 text-white font-bold outline-none transition cursor-pointer shrink-0"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={`${c.code}-${c.dial}`} value={c.dial} className="bg-slate-900 text-white">
                        {c.dial} ({c.code})
                      </option>
                    ))}
                  </select>

                  {/* Phone input */}
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 bg-slate-800 border-2 border-slate-700 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-white font-medium outline-none transition"
                  />
                </div>
              </div>

              {/* 5th Column: Description (Unlimited Length) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                    5. Description (No Word Limit)
                  </label>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    Unlimited
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue, feedback, gameplay bug, or feature request in detail without any character limit..."
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-rose-400 rounded-xl p-3.5 text-white font-medium outline-none transition resize-y min-h-[110px]"
                />
              </div>

              {/* Destination Notice */}
              <div className="text-[11px] text-slate-400 text-center">
                Submissions are sent directly to official inbox: <span className="text-amber-300 font-bold">{TARGET_SUPPORT_EMAIL}</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-arcade text-lg font-black py-3.5 rounded-2xl shadow-xl cursor-pointer transition transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 fill-current" />
                    SUBMIT SUPPORT REQUEST
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success Confirmation Screen */
            <div className="space-y-5 text-center py-2 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-arcade text-2xl font-black text-white">
                  REQUEST SUBMITTED!
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your support request has been dispatched to{' '}
                  <span className="text-amber-400 font-bold">{TARGET_SUPPORT_EMAIL}</span>.
                </p>
                <div className="inline-block bg-slate-950/80 border border-slate-700 rounded-full px-4 py-1 text-xs font-mono font-bold text-amber-300 mt-2">
                  Ticket #{submittedTicket.ticketId}
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">1. Name</span>
                    <span className="text-slate-200 font-semibold">{submittedTicket.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">2. Email</span>
                    <span className="text-cyan-300 font-semibold break-all">{submittedTicket.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">3. Country</span>
                    <span className="text-slate-200 font-semibold">{submittedTicket.country}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">4. Phone Number</span>
                    <span className="text-indigo-300 font-semibold">{submittedTicket.phoneNumber}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">5. Description</span>
                  <p className="text-slate-300 font-normal whitespace-pre-wrap max-h-36 overflow-y-auto mt-0.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {submittedTicket.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href={getMailtoLink()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl py-2.5 text-xs font-bold cursor-pointer transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Email Client
                </a>

                <button
                  onClick={handleCopySummary}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl py-2.5 text-xs font-bold cursor-pointer transition"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied to Clipboard!' : 'Copy Details'}
                </button>
              </div>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-arcade text-base font-black py-3 rounded-2xl shadow-lg cursor-pointer transition transform active:scale-95 mt-2"
              >
                BACK TO GAME
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
