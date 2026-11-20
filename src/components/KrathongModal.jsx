import React from 'react';
import { X, Heart, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KrathongModal({
  krathong,
  onClose,
  onVote,
  hasVotedToday,
  isLoggedIn,
  onPromptLogin
}) {
  if (!krathong) return null;

  const handleVoteClick = () => {
    if (!isLoggedIn) {
      onPromptLogin();
      return;
    }
    if (hasVotedToday) {
      return;
    }
    // Fire festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#EF4444', '#10B981', '#EC4899', '#3B82F6']
    });
    onVote(krathong.id);
  };

  const getStyleName = (type) => {
    switch (type) {
      case 'lotus': return 'กระทงกลีบบัวบาน';
      case 'banana': return 'กระทงใบตองดั้งเดิม';
      case 'royal': return 'กระทงชาววังประดับทอง';
      case 'flower': return 'กระทงผกามาศหลากสี';
      case 'coconut': return 'กระทงกะลามะพร้าว';
      default: return 'กระทงวิจิตร';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-gold-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 text-white animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contestant Photo */}
        <div className="relative mx-auto w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-300 shadow-xl shadow-amber-500/20 mb-4">
          <img
            src={krathong.photoUrl}
            alt={krathong.name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
            }}
          />
          <div className="absolute -bottom-1 right-2 bg-slate-900 border border-gold-500 text-gold-400 p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Name and Krathong Badge */}
        <div className="text-center space-y-1 mb-4">
          <span className="inline-block px-3 py-0.5 text-xs font-semibold rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
            {getStyleName(krathong.krathongType)}
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {krathong.name}
          </h2>
          <div className="flex items-center justify-center space-x-1 text-rose-400 text-sm font-semibold">
            <Heart className="w-4 h-4 fill-current" />
            <span>{krathong.votes?.toLocaleString() || 0} คะแนนโหวต</span>
          </div>
        </div>

        {/* Wish Card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 mb-6 shadow-inner text-center">
          <p className="text-xs text-amber-300/80 mb-1 font-light flex items-center justify-center space-x-1">
            <span>✨ คำอธิษฐานต่อพระแม่คงคา ✨</span>
          </p>
          <p className="text-slate-200 text-sm italic font-normal leading-relaxed">
            "{krathong.wish}"
          </p>
        </div>

        {/* Voting Action */}
        <div>
          {!isLoggedIn ? (
            <button
              onClick={handleVoteClick}
              className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-gold-500 text-slate-950 hover:from-amber-400 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25 flex items-center justify-center space-x-2"
            >
              <Heart className="w-5 h-5 fill-current" />
              <span>เข้าสู่ระบบเพื่อโหวต (วันละ 1 สิทธิ์)</span>
            </button>
          ) : hasVotedToday ? (
            <div className="w-full py-3 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center space-x-2 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>คุณใช้สิทธิ์โหวตของวันนี้แล้ว (กลับมาใหม่พรุ่งนี้)</span>
            </div>
          ) : (
            <button
              onClick={handleVoteClick}
              className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Heart className="w-5 h-5 fill-current animate-bounce" />
              <span>กดโหวตให้กระทงนี้ (+1 คะแนน)</span>
            </button>
          )}

          <p className="text-[11px] text-slate-400 text-center mt-3">
            * 1 บัญชีผู้ใช้สามารถลงคะแนนโหวตได้วันละ 1 ครั้งเท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
}
