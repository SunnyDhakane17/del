/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'], // Enables dark mode with the 'class' strategy
	content: [
	  './pages/**/*.{js,ts,jsx,tsx}',
	  './components/**/*.{js,ts,jsx,tsx}',
	  './app/**/*.{js,ts,jsx,tsx}',
	  './src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
	  extend: {
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)',
		},
		colors: {
		  background: 'hsl(var(--background))',
		  foreground: 'hsl(var(--foreground))',
		  card: {
			DEFAULT: 'hsl(var(--card))',
			foreground: 'hsl(var(--card-foreground))',
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover))',
			foreground: 'hsl(var(--popover-foreground))',
		  },
		  primary: {
			DEFAULT: 'hsl(var(--primary))',
			foreground: 'hsl(var(--primary-foreground))',
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary))',
			foreground: 'hsl(var(--secondary-foreground))',
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted))',
			foreground: 'hsl(var(--muted-foreground))',
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent))',
			foreground: 'hsl(var(--accent-foreground))',
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive))',
			foreground: 'hsl(var(--destructive-foreground))',
		  },
		  border: 'hsl(var(--border))',
		  input: 'hsl(var(--input))',
		  ring: 'hsl(var(--ring))',
		  chart: {
			1: 'hsl(var(--chart-1))',
			2: 'hsl(var(--chart-2))',
			3: 'hsl(var(--chart-3))',
			4: 'hsl(var(--chart-4))',
			5: 'hsl(var(--chart-5))',
		  },
		},
		spacing: {
		  '128': '32rem',
		  '144': '36rem',
		},
		fontSize: {
		  '2xs': '0.65rem',
		  '3xl': '1.875rem',
		  '4xl': '2.25rem',
		  '5xl': '3rem',
		},
		boxShadow: {
		  card: '0 4px 8px rgba(0, 0, 0, 0.1)',
		  popover: '0 2px 4px rgba(0, 0, 0, 0.1)',
		},
		transitionProperty: {
		  width: 'width',
		  height: 'height',
		  spacing: 'margin, padding',
		},
		zIndex: {
		  '1': 1,
		  '2': 2,
		},
	  },
	},
	plugins: [
	  require('@tailwindcss/typography'), // Provides typography styles for prose content
	  require('tailwindcss-animate'), // Adds utilities for smooth animations
	],
  };
  