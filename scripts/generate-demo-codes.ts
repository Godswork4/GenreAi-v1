import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateAccessCodes } from '../src/services/demoAccess';

const NUMBER_OF_CODES = 100;

// Generate codes
const codes = generateAccessCodes(NUMBER_OF_CODES);

// Save codes to a text file
const codesFile = join(__dirname, '../demo-codes.txt');
writeFileSync(codesFile, codes.join('\n'), 'utf-8');

// Create .env content with the codes
const envContent = `VITE_DEMO_ACCESS_CODES=${codes.join(',')}\n`;
const envFile = join(__dirname, '../.env.local');
writeFileSync(envFile, envContent, 'utf-8');

console.log(`Generated ${NUMBER_OF_CODES} demo access codes`);
console.log('Codes have been saved to:', codesFile);
console.log('Environment variables have been updated in:', envFile); 