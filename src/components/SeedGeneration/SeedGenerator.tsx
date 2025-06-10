import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  expectedReturn: string;
  timeframe: string;
  tokens: string[];
  confidence: number;
}

interface SeedGenerationProps {
  onStrategyGenerated?: (strategy: TradingStrategy) => void;
}

const SeedGenerator: React.FC<SeedGenerationProps> = ({ onStrategyGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedStrategy, setGeneratedStrategy] = useState<TradingStrategy | null>(null);
  const [progress, setProgress] = useState(0);

  const generationSteps = [
    { icon: CpuChipIcon, text: 'Analyzing market conditions...', color: 'text-blue-400' },
    { icon: ChartBarIcon, text: 'Processing price patterns...', color: 'text-green-400' },
    { icon: BeakerIcon, text: 'Optimizing risk parameters...', color: 'text-purple-400' },
    { icon: ArrowTrendingUpIcon, text: 'Calculating profit potential...', color: 'text-orange-400' },
    { icon: SparklesIcon, text: 'Generating AI strategy...', color: 'text-pink-400' },
    { icon: RocketLaunchIcon, text: 'Strategy ready for deployment!', color: 'text-emerald-400' }
  ];

  const mockStrategies: TradingStrategy[] = [
    {
      id: 'momentum-surge',
      name: 'Momentum Surge Strategy',
      description: 'Capitalizes on strong upward price movements in ROOT/USDT pair with AI-powered entry and exit signals.',
      riskLevel: 'Medium',
      expectedReturn: '12-18%',
      timeframe: '2-4 weeks',
      tokens: ['ROOT', 'USDT'],
      confidence: 87
    },
    {
      id: 'volatility-harvest',
      name: 'Volatility Harvest',
      description: 'Exploits price volatility in XRP/ROOT markets using advanced pattern recognition algorithms.',
      riskLevel: 'High',
      expectedReturn: '20-35%',
      timeframe: '1-3 weeks',
      tokens: ['XRP', 'ROOT'],
      confidence: 92
    },
    {
      id: 'stable-growth',
      name: 'Stable Growth Protocol',
      description: 'Conservative approach focusing on steady gains through USDT liquidity provision and yield farming.',
      riskLevel: 'Low',
      expectedReturn: '8-12%',
      timeframe: '4-8 weeks',
      tokens: ['USDT', 'ROOT', 'ASTO'],
      confidence: 95
    }
  ];

  const generateStrategy = async () => {
    setIsGenerating(true);
    setCurrentStep(0);
    setProgress(0);
    setGeneratedStrategy(null);

    // Simulate AI generation process
    for (let i = 0; i < generationSteps.length; i++) {
      setCurrentStep(i);
      setProgress((i / (generationSteps.length - 1)) * 100);
      
      // Variable delay for each step to make it feel more realistic
      const delay = i === generationSteps.length - 1 ? 1500 : 800 + Math.random() * 400;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Select a random strategy
    const strategy = mockStrategies[Math.floor(Math.random() * mockStrategies.length)];
    setGeneratedStrategy(strategy);
    setIsGenerating(false);
    
    if (onStrategyGenerated) {
      onStrategyGenerated(strategy);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'High': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <SparklesIcon className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-bold text-white">AI Strategy Generator</h2>
        </motion.div>
        <p className="text-gray-400 max-w-lg mx-auto">
          Let Genre AI create a personalized trading strategy based on real-time market analysis and your risk preferences.
        </p>
      </div>

      {/* Generation Interface */}
      <div className="bg-[#1a1b1f] rounded-xl p-8 space-y-6">
        {!isGenerating && !generatedStrategy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate Your Strategy?</h3>
              <p className="text-gray-400">
                Our AI will analyze current market conditions and create a custom trading strategy for you.
              </p>
            </div>
            <button
              onClick={generateStrategy}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            >
              Generate AI Strategy
            </button>
          </motion.div>
        )}

        {/* Generation Process */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Generating Strategy</span>
                <span className="text-blue-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Current Step */}
            <div className="space-y-4">
              {generationSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.3, x: -20 }}
                    animate={{ 
                      opacity: isActive ? 1 : isCompleted ? 0.7 : 0.3,
                      x: isActive ? 0 : -20,
                      scale: isActive ? 1.02 : 1
                    }}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      isActive ? 'bg-gray-800/50' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? step.color.replace('text-', 'bg-').replace('400', '400/20') : 'bg-gray-800'}`}>
                      <StepIcon className={`w-5 h-5 ${isActive ? step.color : 'text-gray-500'}`} />
                    </div>
                    <span className={`${isActive ? 'text-white' : 'text-gray-500'} transition-colors`}>
                      {step.text}
                    </span>
                    {isCompleted && (
                      <CheckCircleIcon className="w-5 h-5 text-green-400 ml-auto" />
                    )}
                    {isActive && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="ml-auto"
                      >
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Generated Strategy */}
        <AnimatePresence>
          {generatedStrategy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircleIcon className="w-8 h-8 text-green-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white">Strategy Generated Successfully!</h3>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">{generatedStrategy.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(generatedStrategy.riskLevel)}`}>
                      {generatedStrategy.riskLevel} Risk
                    </span>
                    <div className="flex items-center gap-1">
                      <SparklesIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm font-medium">{generatedStrategy.confidence}% Confidence</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300">{generatedStrategy.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Expected Return</div>
                    <div className="text-green-400 font-semibold">{generatedStrategy.expectedReturn}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Timeframe</div>
                    <div className="text-white font-semibold">{generatedStrategy.timeframe}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Tokens</div>
                    <div className="flex gap-1">
                      {generatedStrategy.tokens.map((token, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity">
                    Deploy Strategy
                  </button>
                  <button 
                    onClick={generateStrategy}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors"
                  >
                    Generate New
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Section */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ClockIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-400 font-medium mb-1">Coming Soon</p>
            <p className="text-gray-300">
              Strategy deployment and automated trading will be available soon. 
              Join our waitlist to be notified when this feature launches!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedGenerator;