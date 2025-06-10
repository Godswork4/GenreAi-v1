import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, ChartBarIcon, ArrowsRightLeftIcon, BanknotesIcon, SparklesIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Swap', href: '/swap', icon: ArrowsRightLeftIcon },
  { name: 'Stake', href: '/stake', icon: BanknotesIcon },
  { name: 'AI Copilot', href: '/ai-copilot', icon: SparklesIcon },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const NavLinks = () => (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-surface-dark hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-surface text-white hover:bg-surface-dark transition-colors"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-background z-40 lg:hidden p-4"
          >
            <div className="flex items-center space-x-2 mb-8">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <h1 className="text-xl font-bold text-white">AI DeFi Copilot</h1>
            </div>
            <NavLinks />
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:fixed lg:flex lg:flex-col top-0 left-0 h-screen w-64 bg-surface border-r border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-8">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
          <h1 className="text-xl font-bold text-white">AI DeFi Copilot</h1>
        </div>
        <NavLinks />
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  )
} 