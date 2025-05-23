# Browser Automation Agent

An AI-powered browser automation tool built with Next.js and Gemini 2.0 Vision AI. Transform natural language into browser automation with visual understanding.

## Features

- Convert natural language to browser automation steps
- Advanced screenshot analysis and visual understanding
- Intelligent element detection with fallback strategies
- Automatic screenshot capture with metadata
- Real-time progress tracking
- Clean, minimalist interface
- Secure API key management

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
Developer  
[GitHub](https://github.com/razee4315) | [Email](mailto:saqlainrazee@gmail.com)

**Aleena Tahir**  
Developer  
[GitHub](https://github.com/AleenaTahir1) | [Email](mailto:aleenatahirf23@nutech.edu.pk)

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

For support, email us at [saqlainrazee@gmail.com](mailto:saqlainrazee@gmail.com)

---

<div align="center">

**[⭐ Star this repo](https://github.com/razee4315/browser-automation-agent) if you find it useful!**


</div>
