# 🚀 Deployment Guide

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Prerequisites

1. **GitHub Repository**: Fork or create a repository
2. **GitHub Pages**: Enable GitHub Pages in repository settings
3. **Actions Permission**: Ensure GitHub Actions can write to Pages

### Automatic Deployment

1. **Push to main branch** - Deployment happens automatically
2. **GitHub Actions** builds and deploys the site
3. **Live URL**: `https://[username].github.io/browser-automation-agent`

### Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Build the project
npm run build

# 2. Export static files
npm run export

# 3. Deploy the 'out' folder to GitHub Pages
# (You can use GitHub CLI, or manually upload)
```

### Configuration

The project includes:

- **Next.js static export** configuration
- **GitHub Actions workflow** (`.github/workflows/deploy.yml`)
- **Public folder** with `.nojekyll` file
- **Optimized images** and assets

### Environment Variables

For GitHub Pages deployment:

- **No server-side environment variables** needed
- **API keys entered** directly in the app
- **Secure local storage** for user data

### Custom Domain (Optional)

To use a custom domain:

1. Add `CNAME` file in `public/` folder
2. Configure DNS settings
3. Enable HTTPS in GitHub Pages settings

### Troubleshooting

**Build Failures:**
- Check Node.js version (use 18+)
- Verify all dependencies are installed
- Review build logs in Actions tab

**404 Errors:**
- Ensure `.nojekyll` file exists
- Check repository Pages settings
- Verify build output in `out` folder

**API Issues:**
- API calls work only in development
- Production uses client-side API key storage
- Server-side API routes won't work on GitHub Pages

### Alternative Deployment Options

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
# Upload 'out' folder to Netlify
```

**Docker:**
```bash
docker build -t browser-automation-agent .
docker run -p 3000:3000 browser-automation-agent
```

---

**Ready to deploy? Push to main branch and watch the magic happen! ✨** 