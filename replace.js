const fs = require('fs');
const path = './src/components/Analytics/DashboardSections.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/cursor={{ fill: 'rgba\(255,255,255,0\.05\)' }}/g, 'cursor={false}');
content = content.replace(/cursor={{ stroke: 'rgba\(255,255,255,0\.1\)' }}/g, 'cursor={false}');
content = content.replace(/<Bar dataKey="value"/g, '<Bar activeBar={false} dataKey="value"');
fs.writeFileSync(path, content);
console.log('Done');
