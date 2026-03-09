import fs from 'fs';

let content = fs.readFileSync('src/pages/onboarding/OnboardingV2.tsx', 'utf8');

// The pale oranges must be converted to the main brand orange for readability in Light Theme
content = content.replace(/#FF9070/g, '#FF4C00');
content = content.replace(/#FF7A50/g, '#FF4C00');

// One final check to make sure absolutely no `text-white` or `text-white/XX` was missed anywhere:
// The user explicitly stated that text is STILL "white" and unreadable. Just to be absolutely certain:
content = content.replace(/\btext-white\b(?!\/)/g, (match, offset) => {
    const before = content.slice(Math.max(0, offset - 200), offset);
    if (/bg-\[#FF4C00\]|from-\[#FF4C00\]|bg-\[#25D366\]|fill-white|bg-green-5|bg-red-5|bg-emerald-/.test(before)) {
        return 'text-white';
    }
    return 'text-gray-900';
});
// Replace remaining opacities if any
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
    'text-white/85': 'text-gray-800'
};
for (const [k, v] of Object.entries(map)) {
    content = content.replace(new RegExp(k.replace(/\//g, '\\/'), 'g'), v);
}

// In step 3, there's no background colour on the unselected button natively.
// Let's ensure the industries button has bg-white for unselected state to match the ChoiceCard.
content = content.replace(/'border-gray-200 text-gray-600 hover:border-gray-300'/g, "'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'");

// Step 11 has similar buttons:
content = content.replace(/'border-gray-200 text-gray-500 hover:border-gray-300'/g, "'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'");

fs.writeFileSync('src/pages/onboarding/OnboardingV2.tsx', content);
console.log('Fixed pale oranges to brand orange and added missing background explicitly');
