import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import FloatingActionButton from '@/components/layout/FloatingActionButton'
import SaveReelModal from '@/components/modals/SaveReelModal'
import RandomReelModal from '@/components/modals/RandomReelModal'
import { useUIStore } from '@/store/uiStore'

export default function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Ambient bg */}
      <div className="fixed inset-0 bg-mesh-1 pointer-events-none opacity-60 z-0" />

      {/* Sidebar — desktop only */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-30">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Topbar />

        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <motion.div
            key="page"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>

      {/* FAB */}
      <FloatingActionButton />

      {/* Modals */}
      <SaveReelModal />
      <RandomReelModal />
    </div>
  )
}
