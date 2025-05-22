# 🤝 Contributing to Browser Automation Agent

We love your input! We want to make contributing to the Browser Automation Agent as easy and transparent as possible, whether it's:

- 🐛 Reporting a bug
- 💡 Discussing the current state of the code
- 📝 Submitting a fix
- 🚀 Proposing new features
- 👨‍💻 Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** if you've added code that should be tested
4. **Update documentation** if you've changed APIs
5. **Ensure the test suite passes**
6. **Submit a pull request**

## 🎨 Code Style

### TypeScript/JavaScript
- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **Prettier** for code formatting
- Prefer **functional components** and hooks
- Use **meaningful variable names**

### CSS/Styling
- Use **Tailwind CSS** utility classes
- Follow **mobile-first** responsive design
- Maintain **black & white** minimalist theme
- Ensure **accessibility** standards (WCAG 2.1)

### File Structure
```
src/
├── app/          # Next.js App Router pages and API
├── components/   # Reusable React components  
├── lib/          # Utility functions and integrations
└── types/        # TypeScript type definitions
```

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/razee4315/browser-automation-agent/issues).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

## 💡 Feature Requests

We use GitHub issues to track feature requests. Suggest a feature by [opening a new issue](https://github.com/razee4315/browser-automation-agent/issues) with the `enhancement` label.

**Great Feature Requests** include:

- **Clear description** of the problem you're trying to solve
- **Detailed explanation** of the proposed solution
- **Alternative solutions** you've considered
- **Additional context** like mockups or examples

## 🔄 Pull Request Process

1. **Update the README.md** with details of changes to the interface
2. **Update package.json** version following [SemVer](http://semver.org/)
3. **Ensure all tests pass** and linting is clean
4. **Add tests** for new functionality
5. **Get approval** from at least one maintainer

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally with my changes
- [ ] I have added tests that prove my fix is effective or that my feature works

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🏃‍♂️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/browser-automation-agent.git
cd browser-automation-agent

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## 🧪 Testing

- **Unit Tests**: Jest for component and utility testing
- **Integration Tests**: Playwright for browser automation testing
- **E2E Tests**: Cypress for full user journey testing
- **Linting**: ESLint + Prettier for code quality

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📚 Documentation

- **API Documentation**: Update JSDoc comments for all functions
- **Component Documentation**: Storybook stories for UI components
- **README Updates**: Keep installation and usage instructions current
- **Changelog**: Document breaking changes and new features

## 🏷️ Versioning

We use [SemVer](http://semver.org/) for versioning:

- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤔 Questions?

Don't hesitate to ask! You can:

- 💬 Open a [Discussion](https://github.com/razee4315/browser-automation-agent/discussions)
- 📧 Email us at [saqlainrazee@gmail.com](mailto:saqlainrazee@gmail.com)
- 🐛 Open an [Issue](https://github.com/razee4315/browser-automation-agent/issues)

## 🙏 Recognition

Contributors who help improve the project will be recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub Discussions** for community highlights

---

**Thank you for contributing to Browser Automation Agent! 🎉** 