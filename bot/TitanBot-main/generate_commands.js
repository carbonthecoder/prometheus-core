import fs from 'fs';
import path from 'path';

const commandsDir = path.join(process.cwd(), 'src', 'commands');
let markdown = '# 🤖 TitanBot Command Registry\n\n';
let total = 0;

const categories = fs.readdirSync(commandsDir);
for (const category of categories) {
    const catPath = path.join(commandsDir, category);
    if (!fs.statSync(catPath).isDirectory()) continue;
    
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));
    if (files.length === 0) continue;

    markdown += `\n### 📂 ${category}\n`;
    
    for (const file of files) {
        const filePath = path.join(catPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Simple regex to extract name and description
        const nameMatch = content.match(/\.setName\(['"`](.*?)['"`]\)/);
        const descMatch = content.match(/\.setDescription\(['"`](.*?)['"`]\)/);
        
        if (nameMatch && descMatch) {
            markdown += `- **\`/${nameMatch[1]}\`**: ${descMatch[1]}\n`;
            total++;
        }
    }
}

markdown += `\n\n**Total Commands: ${total}**\n`;
fs.writeFileSync('commands_list.md', markdown);
console.log(`Saved ${total} commands to commands_list.md`);
