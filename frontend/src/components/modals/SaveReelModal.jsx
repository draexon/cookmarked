import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useCollections } from '@/hooks/useCollections'
import { useSaveReel } from '@/hooks/useReels'
import { detectPlatform } from '@/utils'
import { CATEGORIES, PLATFORMS } from '@/constants'
import PlatformBadge from '@/components/ui/PlatformBadge'

const STEPS = {
  INPUT: 'input',
  PROCESSING: 'processing',
  CATEGORIZING: 'categorizing',
  SUCCESS: 'success',
  ERROR: 'error',
}

export default function SaveReelModal() {
  const { saveModalOpen, setSaveModalOpen } = useUIStore()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [savedMeta, setSavedMeta] = useState(null)
  const [step, setStep] = useState(STEPS.INPUT)
  const [detectedPlatform, setDetectedPlatform] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef(null)
  const { data: collectionsData } = useCollections()
  const saveReel = useSaveReel()
  const collections = collectionsData || []

  useEffect(() => {
    if (saveModalOpen) {
      setStep(STEPS.INPUT)
      setUrl('')
      setTitle('')
      setCategory('')
      setCollectionId('')
      setSavedMeta(null)
      setDetectedPlatform(null)
      setErrorMsg('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [saveModalOpen])

  useEffect(() => {
    const platform = detectPlatform(url)
    setDetectedPlatform(platform)
  }, [url])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setStep(STEPS.PROCESSING)

    try {
      const selectedCategory = CATEGORIES.find((cat) => cat.id === category)
      const selectedCollection = collections.find((collection) => String(collection.id) === collectionId)
      const payload = {
        url: url.trim(),
        title: title.trim() || null,
        category: category || null,
        collection_id: collectionId ? Number(collectionId) : null,
      }

      await new Promise((r) => setTimeout(r, 1200)) // Simulate processing
      setStep(STEPS.CATEGORIZING)
      await new Promise((r) => setTimeout(r, 1500)) // Simulate organization

      await saveReel.mutateAsync(payload)
      setSavedMeta({
        category: selectedCategory?.label || 'Other',
        collection: selectedCollection?.name || selectedCategory?.label || 'Other',
      })
      setStep(STEPS.SUCCESS)

      setTimeout(() => {
        setSaveModalOpen(false)
      }, 1800)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save reel')
      setStep(STEPS.ERROR)
    }
  }

  const close = () => {
    if (step === STEPS.PROCESSING || step === STEPS.CATEGORIZING) return
    setSaveModalOpen(false)
  }

  return (
    <AnimatePresence>
      {saveModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 bottom-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50"
          >
            <div className="glass-strong rounded-2xl border border-border p-6 shadow-elevated">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-semibold text-text-primary">Save a Reel</h2>
                  <p className="text-xs text-text-muted mt-0.5">Paste a link from Instagram, TikTok, YouTube, or Facebook</p>
                </div>
                <button
                  onClick={close}
                  disabled={step === STEPS.PROCESSING || step === STEPS.CATEGORIZING}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {step === STEPS.INPUT && (
                  <motion.form
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        {detectedPlatform ? (
                          <PlatformBadge platform={detectedPlatform} size="xs" />
                        ) : (
                          <Link2 size={16} className="text-text-muted" />
                        )}
                      </div>
                      <input
                        ref={inputRef}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.instagram.com/reel/..."
                        className="input-field pl-10 text-sm"
                      />
                    </div>

                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      className="input-field text-sm"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>

                      <select
                        value={collectionId}
                        onChange={(e) => setCollectionId(e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Collection</option>
                        {collections.map((collection) => (
                          <option key={collection.id} value={collection.id}>{collection.name}</option>
                        ))}
                      </select>
                    </div>

                    {detectedPlatform && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-text-secondary flex items-center gap-1.5 px-1"
                      >
                        <span>Detected:</span>
                        <span className="font-medium" style={{ color: PLATFORMS[detectedPlatform]?.color }}>
                          {PLATFORMS[detectedPlatform]?.label}
                        </span>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={!url.trim()}
                      className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                    >
                      Save Reel
                    </button>
                  </motion.form>
                )}

                {(step === STEPS.PROCESSING || step === STEPS.CATEGORIZING) && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-4"
                  >
                    <div className="space-y-4">
                      <ProcessingStep
                        label="Fetching reel..."
                        done={step === STEPS.CATEGORIZING}
                        active={step === STEPS.PROCESSING}
                      />
                      <ProcessingStep
                        label="Choosing collection..."
                        done={false}
                        active={step === STEPS.CATEGORIZING}
                      />
                      <ProcessingStep
                        label="Saving to your library..."
                        done={false}
                        active={false}
                      />
                    </div>
                  </motion.div>
                )}

                {step === STEPS.SUCCESS && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-3"
                    >
                      <CheckCircle size={26} className="text-green-400" />
                    </motion.div>
                    <p className="font-medium text-text-primary">Reel saved!</p>
                    <p className="text-xs text-text-muted mt-1">
                      Saved to {savedMeta?.collection || 'Other'} as {savedMeta?.category || 'Other'}.
                    </p>
                  </motion.div>
                )}

                {step === STEPS.ERROR && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-2 space-y-4"
                  >
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{errorMsg}</p>
                    </div>
                    <button
                      onClick={() => { setStep(STEPS.INPUT); setErrorMsg('') }}
                      className="btn-ghost w-full text-sm"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ProcessingStep({ label, done, active }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
        {done ? (
          <CheckCircle size={18} className="text-green-400" />
        ) : active ? (
          <Loader2 size={18} className="text-accent-primary animate-spin" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-border" />
        )}
      </div>
      <span className={`text-sm ${done ? 'text-green-400 line-through' : active ? 'text-text-primary' : 'text-text-muted'}`}>
        {label}
      </span>
    </div>
  )
}
