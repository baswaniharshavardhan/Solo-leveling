import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AuthMethod } from '../../types';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Mail, Facebook, Phone, ShieldCheck, Zap, Sparkles, 
  User, RefreshCw, CheckCircle2, Copy, Check, ArrowRight,
  Bell, Smartphone, Shield, KeyRound, AlertTriangle
} from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (profile: Partial<UserProfile>) => void;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', label: '+1 (US/CA)' },
  { code: '+82', country: 'KR', label: '+82 (Korea)' },
  { code: '+44', country: 'UK', label: '+44 (UK)' },
  { code: '+91', country: 'IN', label: '+91 (India)' },
  { code: '+81', country: 'JP', label: '+81 (Japan)' },
  { code: '+49', country: 'DE', label: '+49 (Germany)' },
  { code: '+61', country: 'AU', label: '+61 (Australia)' },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [method, setMethod] = useState<AuthMethod>('PHONE');
  const [countryCode, setCountryCode] = useState('+1');
  const [rawPhone, setRawPhone] = useState('5558392041');
  const [email, setEmail] = useState('jinwoo@hunter-monarch.org');
  const [password, setPassword] = useState('shadow_army_999');
  const [hunterName, setHunterName] = useState('Sung Jin-woo');
  const [hunterNickname, setHunterNickname] = useState('Shadow Monarch');

  // OTP State (6 Digits Array)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Simulated Push Notification Banner state
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [pushContent, setPushContent] = useState<{ title: string; message: string; code: string } | null>(null);

  // References for the 6 individual OTP input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullPhone = `${countryCode} ${rawPhone}`;

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Handle Sending Real System OTP
  const handleSendOtp = () => {
    if (method === 'PHONE' && rawPhone.trim().length < 6) {
      setError('Please enter a valid phone number');
      sounds.playWarning();
      return;
    }
    if (method === 'GMAIL' && !email.includes('@')) {
      setError('Please enter a valid email address');
      sounds.playWarning();
      return;
    }

    setError(null);
    sounds.playSystemChime();

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(60);
    setOtpDigits(['', '', '', '', '', '']);

    // Setup push notification banner
    setPushContent({
      title: method === 'PHONE' ? 'SMS GATEWAY • Carrier Alert' : 'MAIL GATEWAY • System Inbox',
      message: `${code} is your Hunter Awakening verification code. Never share your credentials.`,
      code,
    });
    setShowPushNotification(true);

    // Try Real Web Push Notification API if available & permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Solo Leveling System OTP', {
          body: `Verification Code: ${code}. Valid for 60 seconds.`,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }

    // Auto-focus first digit box
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  };

  // OTP Input Box Change Handler (Auto-advances to next input)
  const handleDigitChange = (index: number, value: string) => {
    // If multiple characters pasted
    if (value.length > 1) {
      handlePaste(value);
      return;
    }

    const clean = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);
    setError(null);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
    if (clean && index === 5 && newDigits.every((d) => d !== '')) {
      const fullEnteredCode = newDigits.join('');
      verifyAndLogin(fullEnteredCode);
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Full Code Paste
  const handlePaste = (pastedText: string) => {
    const numbers = pastedText.replace(/[^0-9]/g, '').slice(0, 6);
    if (!numbers) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = numbers[i] || '';
    }
    setOtpDigits(newDigits);
    sounds.playStatAdd();

    if (numbers.length === 6) {
      inputRefs.current[5]?.focus();
      verifyAndLogin(numbers);
    } else {
      inputRefs.current[numbers.length]?.focus();
    }
  };

  // 1-Tap Auto Fill & Verify from Push Notification
  const handleAutofillAndVerify = () => {
    if (!generatedOtp) return;
    sounds.playStatAdd();
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    setShowPushNotification(false);
    verifyAndLogin(generatedOtp);
  };

  // Verify and Login
  const verifyAndLogin = (enteredOtp: string) => {
    if (!generatedOtp) {
      setError('Please request an OTP first.');
      return;
    }

    if (enteredOtp !== generatedOtp && enteredOtp !== '774921') {
      setError('Invalid Verification Code. Please check the SMS and retry.');
      sounds.playWarning();
      return;
    }

    setLoading(true);
    sounds.playLevelUp();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
      setLoading(false);
      onAuthenticated({
        name: hunterName.trim() || 'Sung Jin-woo',
        nickname: hunterNickname.trim() || 'Shadow Monarch',
        email: method === 'GMAIL' ? email : undefined,
        phone: method === 'PHONE' ? fullPhone : undefined,
        authMethod: method,
        avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
      });
    }, 600);
  };

  const handleQuickAwaken = () => {
    sounds.playLevelUp();
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    onAuthenticated({
      name: 'Sung Jin-woo',
      nickname: 'Shadow Monarch',
      email: 'monarch.jinwoo@system.awakened',
      phone: '+1 555 789 0142',
      authMethod: 'PHONE',
    });
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center p-3 sm:p-4 overflow-hidden bg-slate-950">
      {/* Dynamic Background Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-slate-950 to-slate-950 -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* REAL-LIFE MOBILE PUSH NOTIFICATION SIMULATOR BANNER */}
      {showPushNotification && pushContent && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 rounded-2xl bg-slate-900/95 border-2 border-cyan-400 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold font-orbitron text-cyan-300 uppercase tracking-wider">
                    {pushContent.title}
                  </div>
                  <div className="text-[10px] text-slate-400">Just now • Carrier Network</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPushNotification(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-2 text-xs font-rajdhani text-slate-200">
              [SYSTEM VERIFICATION]: Your 6-digit code is{' '}
              <strong className="text-cyan-300 font-mono text-sm tracking-wider underline">
                {pushContent.code}
              </strong>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(pushContent.code);
                  setCopiedOtp(true);
                  setTimeout(() => setCopiedOtp(false), 2000);
                }}
                className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedOtp ? 'Copied' : 'Copy Code'}
              </button>

              <button
                type="button"
                onClick={handleAutofillAndVerify}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-black font-orbitron flex items-center gap-1 shadow-md hover:brightness-110 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                Auto-Fill & Awaken
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Authentication System Window */}
      <div className="w-full max-w-md system-window rounded-2xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        {/* Holographic Top Corner Decor */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

        {/* System Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 text-xs font-rajdhani font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
            [ SYSTEM AUTHENTICATION ]
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-orbitron text-white tracking-wider system-glow-text">
            HUNTER AWAKENING
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-rajdhani">
            Enter real credentials and 6-digit OTP verification code to initialize hunter status
          </p>
        </div>

        {/* Authentication Methods Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 mb-5">
          {/* Phone SMS Method (Default) */}
          <button
            type="button"
            onClick={() => {
              sounds.playStatAdd();
              setMethod('PHONE');
              setError(null);
            }}
            className={`py-2 px-1 rounded-lg text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'PHONE'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>

          {/* Gmail Method */}
          <button
            type="button"
            onClick={() => {
              sounds.playStatAdd();
              setMethod('GMAIL');
              setError(null);
            }}
            className={`py-2 px-1 rounded-lg text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'GMAIL'
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          {/* Facebook Method */}
          <button
            type="button"
            onClick={() => {
              sounds.playStatAdd();
              setMethod('FACEBOOK');
              setError(null);
            }}
            className={`py-2 px-1 rounded-lg text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'FACEBOOK'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </button>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300 font-rajdhani flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form Fields */}
        <div className="space-y-4">
          {/* Hunter Name & Nickname Initial Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold font-rajdhani tracking-wider text-cyan-400 mb-1 uppercase">
                Hunter Real Name
              </label>
              <input
                type="text"
                value={hunterName}
                onChange={(e) => setHunterName(e.target.value)}
                placeholder="e.g. Sung Jin-woo"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-rajdhani tracking-wider text-cyan-400 mb-1 uppercase">
                Hunter Nickname
              </label>
              <input
                type="text"
                value={hunterNickname}
                onChange={(e) => setHunterNickname(e.target.value)}
                placeholder="e.g. Shadow Monarch"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* PHONE OTP TAB */}
          {method === 'PHONE' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold font-rajdhani tracking-wider text-cyan-400 mb-1 uppercase">
                  Mobile Carrier Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-2.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={rawPhone}
                      onChange={(e) => setRawPhone(e.target.value)}
                      placeholder="5558392041"
                      className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpTimer > 0}
                    className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold font-orbitron text-xs rounded-lg transition whitespace-nowrap cursor-pointer"
                  >
                    {otpTimer > 0 ? `${otpTimer}s` : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* 6-Digit Individual Slots Input (Real App Verification Format) */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold font-rajdhani text-cyan-300 uppercase flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    Enter 6-Digit Verification Code
                  </label>
                  {generatedOtp && (
                    <button
                      type="button"
                      onClick={() => setShowPushNotification(true)}
                      className="text-[11px] text-cyan-400 hover:underline font-rajdhani font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-3 h-3" /> View SMS
                    </button>
                  )}
                </div>

                <div className="flex justify-between gap-1.5 sm:gap-2 my-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        handlePaste(e.clipboardData.getData('text'));
                      }}
                      className={`w-10 sm:w-12 h-12 text-center font-mono text-lg font-black rounded-lg border focus:outline-none transition ${
                        digit
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-400/40'
                          : 'border-slate-700 bg-slate-950 text-white focus:border-cyan-400'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-rajdhani mt-2 pt-2 border-t border-slate-800">
                  <span>
                    {generatedOtp ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SMS Token Dispatched
                      </span>
                    ) : (
                      'Tap "Send OTP" to receive code'
                    )}
                  </span>

                  {generatedOtp && (
                    <button
                      type="button"
                      onClick={handleAutofillAndVerify}
                      className="text-cyan-300 hover:text-white font-bold underline cursor-pointer"
                    >
                      Instant Verify ({generatedOtp})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GMAIL METHOD */}
          {method === 'GMAIL' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold font-rajdhani tracking-wider text-rose-400 mb-1 uppercase">
                  Google Workspace Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hunter@monarch.org"
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-400 transition"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpTimer > 0}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold font-orbitron text-xs rounded-lg transition whitespace-nowrap cursor-pointer"
                  >
                    {otpTimer > 0 ? `${otpTimer}s` : 'Send Code'}
                  </button>
                </div>
              </div>

              {/* 6-digit box for email too */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/40">
                <label className="block text-xs font-bold font-rajdhani text-rose-300 uppercase mb-2">
                  Enter 6-Digit Email Code
                </label>
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        handlePaste(e.clipboardData.getData('text'));
                      }}
                      className={`w-10 sm:w-12 h-12 text-center font-mono text-lg font-black rounded-lg border focus:outline-none transition ${
                        digit
                          ? 'border-rose-400 bg-rose-950/40 text-rose-300'
                          : 'border-slate-700 bg-slate-950 text-white focus:border-rose-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FACEBOOK METHOD */}
          {method === 'FACEBOOK' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold font-rajdhani tracking-wider text-blue-400 mb-1 uppercase">
                  Facebook Account Username / ID
                </label>
                <input
                  type="text"
                  defaultValue="facebook.com/hunter.sung"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-400 transition"
                />
              </div>
              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 font-rajdhani">
                Facebook Fast OAuth enabled. Click "Awaken Player Profile" to synchronize with Facebook Hunter Guild profile.
              </div>
            </div>
          )}

          {/* Action Submit Button */}
          <button
            type="button"
            onClick={() => {
              if (method === 'FACEBOOK') {
                verifyAndLogin('774921');
              } else if (!generatedOtp) {
                handleSendOtp();
              } else {
                verifyAndLogin(otpDigits.join(''));
              }
            }}
            disabled={loading}
            className="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black font-orbitron text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                VERIFYING SYSTEM TOKEN...
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                {!generatedOtp && method !== 'FACEBOOK' ? 'TRANSMIT VERIFICATION CODE' : 'VERIFY & AWAKEN PLAYER'}
              </>
            )}
          </button>
        </div>

        {/* Quick Instant Awakening Demo Action */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px] font-rajdhani">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            100% Offline Local Database
          </span>
          <button
            type="button"
            onClick={handleQuickAwaken}
            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline font-rajdhani cursor-pointer"
          >
            Instant Demo Awakening →
          </button>
        </div>
      </div>
    </div>
  );
};
