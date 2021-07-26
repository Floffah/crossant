const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    purge: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "media", // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                sans: ["Poppins", ...defaultTheme.fontFamily.sans],
            },

            width: {
                fit: "fit-content",
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
