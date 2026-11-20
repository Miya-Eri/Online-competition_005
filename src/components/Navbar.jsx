import React from 'react';
import { Sparkles, Trophy, PlusCircle, ShieldCheck, User, LogOut } from 'lucide-react';

export default function Navbar({
  user,
  onOpenAuth,
  onOpenCreate,
  onOpenLeaderboard,
  onOpenAdmin,
  onLogout,
  totalKrathongs,
  pendingCount
}) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 md:px-6 py-3 pointer-events-none">
      {/* Brand & Stats */}
      <div className="flex items-center space-x-3 pointer-events-auto">
        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gold-500/30 shadow-lg shadow-gold-500/10">
          <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" />
          <div>
            <h1 className="text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-gold-400 to-amber-500 tracking-wide">
              งานประกวดลอยกระทง 3D
            </h1>
            <p className="text-[10px] md:text-xs text-amber-300/80 -mt-0.5 font-light">
              กระทงในแม่น้ำ {totalKrathongs} ใบ • คนร่วมงาน 20+ คน
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 md:space-x-3 pointer-events-auto">
        {/* Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center space-x-1.5 bg-slate-900/80 hover:bg-slate-800/90 text-amber-300 border border-amber-400/40 px-3 py-1.5 rounded-full backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 text-xs md:text-sm font-medium"
        >
          <Trophy className="w-4 h-4 text-gold-400" />
          <span>Top 10</span>
        </button>

        {/* Create Krathong Button */}
        <button
          onClick={onOpenCreate}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-full shadow-lg shadow-gold-500/25 transition-all hover:scale-105 active:scale-95 text-xs md:text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ส่งกระทงเข้าประกวด</span>
        </button>

        {/* Admin Dashboard */}
        <button
          onClick={onOpenAdmin}
          className="relative flex items-center space-x-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 p-2 md:px-3 md:py-1.5 rounded-full backdrop-blur-md transition-all text-xs md:text-sm"
          title="ระบบหลังบ้าน (Admin)"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">หลังบ้าน</span>
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>

        {/* User Profile or Login */}
        {user ? (
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-700/60 pl-2 pr-1.5 py-1 rounded-full backdrop-blur-md">
            <span className="text-xs text-amber-200 max-w-[80px] md:max-w-[120px] truncate">
              {user.name}
            </span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-1 bg-slate-800/80 hover:bg-slate-700/90 text-white px-3 py-1.5 rounded-full border border-slate-600/50 backdrop-blur-md text-xs md:text-sm font-medium transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบ</span>
          </button>
        )}
      </div>
    </header>
  );
}
