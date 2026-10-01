const fs = require('fs');

function replaceText(filePath, oldText, newText) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`Could not find text in ${filePath}:\n${oldText}`);
  }
}

// 1. HeroSection.tsx
replaceText(
  'src/components/landing/HeroSection.tsx',
  'Capture every detail. Automate follow-ups. Uncover the hidden revenue in your customer conversations.',
  'We listen to your meetings so you don\'t have to. Never drop the ball on a client promise again.'
);

// 2. PremiumBento.tsx - Card 1
replaceText(
  'src/components/landing/PremiumBento.tsx',
  'Every byte of your conversational data is firewalled in a single-tenant architecture. We never train public models on your proprietary memory.',
  'Your data lives in a digital fortress. We strictly use zero-retention APIs, meaning the AI immediately forgets your confidential gossip.'
);

// 3. PremiumBento.tsx - Card 2
replaceText(
  'src/components/landing/PremiumBento.tsx',
  'Citations link every insight directly back to the exact moment in the transcript. No hallucinations, just facts.',
  'AI hallucinations are for artists, not sales teams. We bring receipts for every single insight we generate.'
);

// 4. PremiumBento.tsx - Card 3
replaceText(
  'src/components/landing/PremiumBento.tsx',
  'Our custom speech models catch whispers, cross-talk, and mumbled action items with superhuman precision.',
  'Interrupting clients? Terrible mic audio? Mumbling? Our speech engine hears it all perfectly anyway.'
);

// 5. page.tsx - Footer CTA
replaceText(
  'src/app/page.tsx',
  'Join the top-tier revenue teams who are closing deals faster with perfect, automated memory.',
  'Stop writing things down on sticky notes. Let the robots do the administrative heavy lifting.'
);

// 6. page.tsx - Footer Desc
replaceText(
  'src/app/page.tsx',
  'The intelligence platform designed to perfectly capture, index, and automate your customer conversations.',
  'The AI platform that finally makes taking meeting notes a thing of the past.'
);
