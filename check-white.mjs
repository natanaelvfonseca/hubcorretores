import fs from 'fs';
const content = fs.readFileSync('src/pages/onboarding/OnboardingV2.tsx', 'utf8');

let found = false;
content.replace(/.{0,50}\btext-white\b(?!\/).{0,50}/g, (match) => {
    console.log(match);
    found = true;
});

if (!found) console.log("No text-white found");
