# Forum Project Guidelines

## Development Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Code Style Guidelines

### Imports
- Group imports by type: React, third-party packages, local components, types, utils
- Use aliases with `@/` prefix (e.g., `@/components/ui/button`)
- Import statement order: React, external libraries, internal components, styles

### Components
- Use function components with TypeScript interfaces for props
- Mark client components with "use client" directive when needed
- Prefer named exports over default exports
- Use separate files for complex components

### Naming
- PascalCase for components and types (`LightboxImage`, `ButtonProps`)
- camelCase for variables, functions, and instances
- Use descriptive, semantic names

### TypeScript
- Define interfaces for component props
- Use type annotations for function parameters and returns
- Prefer optional chaining (`?.`) and nullish coalescing (`??`)

### CSS
- Use Tailwind CSS for styling
- Follow utility-first approach
- Extract common patterns to custom components or utilities
- Use `className` prop with template literals or `cn()` utility for conditionals

### State Management
- Use React hooks for local state
- Follow unidirectional data flow patterns