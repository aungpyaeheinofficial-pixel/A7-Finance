'use client';

import React from 'react';

interface QuickActionCardProps {
  badge: string;
  badgeColor: string;
  description: string;
  hoverColor: string;
  onClick?: () => void;
}

function QuickActionCard({ badge, badgeColor, description, hoverColor, onClick }: QuickActionCardProps) {
  // Map hover colors to proper Tailwind classes
  const hoverBorderClass = {
    blue: 'hover:border-blue-300',
    purple: 'hover:border-purple-300',
    green: 'hover:border-green-300',
    amber: 'hover:border-amber-300',
  }[hoverColor] || 'hover:border-blue-300';

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg ${hoverBorderClass} transition-all duration-200 cursor-pointer group`}
    >
      <span className={`inline-block ${badgeColor} text-white text-sm font-medium px-3 py-1.5 rounded-lg mb-3`}>
        {badge}
      </span>
      <p className="font-myanmar text-sm text-gray-600 leading-relaxed line-clamp-2">
        {description}
      </p>
    </div>
  );
}

export default function QuickActionCards({ onCardClick }: { onCardClick?: (text: string) => void }) {
  const cards = [
    {
      badge: 'Profit Analysis',
      badgeColor: 'bg-blue-500',
      hoverColor: 'blue',
      description: 'ဝင်ငွေ မှတ်တမ်း၊ ကုန်ကျစရိတ် ထောက်ခံ အမြတ်အစွန်းလေးလာမှုရှာရန်',
      text: 'ဝင်ငွေ ၅၀သန်း၊ ကုန်ကျစရိတ် ၃၀သန်း ဆိုရင် အမြတ်ဘယ်လောက်ရမလဲ',
    },
    {
      badge: 'Policy Query',
      badgeColor: 'bg-purple-500',
      hoverColor: 'purple',
      description: 'CBM ၏ မူဝါဒနှင့် မူဝါဒ ရှင်းပြပါ',
      text: 'CBM ၏ ငွေလဲနှုန်း မူဝါဒ ရှင်းပြပါ',
    },
    {
      badge: 'Banking Info',
      badgeColor: 'bg-green-500',
      hoverColor: 'green',
      description: 'SME လုပ်ငန်းအတွက် ဘဏ်ဆိုင်ရာထောက်ပံ့မှုများ',
      text: 'SME လုပ်ငန်းအတွက် ဘဏ်ချေးငွေ လျှောက်ထားနည်း',
    },
    {
      badge: 'Market Update',
      badgeColor: 'bg-amber-500',
      hoverColor: 'amber',
      description: 'မြန်မာကုန်ထုတ်လုပ်မှုအခြေအနေ ရှင်းပြပါ',
      text: 'ရွှေဈေးကွက် လက်ရှိအခြေအနေ ရှင်းပြပါ',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-12">
      {cards.map((card, index) => (
        <QuickActionCard
          key={index}
          badge={card.badge}
          badgeColor={card.badgeColor}
          hoverColor={card.hoverColor}
          description={card.description}
          onClick={() => onCardClick?.(card.text)}
        />
      ))}
    </div>
  );
}

