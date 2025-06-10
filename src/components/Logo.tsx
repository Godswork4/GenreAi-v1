import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className = '', showText = true }: LogoProps) => {
  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <motion.div
          className="w-12 h-12 bg-gradient-to-br from-[#00E5FF] via-[#4D4DFF] to-[#BD00FF] rounded-xl"
          initial={{ rotate: -30, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="absolute inset-[1px] bg-[#0B0B14] rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#BD00FF] text-transparent bg-clip-text">
              GA
            </span>
          </div>
        </motion.div>
      </div>
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl font-bold"
        >
          <span className="bg-gradient-to-r from-[#00E5FF] to-[#BD00FF] text-transparent bg-clip-text">
            Genre AI
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}; 