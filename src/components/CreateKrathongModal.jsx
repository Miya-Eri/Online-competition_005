import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, RefreshCw, Check, Sparkles } from 'lucide-react';
import { KRATHONG_STYLES } from '../utils/mockData';

export default function CreateKrathongModal({
  isOpen,
  onClose,
  onSubmit,
  isLoggedIn,
  onPromptLogin
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Photo, 2: Info & Style
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(KRATHONG_STYLES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      alert('ไม่สามารถเปิดกล้องได้ คุณสามารถเลือกอัปโหลดรูปภาพแทนได้ครับ');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Take Snapshot
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext('2d');
    // Mirror image for natural selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(photoDataUrl);
    stopCamera();
  };

  // File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!capturedPhoto) {
      alert('กรุณาถ่ายรูปหรือเลือกรูปภาพตนเองก่อนครับ');
      setStep(1);
      return;
    }
    if (!name.trim()) {
      alert('กรุณากรอกชื่อผู้เข้าประกวด');
      return;
    }
    if (!wish.trim()) {
      alert('กรุณากรอกคำอธิษฐาน');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        name: name.trim(),
        wish: wish.trim(),
        photoUrl: capturedPhoto,
        krathongType: selectedStyle,
        votes: 1
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-gold-500/40 rounded-3xl shadow-2xl overflow-hidden p-5 md:p-6 text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <h2 className="text-lg md:text-xl font-bold text-amber-300">
              ส่งกระทงเข้าประกวด & ลอยน้ำ
            </h2>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* STEP 1: Photo / Selfie */}
          <div className="space-y-2">
            <label className="block text-xs md:text-sm font-semibold text-slate-300">
              1. รูปภาพของคุณ (ถ่ายรูปเซลฟี่ หรือ อัปโหลดภาพ) <span className="text-rose-400">*</span>
            </label>

            {capturedPhoto ? (
              <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-gold-400 shadow-xl group">
                <img src={capturedPhoto} alt="Selfie" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white"
                >
                  <RefreshCw className="w-5 h-5 mb-1" />
                  ถ่ายใหม่
                </button>
              </div>
            ) : isCameraActive ? (
              <div className="relative w-full max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-amber-400 bg-black">
                <video ref={videoRef} className="w-full h-full object-cover -scale-x-100" playsInline muted />
                <div className="absolute bottom-3 inset-x-0 flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={takeSnapshot}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold p-3 rounded-full shadow-lg border-2 border-white flex items-center justify-center"
                    title="กดถ่ายรูป"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-full"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 py-4 px-3 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-2xl flex flex-col items-center justify-center space-y-1.5 text-amber-300 transition-all hover:border-gold-500"
                >
                  <Camera className="w-7 h-7 text-gold-400" />
                  <span className="text-xs md:text-sm font-semibold">เปิดกล้องถ่ายรูปเซลฟี่</span>
                  <span className="text-[10px] text-slate-400">ใช้กล้องหน้าของอุปกรณ์</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-4 px-3 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-2xl flex flex-col items-center justify-center space-y-1.5 text-slate-200 transition-all hover:border-gold-500"
                >
                  <Upload className="w-7 h-7 text-emerald-400" />
                  <span className="text-xs md:text-sm font-semibold">เลือกไฟล์รูปจากเครื่อง</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG ขนาดไม่เกิน 5MB</span>
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* STEP 2: Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs md:text-sm font-semibold text-slate-300">
              2. ชื่อผู้เข้าประกวด / ผู้ส่งกระทง <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น น้องฟ้าใส หรือ ชัยวัฒน์ ใจดี"
              maxLength={40}
              required
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          {/* STEP 3: Wish / Prayer Input */}
          <div className="space-y-1.5">
            <label className="block text-xs md:text-sm font-semibold text-slate-300">
              3. คำอธิษฐานต่อพระแม่คงคา <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="ขอขมาพระแม่คงคา และขอให้มีแต่ความสุขความเจริญ..."
              maxLength={150}
              rows={2}
              required
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 transition-colors resize-none"
            />
            <div className="text-right text-[11px] text-slate-400">
              {wish.length}/150 ตัวอักษร
            </div>
          </div>

          {/* STEP 4: Krathong Style Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs md:text-sm font-semibold text-slate-300">
              4. เลือกรูปแบบกระทง 3 มิติ
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {KRATHONG_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-gold-400 bg-gold-500/15 ring-2 ring-gold-400/50'
                        : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: style.color }}
                      />
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {style.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {style.description}
                    </p>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-gold-400 absolute top-2 right-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 hover:from-amber-400 hover:to-gold-400 text-slate-950 shadow-lg shadow-gold-500/25 transition-all flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>กำลังสร้างกระทงและลอยลงสู่แม่น้ำ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>บันทึกและลอยกระทงลงสู่แม่น้ำ 3D</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
