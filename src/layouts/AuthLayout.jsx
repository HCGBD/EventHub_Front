import React from 'react';
import { NorthernLightsBackground } from '@/components/ui/shadcn-io/northern-lights-background';

export default function AuthLayout({ children }) {
  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900'>
      <NorthernLightsBackground
        className='fixed inset-0 z-0'
        colorStops={['#5227FF', '#7cff67', '#ff6b35']}
        amplitude={1.2}
        blend={0.6}
        speed={1.5}
      />
      <div className='relative z-10 flex items-center justify-center min-h-screen'>
        <div className='w-full max-w-xl p-8 space-y-8 flex justify-center items-center h-[550px] bg-gradient-to-b from-gray-300/30 to-stone-700/60 rounded-2xl shadow-2xl dark:bg-gray-800'>
          {children}
        </div>
      </div>
    </div>
  );
}