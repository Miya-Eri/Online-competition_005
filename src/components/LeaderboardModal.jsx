import React from 'react';
import { X, Trophy, Medal, Heart, Eye } from 'lucide-react';

export default function LeaderboardModal({
  isOpen,
  onClose,
  krathongs,
  onSelectKrathong
}) {
  if (!isOpen) return null;

  // Sort by votes descending
  const sorted = [...krathongs].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-gold-500/40 rounded-3xl shadow-2xl overflow-hidden p-5 md:p-6 text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-gold-400 animate-bounce" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-amber-300">
                ตารางอันดับยอดนิยม Top 10
              </h2>
              <p className="text-xs text-slate-400">
                คะแนนโหวตสดแบบเรียลไทม์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Top 10 */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {sorted.map((item, index) => {
            const rank = index + 1;
            let rankBadge = (
              <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                #{rank}
              </span>
            );
            let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-800/40';

            if (rank === 1) {
              rankBadge = (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md">
                  <Medal className="w-4 h-4 fill-current" />
                </div>
              );
              borderStyle = 'border-amber-400/60 bg-gradient-to-r from-amber-500/15 to-transparent';
            } else if (rank === 2) {
              rankBadge = (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 flex items-center justify-center text-slate-950 shadow-md">
                  <Medal className="w-4 h-4 fill-current" />
                </div>
              );
              borderStyle = 'border-slate-400/40 bg-slate-800/60';
            } else if (rank === 3) {
              rankBadge = (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 flex items-center justify-center text-white shadow-md">
                  <Medal className="w-4 h-4 fill-current" />
                </div>
              );
              borderStyle = 'border-amber-700/40 bg-slate-800/50';
            }

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${borderStyle}`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {rankBadge}
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-11 h-11 rounded-full object-cover border border-gold-500/40 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[170px] md:max-w-xs">
                      "{item.wish}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-rose-400 text-xs md:text-sm font-bold">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{item.votes?.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectKrathong(item);
                      onClose();
                    }}
                    className="bg-slate-700/80 hover:bg-gold-500 hover:text-slate-950 text-slate-200 p-2 rounded-xl text-xs flex items-center space-x-1 transition-all"
                    title="พากล้องไปดูที่กระทงนี้ในแม่น้ำ"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">บินไปดู</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            แตะที่กระทงใดๆ ในแม่น้ำเพื่อดูรายละเอียดและร่วมลงคะแนนโหวต
          </p>
        </div>
      </div>
    </div>
  );
}
