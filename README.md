# Hourly Calculator

A React-based calculator for determining hourly rates based on various factors such as age, qualifications, and status.

## Features

- Dynamic calculation of hourly rates based on seniority
- Adjustments for qualifications, membership status, and other factors
- Multiple service types (Internal, Commercial, Strategic)
- Interactive visualization of seniority bonus growth
- Mathematical formula display with MathJax integration

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hourly-calculator.git

# Navigate to the project directory
cd hourly-calculator

# Install dependencies
npm install
```

## Local Development

```bash
# Start the development server
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Deployment to GitHub Pages

### Prerequisites

- GitHub account
- Git installed on your computer

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "hourly-calculator")
4. Choose whether to make it public or private
5. Click "Create repository"

### Step 2: Initialize Git and Push Your Code

```bash
# Initialize Git in your project (if not already done)
git init

# Add the remote repository
git remote add origin https://github.com/yourusername/hourly-calculator.git

# Add your files
git add .

# Commit your files
git commit -m "Initial commit"

# Push to GitHub
git push -u origin main
```

### Step 3: Install GitHub Pages Package

Due to TypeScript version conflicts, you'll need to use a special flag:

```bash
npm install --save gh-pages --legacy-peer-deps
```

Or alternatively:

```bash
npm install --save gh-pages --force
```

### Step 4: Configure package.json

Add these lines to your `package.json`:

```json
"homepage": "https://yourusername.github.io/hourly-calculator",
"scripts": {
  // ... other scripts
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

### Step 5: Deploy

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