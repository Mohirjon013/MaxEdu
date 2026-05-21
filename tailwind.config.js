/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    corePlugins: {
        preflight: false,  // ← BU QATOR. Shu yo'q bo'lsa MUI buziladi
    },
    theme: {
        extend: {},
    },
    plugins: [],
};