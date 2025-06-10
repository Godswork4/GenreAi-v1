import type { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
      <footer className="bg-surface-dark border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">AI DeFi Copilot</h3>
              <p className="text-sm text-gray-400">
                Your intelligent companion for navigating the DeFi ecosystem.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>AI-Powered Analysis</li>
                <li>Real-time Trading</li>
                <li>Portfolio Tracking</li>
                <li>Smart Yield Optimization</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} AI DeFi Copilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 