'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <div className="max-w-[600px] mx-auto pt-[60px]">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <svg 
            className="w-10 h-10 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
        Myanmar AI Business Advisor
      </h2>

      {/* Description */}
      <p className="font-myanmar text-base text-gray-600 leading-relaxed text-center max-w-[480px] mx-auto">
        စီးပွားရေး၊ ဘဏ္ဍာရေး၊ အခွန်၊ SME နှင့် ဘဏ်လုပ်ငန်းဆိုင်ရာ မေးခွန်းများကို မေးမြန်းနိုင်ပါသည်။
        ကိန်းဂဏန်းများ ခွဲခြမ်းစိတ်ဖြာရန် "Deep Think" ကို ဖွင့်ပါ။
      </p>
    </div>
  );
}

