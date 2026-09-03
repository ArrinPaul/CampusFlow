const fs = require('fs');
const path = require('path');

const files = [
  'F:/Project/Hackathon/frontend/src/app/(dashboard)/dashboard/flashcards/page.tsx',
  'F:/Project/Hackathon/frontend/src/app/(dashboard)/dashboard/quiz/page.tsx'
];

const replacements = [
  { regex: /bg-\[#fdfaff\]/g, replacement: 'bg-background' },
  { regex: /text-\[#2d3a34\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#5b21b6\]/g, replacement: 'text-primary' },
  { regex: /text-\[#6b5a80\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#2d1055\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#4c1d95\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#8b7a9e\]/g, replacement: 'text-muted-foreground' },
  { regex: /border-\[#e0d4f0\]/g, replacement: 'border-border' },
  { regex: /border-\[#c4a8f0\]/g, replacement: 'border-border' },
  { regex: /bg-\[#e8e0f2\]/g, replacement: 'bg-muted' },
  { regex: /bg-\[#e0daf0\]/g, replacement: 'bg-accent' },
  { regex: /bg-\[#f3eff8\]/g, replacement: 'bg-card' },
  { regex: /border-\[#cfc0e0\]/g, replacement: 'border-border' },
  { regex: /bg-\[#5b21b6\]/g, replacement: 'bg-primary' },
  { regex: /bg-\[#fbf8f2\]/g, replacement: 'bg-accent' },
  { regex: /text-\[#7c3aed\]/g, replacement: 'text-foreground' },
  { regex: /text-white/g, replacement: 'text-primary-foreground' },
  { regex: /rounded-\[12px\]/g, replacement: 'rounded-[10px]' },
  { regex: /rounded-\[16px\]/g, replacement: 'rounded-[10px]' },
  { regex: /rounded-\[8px\]/g, replacement: 'rounded-[10px]' },
  { regex: /shadow-xs/g, replacement: 'shadow-sm' },
  { regex: /font-serif/g, replacement: 'font-sans' },
  { regex: /border-\[#5b21b6\]\/40/g, replacement: 'border-primary/40' },
  { regex: /hover:bg-\[#e8e0f2\]\/50/g, replacement: 'hover:bg-accent/50' },
  { regex: /hover:bg-\[#e8e0f2\]\/45/g, replacement: 'hover:bg-accent/45' },
  { regex: /hover:bg-\[#e8e0f2\]\/40/g, replacement: 'hover:bg-accent/40' },
  { regex: /hover:border-\[#5b21b6\]\/30/g, replacement: 'hover:border-primary/30' },
  { regex: /hover:text-\[#2d3a34\]/g, replacement: 'hover:text-foreground' },
  { regex: /hover:text-\[#4c1d95\]/g, replacement: 'hover:text-foreground' },
  { regex: /hover:text-\[#5b21b6\]/g, replacement: 'hover:text-primary' },
  { regex: /hover:bg-\[#e8e0f2\]/g, replacement: 'hover:bg-accent' },
  { regex: /hover:bg-\[#4c1d95\]/g, replacement: 'hover:opacity-90' },
  { regex: /bg-\[#5b21b6\]\/10/g, replacement: 'bg-primary/10' },
  { regex: /accent-\[#5b21b6\]/g, replacement: 'accent-primary' },
  { regex: /focus:ring-\[#5b21b6\]/g, replacement: 'focus:ring-ring' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });
  fs.writeFileSync(file, content);
  console.log(`Processed ${file}`);
});
