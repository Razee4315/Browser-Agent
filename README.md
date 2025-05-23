# 🤖 Browser Automation Agent

A minimalistic, AI-powered browser automation tool built with **Next.js** and **Gemini 2.0 Vision AI**. Transform natural language into intelligent browser automation with advanced visual understanding capabilities.

![Browser Automation Agent](https://img.shields.io/badge/AI-Gemini%202.0-black?style=flat-square) ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-black?style=flat-square) ![Tailwind](https://img.shields.io/badge/Tailwind-3-black?style=flat-square)

## ✨ Features

- **🧠 AI-Powered Planning**: Convert natural language to browser automation steps
- **👁️ Vision AI**: Advanced screenshot analysis and visual understanding  
- **🎯 Smart Selectors**: Intelligent element detection with fallback strategies
- **📸 High-Quality Screenshots**: Automatic capture with metadata and analysis
- **🔄 Real-Time Monitoring**: Live progress tracking and status updates
- **🎨 Minimalist Design**: Clean black & white interface focused on functionality
- **🔐 Secure API Key Management**: Local storage with validation

## 🚀 Live Demo

**[Try it now →](https://razee4315.github.io/browser-automation-agent)**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI Engine**: Google Gemini 2.0 Flash Experimental
- **Browser Automation**: Playwright
- **Deployment**: GitHub Pages

## 📋 Prerequisites

- **Gemini API Key**: Get yours from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Node.js**: Version 18 or higher

## 🏃‍♂️ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/razee4315/browser-automation-agent.git
cd browser-automation-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment (Optional)

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: The app will prompt for your API key on first use if not set in environment.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 5. Build for Production

```bash
npm run build
npm start
```

## 🎯 Usage Examples

### Basic Web Search
```
Go to DuckDuckGo and search for 'AI browser automation', then take a screenshot
```

### Alternative Search Engines
```
Visit Brave Search and search for 'Next.js documentation'
```

### Data Extraction
```
Navigate to Hacker News and extract the top 5 story titles
```

### Form Interaction
```
Visit example.com, fill out the contact form with sample data
```

### Social Media Automation
```
Go to Twitter, search for trending topics, and capture the results
```

## 🛡️ reCAPTCHA Avoidance

This tool is configured to prefer **DuckDuckGo** and **Brave Search** over Google to avoid reCAPTCHA challenges that can interrupt automation. Google often detects browser automation and shows reCAPTCHA challenges, while DuckDuckGo and Brave Search are more automation-friendly.

**Recommended search engines:**
- ✅ **DuckDuckGo** (`duckduckgo.com`) - Best for automation
- ✅ **Brave Search** (`search.brave.com`) - Good alternative
- ⚠️ **Google** (`google.com`) - May trigger reCAPTCHA

## 🔧 Configuration

### API Key Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Enter it when prompted in the app

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | Optional* |

*API key can be entered directly in the app interface

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── automation/    # Automation endpoints
│   │   └── validate-key/  # API key validation
│   └── page.tsx          # Main application page
├── components/            # React components
│   ├── ApiKeySetup.tsx   # API key authentication
│   ├── AutomationForm.tsx # User input form
│   ├── AutomationStatus.tsx # Progress tracking
│   └── AutomationResults.tsx # Results display
└── lib/                  # Utility libraries
    ├── browser.ts        # Playwright automation
    ├── gemini.ts         # Gemini AI integration
    └── debug-helpers.ts  # Debugging utilities
```

## 🎨 Design Philosophy

This project embraces **Swiss design principles**:

- **Minimalism**: Clean lines, ample white space
- **Typography**: Light fonts with elegant spacing
- **Monochromatic**: Sophisticated black & white palette
- **Functionality**: Purpose-driven interface design
- **Accessibility**: High contrast for optimal readability

## 🔒 Security & Privacy

- **Local API Key Storage**: Keys stored in browser localStorage
- **No Data Collection**: Your automation data stays private
- **Secure Communication**: HTTPS enforced for all requests
- **Client-Side Processing**: Sensitive operations run locally

## 📱 Browser Support

- **Chrome/Chromium**: ✅ Fully supported
- **Firefox**: ✅ Supported
- **Safari**: ✅ Supported
- **Edge**: ✅ Supported

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Contributors

<div align="center">

### 🧑‍💻 Development Team

**Saqlain Abbas**  
*Lead Developer & AI Integration*  
[![GitHub](https://img.shields.io/badge/GitHub-razee4315-black?style=flat-square&logo=github)](https://github.com/razee4315)  
[![Email](https://img.shields.io/badge/Email-saqlainrazee%40gmail.com-black?style=flat-square&logo=gmail)](mailto:saqlainrazee@gmail.com)

**Aleena Tahir**  
*Frontend Developer & UI/UX Design*  
[![GitHub](https://img.shields.io/badge/GitHub-AleenaTahir1-black?style=flat-square&logo=github)](https://github.com/AleenaTahir1)  
[![Email](https://img.shields.io/badge/Email-aleenatahirf23%40nutech.edu.pk-black?style=flat-square&logo=gmail)](mailto:aleenatahirf23@nutech.edu.pk)

</div>

## 📄 License

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
