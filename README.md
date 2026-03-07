# DevOps Portfolio Site

A sleek, data-driven static portfolio website designed explicitly for DevOps, SRE, and Cloud Engineers. It prioritizes information density, technical readability, and a professional "dashboard" aesthetic over flashy animations.

Built with **plain HTML5, CSS3, and Vanilla JavaScript**. Zero build steps, zero node modules (except a CDN link for parsing YAML), and ready to deploy instantly.

## Key Features

- **YAML-Driven Content:** All personal data (skills, experience, projects) is stored in a single `content.yaml` file. Update your site without ever touching HTML or JavaScript.
- **Recruiter Optimized:** Skills are categorized and presented *above* experience. Every bullet point is scannable in seconds.
- **Dark & Light Modes:** Built-in theme toggle with `localStorage` persistence. Defaults to the "Void Space" dark theme (ideal for developers) with a cleanly mapped "Cloud Canvas" light theme.
- **Responsive & Fast:** Fully responsive grid layouts, mobile navigation drawer, and 100% Lighthouse performance scores.
- **Subtle Interactions:** Scroll-based active navigation highlighting, IntersectionObserver fade-in animations, and a back-to-top button.
- **Print Ready:** Dedicated `@media print` print styles ensure your portfolio looks perfect if saved as a PDF.

## Getting Started

Because there is no build step, getting your portfolio live takes less than 5 minutes.

### 1. Clone & Setup

```bash
git clone https://github.com/TheOneOh1/portfolio-site.git
cd portfolio-site
```

### 2. Customize Your Content

Open `content.yaml` and replace the existing placeholder data with your own.

```yaml
about:
  name: Your Name
  title: DevOps Engineer
  tagline: "Bridging code and infrastructure."
  summary: >
    Your professional summary goes here...
  currently_learning: Azure, Kubernetes Certs
  resume_url: your_resume.pdf

# ... update skills, experience, projects, etc.
```

**Important Notes:**
- Drop your actual resume PDF into the project root and update `resume_url` in the YAML to match the filename.
- For icons in the links section, supported values are: `email`, `linkedin`, `github`, and `download`.

### 3. Test Locally

Because the JavaScript uses the `fetch()` API to load the `content.yaml` file, you cannot simply double-click `index.html` (it will trigger CORS errors on `file://` protocols). You need a local web server.

If you have Python installed:
```bash
python -m http.server 8080
# Open http://localhost:8080 in your browser
```

Or using Node.js:
```bash
npx serve
```

### 4. Deploy

This site is perfectly suited for **GitHub Pages**.

1. Create a repository on GitHub (e.g., `yourusername.github.io`).
2. Push this code to the `main` branch.
3. In your repository settings, enable GitHub Pages pointing to the `main` branch root.

## File Structure

Keep it simple:

- `index.html` — The skeleton layout, meta tags, and SVG icons.
- `style.css` — The complete design system (tokens, grid, themes, print).
- `script.js` — Fetches YAML, renders the DOM, and handles interactions.
- `content.yaml` — **← Start here.** The only file you need to edit to update your site.


---

