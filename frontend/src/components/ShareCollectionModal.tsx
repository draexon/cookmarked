import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, QrCode, ChevronDown, ChevronUp, Share2, MessageCircle, MoreHorizontal, Check } from 'lucide-react';
import { Collection } from '../types';
import { shareCollection } from '../api/reelService';

interface ShareCollectionModalProps {
  collection: Collection;
  onClose: () => void;
}

export default function ShareCollectionModal({ collection, onClose }: ShareCollectionModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    shareCollection(collection.id)
      .then((url) => {
        if (active) setShareUrl(url);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to create share link.');
      });
    return () => {
      active = false;
    };
  }, [collection.id]);

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-on-surface-dark/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        className="relative bg-white w-full max-w-md md:max-w-[480px] rounded-t-3xl md:rounded-3xl shadow-[0_-10px_40px_rgba(28,27,27,0.15)] overflow-hidden z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        
        {/* Notch accent */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-[#eae7e7] rounded-full" />
        </div>

        <div className="p-6">
          {/* Top header block */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-extrabold text-xl text-on-surface leading-7">
                Share Collection
              </h2>
              <p className="text-sm font-semibold text-on-surface-muted/60 font-sans leading-5">
                {collection.name}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="text-on-surface-muted/60 hover:text-on-surface p-1 rounded-full hover:bg-surface-low cursor-pointer transition-all duration-200 ease-in-out active:scale-95"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Copyable Share URL Box */}
          <div className="mt-5 flex items-center bg-surface-low rounded-2xl p-2 border border-brand-outline-variant/15 pl-4 gap-2">
            <Share2 className="w-4 h-4 text-on-surface-muted/40 flex-shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl || 'Creating share link...'}
              className="bg-transparent border-none text-xs text-on-surface-muted font-mono flex-1 select-all outline-none"
            />
            
            <button
              onClick={handleCopy}
              disabled={!shareUrl}
              className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-all duration-200 ease-in-out shadow-md active:scale-95 cursor-pointer ${
                copied
                  ? 'bg-green-600 text-white shadow-green-200'
                  : 'bg-primary-orange text-white hover:bg-primary shadow-orange-100'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          {/* QR Code Collapsible Slide Header (Screen 0) */}
          <div className="mt-4">
            <button
              onClick={() => setShowQr(!showQr)}
              className="w-full flex items-center justify-between p-4 bg-surface-low/60 rounded-xl border border-brand-outline-variant/10 hover:bg-surface-low transition-all duration-200 ease-in-out active:scale-95 select-none cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-primary-orange" />
                <span className="text-sm font-bold text-on-surface font-display leading-5">
                  Show QR Code
                </span>
              </div>
              
              {showQr ? (
                <ChevronUp className="w-4 h-4 text-on-surface-muted/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-on-surface-muted/60" />
              )}
            </button>

            {/* Expanded QR Graphic */}
            {showQr && (
              <div className="mt-3 p-5 bg-white border border-brand-outline-variant/10 rounded-2xl flex flex-col items-center justify-center animate-slide-down">
                {/* Simulated beautiful QR visual box */}
                <div className="w-40 h-40 bg-orange-50/20 border-2 border-dashed border-primary-orange/30 rounded-xl flex items-center justify-center p-3">
                  <div className="grid grid-cols-6 gap-2 w-full h-full opacity-80">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-[1px] ${
                          (i % 2 === 0 && i % 3 === 0) || i < 6 || i % 6 === 0 || i > 30 || i % 7 === 1
                            ? 'bg-primary'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] uppercase font-bold text-primary tracking-widest mt-3">
                  Scan to load reel collection
                </p>
              </div>
            )}
          </div>

          <p className="mt-6 block text-[10px] font-extrabold uppercase tracking-widest text-[#584237]/60 font-display">
            Send to Friend
          </p>

          {/* Social media targets */}
          <div className="mt-3 grid grid-cols-3 gap-3 pb-2 select-none">
            {/* Direct X / Twitter target */}
            <button
              onClick={() => alert("Forwarded to your Twitter followers!")}
              className="flex items-center justify-center gap-2.5 py-3 px-2 bg-sky-50 hover:bg-sky-100/60 border border-sky-100 text-sky-700 font-display font-extrabold text-xs.5 leading-none rounded-xl active:scale-95 transition-all duration-200 ease-in-out cursor-pointer shadow-sm"
            >
              {/* Clean high contrast modern X representation */}
              <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center font-bold text-white text-[10px] font-mono leading-none">
                𝕏
              </div>
              <span>Twitter</span>
            </button>

            {/* Direct WhatsApp target */}
            <button
              onClick={() => alert("Forwarded to your WhatsApp contacts!")}
              className="flex items-center justify-center gap-2.5 py-3 px-2 bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-100 text-emerald-700 font-display font-extrabold text-xs.5 leading-none rounded-xl active:scale-95 transition-all duration-200 ease-in-out cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600 fill-emerald-50 stroke-[2]" />
              <span>WhatsApp</span>
            </button>

            {/* Secondary actions target banner */}
            <button
              onClick={() => alert("Opened native share selection dialog.")}
              className="flex items-center justify-center bg-surface-low hover:bg-[#eae7e7] border border-[#dcd9d9]/40 p-3 rounded-xl active:scale-95 transition-all duration-200 ease-in-out cursor-pointer shadow-sm"
            >
              <MoreHorizontal className="w-5 h-5 text-on-surface-muted" />
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
