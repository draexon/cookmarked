import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Link, Scan, CheckCircle2, Circle, AlertCircle, ArrowRight, Plus } from 'lucide-react';
import { Collection, Reel, Platform } from '../types';
import { saveReel } from '../api/reelService';

interface SaveReelModalProps {
  onClose: () => void;
  onSave: (reel: Reel) => void;
  collectionId?: string | null;
  collections?: Collection[];
  onCreateCollection?: (input: { name: string; description?: string }) => Promise<Collection>;
  recentReels?: Reel[];
}

export default function SaveReelModal({
  onClose,
  onSave,
  collectionId,
  collections = [],
  onCreateCollection,
  recentReels = [],
}: SaveReelModalProps) {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(collectionId || '');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [step, setStep] = useState<'input' | 'saving'>('input');
  
  // Saving stages
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState('');

  // Monitor link for automatic platform detection
  useEffect(() => {
    const lower = url.toLowerCase();
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
      setDetectedPlatform('Instagram');
    } else if (lower.includes('tiktok.com')) {
      setDetectedPlatform('TikTok');
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      setDetectedPlatform('YouTube');
    } else if (lower.includes('pinterest.com')) {
      setDetectedPlatform('Pinterest');
    } else if (lower.includes('netflix.com')) {
      setDetectedPlatform('Netflix');
    } else if (lower.includes('primevideo.com') || (lower.includes('amazon.') && lower.includes('/video'))) {
      setDetectedPlatform('Prime Video');
    } else if (lower.includes('facebook.com')) {
      setDetectedPlatform('Facebook');
    } else {
      setDetectedPlatform(null);
    }
  }, [url]);

  // Handle immediate preset link injection
  const handleQuickPreset = (presetUrl: string) => {
    setUrl(presetUrl);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !onCreateCollection) return;
    setCreatingCollection(true);
    setError('');
    try {
      const collection = await onCreateCollection({ name: newCollectionName.trim() });
      setSelectedCollectionId(collection.id);
      setNewCollectionName('');
      setShowNewCollection(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create this collection.');
    } finally {
      setCreatingCollection(false);
    }
  };

  // Trigger the multi-staged AI save sequence
  const handleSave = async () => {
    if (!url) return;
    setStep('saving');
    setStage(1);
    setError('');

    try {
      const pendingReel = saveReel({
        url,
        ...(selectedCollectionId ? { collection_id: selectedCollectionId } : {}),
      });
      await new Promise((resolve) => setTimeout(resolve, 400));
      setStage(2);
      const finalReel = await pendingReel;
      setStage(3);
      await new Promise((resolve) => setTimeout(resolve, 300));
      onSave(finalReel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save this reel.');
      setStep('input');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-on-surface-dark/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Tap on backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        className="relative bg-app-bg w-full max-w-md md:max-w-[480px] rounded-t-3xl md:rounded-3xl shadow-[0_-10px_40px_rgba(28,27,27,0.15)] overflow-hidden z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        
        {/* Rounded Top Drawer Notch Accent */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-[#eae7e7] rounded-full" />
        </div>

        {/* Dynamic Screens based on State */}
        {step === 'input' ? (
          <div className="p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-extrabold text-2xl text-on-surface tracking-tight">
              Save a Reel
              </h2>
              <button
                onClick={onClose}
                className="text-on-surface-muted/60 hover:text-on-surface p-1 rounded-full hover:bg-surface-low cursor-pointer transition-colors"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            
            <p className="text-sm text-on-surface-muted/80 leading-snug mb-5 font-display">
              Paste a reel, video, Netflix show or Prime Video link
            </p>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Main Link Input Box */}
            <div className="space-y-4">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-on-surface-muted/40">
                  <Link className="w-5 h-5" />
                </div>
                
                <input
                  type="url"
                  placeholder="https://www.instagram.com/reels/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-white border border-brand-outline-variant/30 rounded-xl text-sm text-on-surface placeholder-on-surface-muted/35 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange/60 focus:scale-x-[1.01] transition-all duration-200 ease-in-out"
                />

                <button
                  onClick={() => alert("Scanner mode is pre-loaded with digital camera code.")}
                  className="absolute right-3.5 text-primary-orange hover:text-primary transition-all duration-200 ease-in-out p-1 active:scale-95"
                  title="Scan QR"
                >
                  <Scan className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* Real-time Link Validation Tag */}
              {url && (
                <div className="animate-fade-in">
                  {detectedPlatform ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container/40 border border-primary-orange/20 text-xs font-semibold text-primary rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-orange fill-primary-container" />
                      {detectedPlatform} detected
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      Link detected
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="save-collection" className="text-[10px] font-extrabold uppercase tracking-widest text-[#584237]/60 font-display">
                    Save To Collection
                  </label>
                  {onCreateCollection && (
                    <button
                      type="button"
                      onClick={() => setShowNewCollection((value) => !value)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-orange hover:text-primary cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New
                    </button>
                  )}
                </div>
                <select
                  id="save-collection"
                  value={selectedCollectionId}
                  onChange={(event) => setSelectedCollectionId(event.target.value)}
                  className="w-full px-3 py-3 bg-white border border-brand-outline-variant/30 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-orange"
                >
                  <option value="">Auto-sort into a collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
                {showNewCollection && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(event) => setNewCollectionName(event.target.value)}
                      placeholder="New collection name"
                      className="min-w-0 flex-1 px-3 py-2.5 bg-white border border-brand-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-orange"
                    />
                    <button
                      type="button"
                      disabled={!newCollectionName.trim() || creatingCollection}
                      onClick={handleCreateCollection}
                      className="h-10 px-3 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      {creatingCollection ? 'Creating' : 'Create'}
                    </button>
                  </div>
                )}
              </div>

              {/* RECENT LINKS Shelf */}
              <div className="pt-2">
                <h3 className="block text-[10px] font-extrabold uppercase tracking-widest text-[#584237]/60 mb-3 font-display">
                  Recent Links
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {recentReels.slice(0, 2).map((preset) => (
                    <button
                      key={preset.title}
                      onClick={() => handleQuickPreset(preset.url)}
                      className="flex items-center gap-3 p-2 text-left bg-white rounded-xl border border-brand-outline-variant/10 hover:border-primary-orange/40 hover:bg-orange-50/25 active:scale-95 transition-all duration-200 ease-in-out shadow-sm focus:outline-none cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-low flex-shrink-0">
                        <img src={preset.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-primary-orange tracking-wide">
                          {preset.platform}
                        </p>
                        <p className="text-xs font-semibold text-on-surface truncate leading-tight mt-0.5">
                          {preset.title}
                        </p>
                      </div>
                    </button>
                  ))}
                  {recentReels.length === 0 && (
                    <p className="col-span-2 text-xs text-on-surface-muted/50">No saved links yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trigger Button at Bottom */}
            <div className="mt-8">
              <button
                disabled={!url}
                onClick={handleSave}
                className="w-full py-4 bg-gradient-to-r from-primary-orange to-primary text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(249,115,22,0.25)] hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all duration-200 ease-in-out font-display"
              >
                <span>Save Reel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* SAVING PROGRESS SCREEN (Screen 3) */
          <div className="p-6 pb-8 text-center">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-extrabold text-2xl text-on-surface tracking-tight">
                Saving to Library
              </h2>
              <button
                disabled
                className="opacity-20 text-on-surface-muted/60 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stages vertical queue display */}
            <div className="space-y-6 max-w-xs mx-auto text-left py-4">
              
              {/* Stage 1 Check */}
              <div className="flex items-center gap-4 transition-all duration-200">
                {stage > 1 ? (
                  <CheckCircle2 className="w-6 h-6 text-primary-orange animate-scale-up" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-primary-orange flex items-center justify-center text-xs font-bold text-primary-orange animate-pulse">
                    1
                  </div>
                )}
                <span className={`text-[15px] font-semibold transition-colors duration-200 ${
                  stage === 1 ? 'text-on-surface font-bold font-display' : 'text-on-surface-muted/40'
                }`}>
                  Fetching reel info...
                </span>
              </div>

              {/* Stage 2 Check */}
              <div className="flex items-center gap-4 transition-all duration-200">
                {stage > 2 ? (
                  <CheckCircle2 className="w-6 h-6 text-primary-orange animate-scale-up z-10" />
                ) : stage === 2 ? (
                  <div className="w-6 h-6 rounded-full border-2 border-primary-orange flex items-center justify-center text-xs font-bold text-primary-orange animate-pulse">
                    2
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-on-surface-muted/20" />
                )}
                <span className={`text-[15px] font-semibold transition-colors duration-200 ${
                  stage === 2 ? 'text-on-surface font-bold font-display' : 'text-on-surface-muted/40'
                }`}>
                  Identifying content...
                </span>
              </div>

              {/* Stage 3 Check */}
              <div className="flex items-center gap-4 transition-all duration-200">
                {stage > 3 ? (
                  <CheckCircle2 className="w-6 h-6 text-primary-orange" />
                ) : stage === 3 ? (
                  <div className="w-6 h-6 rounded-full border-2 border-primary-orange flex items-center justify-center text-xs font-bold text-primary-orange animate-pulse">
                    3
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-on-surface-muted/20" />
                )}
                <span className={`text-[15px] font-semibold transition-colors duration-200 ${
                  stage === 3 ? 'text-on-surface font-bold font-display' : 'text-on-surface-muted/40'
                }`}>
                  Saving to library...
                </span>
              </div>

            </div>

            {/* Segmented Line Progress Bar - 3 parts */}
            <div className="max-w-xs mx-auto mt-8 flex gap-2">
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${stage >= 1 ? 'bg-primary-orange' : 'bg-[#eae7e7]'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${stage >= 2 ? 'bg-primary-orange' : 'bg-[#eae7e7]'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${stage >= 3 ? 'bg-primary-orange' : 'bg-[#eae7e7]'}`} />
            </div>

            <p className="text-xs text-on-surface-muted/50 mt-6 italic font-sans font-medium">
              Powered by the CookMarked API
            </p>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}
