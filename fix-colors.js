const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Regex to find class names containing text-white. 
      // We only want to replace it if the same string doesn't contain a dark solid background
      const classRegex = /className=(["'])(.*?)\1|className=\{`([^`]+)`\}/g;
      
      const newContent = content.replace(classRegex, (match, quote, p2, p3) => {
        let classStr = p2 !== undefined ? p2 : p3;
        
        // If it doesn't have text-white, return as is
        if (!classStr.includes('text-white')) return match;
        
        // Check for solid backgrounds
        const hasSolidBg = /bg-(brand|emerald|amber|rose|blue|red|green|primary)-\d+/.test(classStr) || 
                           /bg-black/.test(classStr) || /bg-zinc-800/.test(classStr) || /bg-zinc-900/.test(classStr);
        
        if (!hasSolidBg) {
          // Replace text-white with text-foreground
          // Also replace hover:text-white with hover:text-foreground
          classStr = classStr.replace(/\btext-white\b/g, 'text-foreground')
                             .replace(/\bhover:text-white\b/g, 'hover:text-foreground');
        }
        
        if (p2 !== undefined) {
          return `className=${quote}${classStr}${quote}`;
        } else {
          return 'className={`' + classStr + '`}';
        }
      });
      
      if (newContent !== content) {
        console.log(`Updated ${fullPath}`);
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

processDir('./apps/web/src');
