import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export default function FloatingActionButton() {
  const setSaveModalOpen = useUIStore((s) => s.setSaveModalOpen)

  return (
    <motion.button
      onClick={() => setSaveModalOpen(true)}
      className="lg:hidden fixed bottom-24 right-5 z-40 w-14 h-14 rounded-2xl bg-accent-primary text-white shadow-glow-lg flex items-center justify-center"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      aria-label="Save new reel"
    >
      <Plus size={24} strokeWidth={2.5} />
    </motion.button>
  )
}
