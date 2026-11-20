import React, { useState } from 'react';
import { X, Smartphone, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [authMethod, setAuthMethod] = useState('google'); // 'google' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Google Login Simulation
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        id: 'usr_g_' + Math.random().toString(36).substring(2, 8),
        name: 'ผู้ใช้ Google บัญชีจริง',
        method: 'google',
        email: 'user.thai@gmail.com'
      });
      setIsLoading(false);
      onClose();
    }, 600);
  };

  // Handle Phone Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      alert('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (เช่น 0812345678)');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsOtpSent(true);
      setIsLoading(false);
    }, 600);
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      alert('กรุณากรอกรหัส OTP 4 หลัก');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        id: 'usr_p_' + Math.random().toString(36).substring(2, 8),
        name: 'เบอร์ ' + phoneNumber.substring(0, 3) + '-xxx-' + phoneNumber.slice(-3),
        method: 'phone',
        phone: phoneNumber
      });
      setIsLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-gold-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-amber-300">
            เข้าสู่ระบบเพื่อลงคะแนนโหวต
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Method Selector */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 my-4 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              setIsOtpSent(false);
            }}
            className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
              authMethod === 'google'
                ? 'bg-gold-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Google Login</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
              authMethod === 'phone'
                ? 'bg-gold-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>เบอร์โทรศัพท์ (SMS OTP)</span>
          </button>
        </div>

        {/* Content based on method */}
        {authMethod === 'google' ? (
          <div className="py-4 space-y-4 text-center">
            <p className="text-xs text-slate-300">
              เข้าสู่ระบบด้วยบัญชี Google เพื่อรับสิทธิ์โหวตวันละ 1 ครั้ง และส่งกระทงเข้าประกวด
            </p>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold flex items-center justify-center space-x-3 shadow-md transition-all hover:scale-[1.01]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}</span>
            </button>
          </div>
        ) : (
          <div className="py-2 space-y-4">
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    เบอร์โทรศัพท์มือถือ (10 หลัก)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0812345678"
                    maxLength={10}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? 'กำลังส่ง...' : 'ขอรหัส OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    รหัส OTP 4 หลัก (ส่งไปยังเบอร์ {phoneNumber})
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="กรอกรหัสใดก็ได้ เช่น 1234"
                    maxLength={6}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg tracking-widest text-gold-400 font-bold focus:outline-none focus:border-gold-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all"
                >
                  <span>{isLoading ? 'กำลังยืนยัน...' : 'ยืนยันรหัส OTP'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security badge */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ระบบปลอดภัย โหวตได้วันละ 1 ครั้งเพื่อความโปร่งใส</span>
        </div>
      </div>
    </div>
  );
}
