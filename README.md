# Vetodiag Pass

A modern web application built with Next.js 14+, TypeScript, Tailwind CSS, and best practices.

## Features

- ⚡ **Next.js 14+** with App Router for optimal performance
- 🔷 **TypeScript** with strict mode enabled for type safety
- 🎨 **Tailwind CSS** for utility-first styling
- 📦 **ESLint** configured with Next.js recommended rules
- 💅 **Prettier** for consistent code formatting
- 🧩 **Example Components** demonstrating best practices
- 📁 **Organized Structure** following Next.js conventions

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- npm, yarn, or pnpm package manager

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
vetodiag-pass/
├── app/                    # App Router directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── Header.tsx        # Header component
│   └── Footer.tsx        # Footer component
├── lib/                  # Utility functions
│   └── utils.ts         # Helper functions (e.g., cn())
├── public/              # Static assets
├── types/               # TypeScript type definitions
└── ...config files      # Configuration files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Technologies Used

- **Next.js** - React framework for production
- **TypeScript** - Typed JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Development

### Adding New Components

Create new components in the `components/` directory. For reusable UI components, use the `components/ui/` subdirectory.

### Styling

This project uses Tailwind CSS. You can customize the theme in `tailwind.config.ts`.

### TypeScript

TypeScript is configured with strict mode. Make sure to add proper types for all your code.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is private and proprietary.

