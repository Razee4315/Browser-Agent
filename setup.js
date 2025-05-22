#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Browser Automation Agent Setup\n');
console.log('This script will help you create your .env.local file with the required configuration.\n');

const envTemplate = `# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY={{GEMINI_API_KEY}}

# Development Environment
NODE_ENV=development

# Browser Automation Settings
HEADLESS=false
BROWSER_TIMEOUT=30000
`;

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    // Check if .env.local already exists
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env.local file already exists!');
      const overwrite = await askQuestion('Do you want to overwrite it? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('\n📋 Configuration Setup:');
    console.log('1. Get your Gemini API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Make sure you have enabled the Gemini API in your Google Cloud Console\n');

    const apiKey = await askQuestion('Enter your Gemini API key: ');
    
    if (!apiKey || apiKey.trim() === '') {
      console.log('❌ API key is required. Setup cancelled.');
      rl.close();
      return;
    }

    // Create .env.local file
    const envContent = envTemplate.replace('{{GEMINI_API_KEY}}', apiKey.trim());
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Configuration complete!');
    console.log('📁 Created .env.local file with your settings');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Start automating with natural language prompts!');
    console.log('\n💡 Example prompts to try:');
    console.log('   • "Go to Google and search for \'Next.js documentation\'"');
    console.log('   • "Visit example.com and take a screenshot"');
    console.log('   • "Navigate to Hacker News and extract the top 5 story titles"');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

main(); 