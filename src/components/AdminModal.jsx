import React from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Clock, Heart } from 'lucide-react';

export default function AdminModal({
  isOpen,
  onClose,
  allKrathongs,
  onApprove,
  onReject
}) {
  if (!isOpen) return null;

  const pendingList = allKrathongs.filter((k) => k.status === 'pending');
  const approvedList = allKrathongs.filter((k) => k.status === 'approved');
  const totalVotes = allKrathongs.reduce((acc, k) => acc + (k.votes || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden p-5 md:p-6 text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-emerald-300">
                ระบบจัดการหลังบ้าน (Admin Moderation)
              </h2>
              <p className="text-xs text-slate-400">
                คัดกรองรูปภาพและคำอธิษฐานก่อนปล่อยลงสู่แม่น้ำจริง
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 my-4">
          <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-3 text-center">
            <div className="text-xs text-slate-400 mb-0.5">รอตรวจสอบ</div>
            <div className="text-lg md:text-2xl font-bold text-amber-400">
              {pendingList.length}
            </div>
          </div>
          <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-3 text-center">
            <div className="text-xs text-slate-400 mb-0.5">อนุมัติแล้ว</div>
            <div className="text-lg md:text-2xl font-bold text-emerald-400">
              {approvedList.length}
            </div>
          </div>
          <div className="bg-slate-800/80 border border-rose-500/30 rounded-2xl p-3 text-center">
            <div className="text-xs text-slate-400 mb-0.5">คะแนนโหวตรวม</div>
            <div className="text-lg md:text-2xl font-bold text-rose-400">
              {totalVotes.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Approval Queue Section */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <h3 className="text-sm font-bold text-slate-300 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>รายการกระทงที่รอการอนุมัติ ({pendingList.length})</span>
          </h3>

          {pendingList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
              <p className="text-sm font-medium">ไม่มีรายการค้างตรวจในขณะนี้</p>
              <p className="text-xs text-slate-500">
                กระทงใหม่ที่ผู้ใช้ส่งเข้ามาจะปรากฏที่นี่เพื่อให้แอดมินกดอนุมัติ
              </p>
            </div>
          ) : (
            pendingList.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-amber-400/50 flex-shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-slate-300 italic mt-0.5">
                      "{item.wish}"
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded bg-slate-700 text-slate-300">
                      แบบ: {item.krathongType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onReject(item.id)}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>ปฏิเสธ</span>
                  </button>
                  <button
                    onClick={() => onApprove(item.id)}
                    className="flex-1 sm:flex-none px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>อนุมัติลงน้ำ</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
