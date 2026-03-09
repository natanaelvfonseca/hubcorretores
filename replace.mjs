import fs from 'fs';

let content = fs.readFileSync('src/pages/onboarding/OnboardingV2.tsx', 'utf8');

// The mappings
const map = {
    'text-white/45': 'text-gray-500',
    'text-white/40': 'text-gray-400',
    'text-white/35': 'text-gray-400',
    'text-white/30': 'text-gray-400',
    'text-white/28': 'text-gray-300',
    'text-white/25': 'text-gray-400',
    'text-white/20': 'text-gray-400',
    'text-white/50': 'text-gray-500',
    'text-white/55': 'text-gray-600',
    'text-white/60': 'text-gray-600',
    'text-white/70': 'text-gray-700',
    'text-white/80': 'text-gray-700',
    'text-white/85': 'text-gray-800',
    'bg-white/2': 'bg-gray-50',
    'bg-white/3': 'bg-gray-50',
    'bg-white/4': 'bg-gray-50',
    'bg-white/5': 'bg-gray-50',
    'bg-white/8': 'bg-gray-100',
    'bg-white/10': 'bg-gray-100',
    'border-white/8': 'border-gray-200',
    'border-white/10': 'border-gray-200',
    'border-white/12': 'border-gray-200',
    'border-white/25': 'border-gray-300',
    'placeholder-white/25': 'placeholder-gray-400',
    'bg-white/40': 'bg-gray-300'
};

for (const [k, v] of Object.entries(map)) {
    // using regex to match word boundary or specific trailing chars so we don't partially replace
    const regex = new RegExp(k.replace(/\//g, '\\/') + '(?![0-9])', 'g');
    content = content.replace(regex, v);
}

// standalone text-white -> text-gray-900 EXCEPT when inside colored buttons
content = content.replace(/\btext-white\b(?![\/-])/g, (match, offset) => {
    const before = content.slice(Math.max(0, offset - 200), offset);
    if (/bg-\[#FF4C00\]|from-\[#FF4C00\]|bg-\[#25D366\]|fill-white|bg-green-5|bg-red-5|bg-emerald-/.test(before)) {
        return 'text-white';
    }
    return 'text-gray-900';
});

// Fix specific Step 12 upload area which had text-white/12
content = content.replace(/border-white\/12/g, 'border-gray-200');

fs.writeFileSync('src/pages/onboarding/OnboardingV2.tsx', content);
console.log('Replacement finished successfully');
