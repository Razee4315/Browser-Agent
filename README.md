# Browser Automation Agent

An AI-powered browser automation tool built with Next.js and Gemini 2.0 Vision AI. Transform natural language into browser automation with visual understanding.

![Browser Automation Agent](https://img.shields.io/badge/AI-Gemini%202.0-black?style=flat-square) ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-black?style=flat-square) ![Tailwind](https://img.shields.io/badge/Tailwind-3-black?style=flat-square)

## Features

- Convert natural language to browser automation steps
- Advanced screenshot analysis and visual understanding
- Intelligent element detection with fallback strategies
- Automatic screenshot capture with metadata
- Real-time progress tracking
- Clean, minimalist interface
- Secure API key management

## Live Demo

[Try it now](https://razee4315.github.io/browser-automation-agent)

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS
- AI Engine: Google Gemini 2.0
- Browser Automation: Playwright
- Deployment: GitHub Pages

## Prerequisites

- Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Node.js 18 or higher

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/razee4315/browser-automation-agent.git
   cd browser-automation-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create `.env.local` with your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > Note: The app will prompt for your API key on first use if not set in environment.

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

5. For production build:
   ```bash
   npm run build
   npm start
   ```

## Usage Examples

```
# Basic web search
Go to DuckDuckGo and search for 'AI browser automation', then take a screenshot

# Alternative search
Visit Brave Search and search for 'Next.js documentation'

# Data extraction
Navigate to Hacker News and extract the top 5 story titles

# Form interaction
Visit example.com, fill out the contact form with sample data

# Social media
Go to Twitter, search for trending topics, and capture the results
```

## reCAPTCHA Avoidance

To avoid reCAPTCHA challenges, the tool prefers DuckDuckGo and Brave Search over Google, which are more automation-friendly.

Recommended search engines:
- DuckDuckGo (duckduckgo.com) - Best for automation
- Brave Search (search.brave.com) - Good alternative
- Google (google.com) - May trigger reCAPTCHA

## Configuration

### API Key Setup

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Enter it in the app when prompted

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | Optional* |

*API key can be entered in the app interface

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   └── page.tsx            # Main page
├── components/             # React components
│   ├── ApiKeySetup.tsx     # API key auth
│   ├── AutomationForm.tsx  # User input
│   ├── AutomationStatus.tsx # Progress
│   └── AutomationResults.tsx # Results
└── lib/                   # Utilities
    ├── browser.ts         # Playwright
    ├── gemini.ts          # Gemini AI
    └── debug-helpers.ts   # Debugging
```

## Design

- Minimalist interface
- Clean typography
- Monochromatic color scheme
- Focus on functionality
- Accessible design

## Security & Privacy

- API keys stored in browser localStorage
- No data collection
- HTTPS required
- Client-side processing

## Browser Support

- Chrome/Chromium
- Firefox
- Safari
- Edge

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request

## Contributors

### Development Team

**Saqlain Abbas**  
Lead Developer & AI Integration  
[GitHub](https://github.com/razee4315) | [Email](mailto:saqlainrazee@gmail.com)

**Aleena Tahir**  
Frontend Developer & UI/UX  
[GitHub](https://github.com/AleenaTahir1) | [Email](mailto:aleenatahirf23@nutech.edu.pk)

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI**: For the powerful Gemini 2.0 API
- **Playwright Team**: For robust browser automation
- **Next.js Team**: For the excellent React framework
- **Tailwind CSS**: For utility-first styling
- **Open Source Community**: For inspiration and tools

## 📈 Roadmap

- [ ] **Multi-Model Support**: Add support for other AI models
- [ ] **Advanced Scheduling**: Cron-based automation scheduling  
- [ ] **Team Collaboration**: Share automation workflows
- [ ] **Mobile App**: Native mobile application
- [ ] **Plugin System**: Extensible automation plugins
- [ ] **Cloud Deployment**: One-click cloud hosting

## 🐛 Issues & Support

Found a bug? Have a feature request? Please check our [Issues](https://github.com/razee4315/browser-automation-agent/issues) page.

For support, email us at [saqlainrazee@gmail.com](mailto:saqlainrazee@gmail.com)

---

<div align="center">

**[⭐ Star this repo](https://github.com/razee4315/browser-automation-agent) if you find it useful!**

*Built with ❤️ by the Browser Automation Team*

</div>
