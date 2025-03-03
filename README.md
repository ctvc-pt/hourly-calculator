# Hourly Calculator

A React-based calculator for determining hourly rates based on various factors such as age, qualifications, and status.

## Features

- Dynamic calculation of hourly rates based on seniority
- Adjustments for qualifications, membership status, and other factors
- Multiple service types (Internal, Commercial, Strategic)
- Interactive visualization of seniority bonus growth
- Mathematical formula display with MathJax integration

## Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Deployment to GitHub Pages

```bash
# Deploy with the same flag to avoid TypeScript version conflicts
npm run deploy --legacy-peer-deps
```

### Step 6: Configure GitHub Pages Settings

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Source," select the "gh-pages" branch
4. Click "Save"

Your application should be live at `https://cpdscrl.github.io/hourly-calculator` within a few minutes.