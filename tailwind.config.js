/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                background: 'var(--background)',
                surface: 'var(--surface)',
                primary: '#ef4444', // Red-500
                secondary: '#888888',
                accent: '#ef4444', // Red-500
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                marquee: 'marquee 40s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' }, // Move by 50% because we duplicated the list
                }
            }
        },
    },
    plugins: [],
}
