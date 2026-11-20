import React, { useState, useEffect, useRef } from 'react';
import { KrathongScene } from './3d/KrathongScene';
import Navbar from './components/Navbar';
import KrathongModal from './components/KrathongModal';
import CreateKrathongModal from './components/CreateKrathongModal';
import LeaderboardModal from './components/LeaderboardModal';
import AuthModal from './components/AuthModal';
import AdminModal from './components/AdminModal';
import { INITIAL_KRATHONGS } from './utils/mockData';
import { Compass, ZoomIn, Hand, Sparkles } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  // States
  const [krathongs, setKrathongs] = useState(() => {
    const saved = localStorage.getItem('krathongs_data');
    return saved ? JSON.parse(saved) : INITIAL_KRATHONGS;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('krathong_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [hasVotedToday, setHasVotedToday] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const voteLog = localStorage.getItem('krathong_vote_date');
    return voteLog === today;
  });

  const [selectedKrathong, setSelectedKrathong] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Filter approved krathongs for the 3D scene
  const approvedKrathongs = krathongs.filter((k) => k.status === 'approved');
  const pendingCount = krathongs.filter((k) => k.status === 'pending').length;

  // Save krathongs to localStorage
  useEffect(() => {
    localStorage.setItem('krathongs_data', JSON.stringify(krathongs));
  }, [krathongs]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('krathong_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('krathong_user');
    }
  }, [user]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new KrathongScene(containerRef.current, (clickedKrathong) => {
      setSelectedKrathong(clickedKrathong);
    });
    sceneRef.current = scene;

    return () => {
      scene.destroy();
    };
  }, []);

  // Sync approved krathongs with 3D scene
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.syncKrathongs(approvedKrathongs);
    }
  }, [approvedKrathongs]);

  // Handle Voting
  const handleVote = (krathongId) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (hasVotedToday) {
      alert('คุณได้ใช้สิทธิ์ลงคะแนนของวันนี้ไปแล้วครับ!');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('krathong_vote_date', today);
    setHasVotedToday(true);

    setKrathongs((prev) =>
      prev.map((k) => {
        if (k.id === krathongId) {
          const updated = { ...k, votes: (k.votes || 0) + 1 };
          if (selectedKrathong && selectedKrathong.id === krathongId) {
            setSelectedKrathong(updated);
          }
          return updated;
        }
        return k;
      })
    );
  };

  // Handle New Krathong Submission
  const handleCreateKrathong = (data) => {
    const newKrathong = {
      ...data,
      id: 'k-' + Date.now(),
      status: 'approved', // Auto-approved for instant joy, also visible in admin
      createdAt: new Date().toISOString()
    };

    setKrathongs((prev) => [newKrathong, ...prev]);

    // Animate camera to focus on this new krathong
    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.focusOnKrathong(newKrathong.id);
        setSelectedKrathong(newKrathong);
      }
    }, 400);
  };

  // Handle Admin Actions
  const handleApprove = (id) => {
    setKrathongs((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'approved' } : k))
    );
  };

  const handleReject = (id) => {
    setKrathongs((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'rejected' } : k))
    );
  };

  // Fly camera to krathong from Leaderboard
  const handleSelectFromLeaderboard = (krathong) => {
    if (sceneRef.current) {
      sceneRef.current.focusOnKrathong(krathong.id);
      setSelectedKrathong(krathong);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-night-950 font-sans select-none">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLogout={() => setUser(null)}
        totalKrathongs={approvedKrathongs.length}
        pendingCount={pendingCount}
      />

      {/* Interactive Controls Overlay Hint (Bottom Center) */}
      <div className="absolute bottom-5 inset-x-0 z-10 flex justify-center pointer-events-none px-4">
        <div className="flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-gold-500/30 text-xs text-amber-200 shadow-xl pointer-events-auto">
          <div className="flex items-center space-x-1">
            <Compass className="w-3.5 h-3.5 text-gold-400" />
            <span>ลากเพื่อหมุน</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center space-x-1">
            <ZoomIn className="w-3.5 h-3.5 text-gold-400" />
            <span>เลื่อน/กางนิ้วเพื่อซูม</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center space-x-1">
            <Hand className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            <span>แตะกระทงเพื่อโหวต</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <KrathongModal
        krathong={selectedKrathong}
        onClose={() => setSelectedKrathong(null)}
        onVote={handleVote}
        hasVotedToday={hasVotedToday}
        isLoggedIn={!!user}
        onPromptLogin={() => setIsAuthOpen(true)}
      />

      <CreateKrathongModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateKrathong}
        isLoggedIn={!!user}
        onPromptLogin={() => setIsAuthOpen(true)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        krathongs={approvedKrathongs}
        onSelectKrathong={handleSelectFromLeaderboard}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        allKrathongs={krathongs}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
