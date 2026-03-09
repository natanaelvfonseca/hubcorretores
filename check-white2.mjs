import fs from 'fs';
const content = fs.readFileSync('src/pages/onboarding/OnboardingV2.tsx', 'utf8');

let out = '';
let found = false;
content.replace(/.{0,50}\btext-white\b(?!\/).{0,50}/g, (match) => {
    out += match + '\n';
    found = true;
});

if (!found) out = "No text-white found";
fs.writeFileSync('check-white.txt', out);
