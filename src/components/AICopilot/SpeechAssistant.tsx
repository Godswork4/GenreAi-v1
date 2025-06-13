import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface SpeechAssistantProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const SpeechAssistant: React.FC<SpeechAssistantProps> = ({ onTranscript, isProcessing = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure speech recognition with improved settings
      recognitionRef.current.continuous = true; // Keep listening
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 3; // Get more alternatives
      recognitionRef.current.grammars = new (window as any).webkitSpeechGrammarList(); // Add grammar support

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('Final transcript:', finalTranscript);
          } else {
            interimTranscript += transcript;
            console.log('Interim transcript:', interimTranscript);
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          onTranscript(finalTranscript);
          // Don't clear transcript immediately to show feedback
          setTimeout(() => setTranscript(''), 1000);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('');
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice input.');
        } else if (event.error === 'no-speech') {
          // Silent error for no speech detected
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
      } catch (error) {
        console.error('Microphone access error:', error);
        alert('Unable to access microphone. Please check your browser permissions.');
      }
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        disabled={isProcessing}
        className={`p-3 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
            : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <StopIcon className="h-5 w-5 text-white" />
          </motion.div>
        ) : (
          <MicrophoneIcon className="h-5 w-5 text-white" />
        )}
      </motion.button>
      
      {transcript && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="bg-gray-800 rounded-lg px-3 py-2 max-w-xs"
        >
          <p className="text-sm text-gray-300 truncate">
            {transcript}
          </p>
        </motion.div>
      )}
      
      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1"
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  height: [4, 12, 4],
                  backgroundColor: ['#3B82F6', '#EF4444', '#3B82F6']
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                className="w-1 bg-blue-500 rounded-full"
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-2">Listening...</span>
        </motion.div>
      )}
    </div>
  );
};

export default SpeechAssistant;