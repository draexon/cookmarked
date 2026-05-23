import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, QrCode, Twitter, Link2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { generateShareUrl } from '@/utils'

export default function ShareModal({ collection, onClose }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const shareUrl = generateShareUrl(collection?.share_token || collection?.id)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-strong w-full max-w-sm rounded-2xl border border-border p-6 shadow-elevated pointer-events-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-text-primary">Share Collection</h2>
              <p className="text-xs text-text-muted mt-0.5">{collection?.name}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-all">
              <X size={16} />
            </button>
          </div>

          {/* URL */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-bg-elevated border border-border rounded-xl px-3 py-2.5 flex items-center gap-2 overflow-hidden">
              <Link2 size={14} className="text-text-muted flex-shrink-0" />
              <span className="text-xs text-text-secondary truncate">{shareUrl}</span>
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all ${
                copied ? 'bg-green-500/15 border border-green-500/25 text-green-400' : 'btn-primary'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* QR Toggle */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-text-secondary hover:border-border-strong hover:text-text-primary transition-all text-sm mb-3"
          >
            <QrCode size={14} />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>

          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex justify-center p-4 bg-white rounded-2xl mb-3">
                  <QRCodeSVG value={shareUrl} size={160} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social */}
          <div className="flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check+out+my+collection`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] text-sm hover:bg-[#1DA1F2]/15 transition-all"
            >
              <Twitter size={14} />
              Tweet
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
