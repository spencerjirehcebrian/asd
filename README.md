# ASD - Server Hub

A simple personal dashboard for accessing your self-hosted services. Built with React and TypeScript for reliability and ease of maintenance.

## Features

- Clean dark interface optimized for personal use
- Keyboard search (just start typing, ESC to exit)
- GitHub-based configuration with YAML
- Multi-layer caching to avoid rate limits
- Responsive grid layout
- Direct links to your services

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

```bash
git clone <your-repo-url>
cd asd
npm install
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Configuration

The service list is stored in `public/config/services.yml` and loaded from GitHub at runtime. Edit this file to add your services:

```yaml
services:
  - id: grafana
    name: Grafana
    description: Monitoring dashboards
    url: https://your-server.com/grafana
    icon: Monitor
    category: monitoring
```

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Check code style
```

This is a standard React + TypeScript + Vite project with Tailwind CSS for styling.