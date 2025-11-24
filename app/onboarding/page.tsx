'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function WelcomeScreen() {
  const [hasResponded, setHasResponded] = useState(false);
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const router = useRouter();

  const handleYes = () => {
    setIsReady(true);
    setHasResponded(true);

    // Redirect to /intro after a graceful delay
    setTimeout(() => {
      router.push('/start/0');
    }, 1400);
  };

  const handleNo = () => {
    setIsReady(false);
    setHasResponded(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Subtle ensō-inspired circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full border border-stone-200 opacity-30" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative z-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-800 mb-8">
            before we begin
          </h1>

          <p className="text-stone-600 text-lg font-light tracking-wide mb-12 leading-relaxed">
            Master your purpose.<br />
            Achieve what others call impossible.
          </p>

          {/* Initial question */}
          {!hasResponded ? (
            <Card className="bg-white/90 backdrop-blur border-none shadow-lg p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl md:text-3xl font-medium text-stone-800 mb-10">
                  Are you ready to begin?
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleYes}
                    size="lg"
                    className="bg-stone-800 hover:bg-stone-900 text-white px-12 py-6 text-lg font-medium tracking-wider transition-all duration-300"
                  >
                    Yes, I am ready
                  </Button>
                  <Button
                    onClick={handleNo}
                    size="lg"
                    variant="ghost"
                    className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-12 py-6 text-lg font-medium tracking-wider"
                  >
                    Not yet
                  </Button>
                </div>
              </motion.div>
            </Card>
          ) : isReady ? (
            // "Yes" → brief affirmation before redirect
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <p className="text-3xl font-light text-stone-700 tracking-wider">
                Welcome to your journey.
              </p>
              <p className="text-lg text-stone-500 mt-6">
                Let’s achieve greatness together.
              </p>
            </motion.div>
          ) : (
            // "No" → gentle waiting message (no redirect)
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <p className="text-2xl font-light text-stone-600 tracking-wider leading-loose">
                We will be waiting for you<br />
                whenever you’re ready.
              </p>
              <p className="text-sm text-stone-400 mt-8">
                Your future self is counting on this moment.
              </p>
            </motion.div>
          )}
        </motion.div>

        <div className="mt-20 text-center">
          <p className="text-xs text-stone-400 tracking-widest">
            原田メソッド © 2025
          </p>
        </div>
      </div>
    </div>
  );
}