import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, 'src/commands');

async function getAllFiles(directory, fileList = []) {
    const files = await fs.readdir(directory, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = path.join(directory, file.name);
        if (file.isDirectory()) {
            if (file.name === 'modules') continue;
            await getAllFiles(filePath, fileList);
        } else if (file.name.endsWith('.js')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

async function testCommands() {
    const commandFiles = await getAllFiles(commandsPath);
    console.log(`Found ${commandFiles.length} command files to check.`);
    
    let failed = 0;
    
    for (const filePath of commandFiles) {
        try {
            const commandModule = await import(`file://${filePath}`);
            const command = commandModule.default || commandModule;
            if (!command.data || !command.execute) {
                console.log(`❌ Missing data/execute: ${filePath}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ Error loading ${filePath}: ${error.message}`);
            failed++;
        }
    }
    
    console.log(`\nTest complete. ${failed} commands failed to load.`);
}

testCommands();
