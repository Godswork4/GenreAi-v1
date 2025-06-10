import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/Logo';
import { WaitlistForm } from '../components/Waitlist';
import { FuturePassAuth } from '../components/FuturePassAuth';
import { useAuth } from '../store/authStore';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const glowAnimation = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const features = [
  {
    title: 'AI Trading Insights',
    description: 'Get real-time trading recommendations powered by advanced AI algorithms',
    gradient: 'from-[#00E5FF] to-[#4D4DFF]'
  },
  {
    title: 'Portfolio Analytics',
    description: 'Comprehensive analysis of your DeFi portfolio performance',
    gradient: 'from-[#4D4DFF] to-[#BD00FF]'
  },
  {
    title: 'Risk Management',
    description: 'Smart risk assessment and management tools',
    gradient: 'from-[#BD00FF] to-[#00E5FF]'
  }
];

export const Landing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithDemo } = useAuth();
  const featuresRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const targetRef = {
        '#features': featuresRef,
        '#about': aboutRef,
        '#contact': contactRef,
        '#waitlist': waitlistRef
      }[hash];

      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const handleDemoClick = async () => {
    try {
      await loginWithDemo();
      navigate('/app');
    } catch (error) {
      console.error('Failed to start demo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B14] text-white overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8"
      >
        {/* Background Effects */}
        <motion.div
          variants={glowAnimation}
          className="absolute top-0 left-1/4 w-96 h-96 bg-[#4D4DFF] rounded-full filter blur-[128px] opacity-20"
        />
        <motion.div
          variants={glowAnimation}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#BD00FF] rounded-full filter blur-[128px] opacity-20"
        />

        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={floatingAnimation}
            className="flex justify-center mb-12"
          >
            <Logo className="scale-150" />
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-7xl font-bold text-center mb-6 bg-gradient-to-r from-[#00E5FF] via-[#4D4DFF] to-[#BD00FF] text-transparent bg-clip-text"
          >
            Genre AI DeFi Platform
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto"
          >
            Your intelligent companion for navigating the Root Network DeFi ecosystem.
            Swap tokens, manage liquidity, and explore opportunities with AI guidance.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center gap-6 max-w-md mx-auto"
          >
            <FuturePassAuth />
            
            <div className="w-full flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-[#4D4DFF]/30" />
              <span className="text-gray-400">or</span>
              <div className="flex-1 h-px bg-[#4D4DFF]/30" />
            </div>

            <motion.button
              onClick={handleDemoClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-8 py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#4D4DFF] hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-shadow"
            >
              Try Demo Mode
            </motion.button>
            
            <motion.a
              href="#waitlist"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-8 py-4 text-lg font-medium rounded-xl border-2 border-[#4D4DFF] text-[#00E5FF] hover:bg-[#4D4DFF]/10 transition-colors text-center"
            >
              Join Waitlist
            </motion.a>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 relative"
      >
        <motion.div
          variants={glowAnimation}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl bg-[#4D4DFF] rounded-full filter blur-[160px] opacity-10"
        />

        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#00E5FF] to-[#BD00FF] text-transparent bg-clip-text"
          >
            Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/20 to-[#BD00FF]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative p-8 rounded-2xl bg-[#1A1A2E] border border-[#4D4DFF]/30 backdrop-blur-xl">
                  <div className={`w-12 h-12 mb-6 rounded-xl bg-gradient-to-r ${feature.gradient}`} />
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
              </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Waitlist Section */}
      <motion.section
        ref={waitlistRef}
        id="waitlist"
        className="py-20 px-4 sm:px-6 lg:px-8 relative"
      >
        <motion.div
          variants={glowAnimation}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-[#BD00FF] rounded-full filter blur-[160px] opacity-10"
        />

        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#00E5FF] to-[#BD00FF] text-transparent bg-clip-text"
          >
            Join the Revolution
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 to-[#BD00FF]/10 rounded-2xl blur-xl" />
            <div className="relative p-8 rounded-2xl bg-[#1A1A2E] border border-[#4D4DFF]/30 backdrop-blur-xl">
              <WaitlistForm />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="py-8 px-4 sm:px-6 lg:px-8 border-t border-[#4D4DFF]/20"
      >
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2024 GenreAI. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}; 