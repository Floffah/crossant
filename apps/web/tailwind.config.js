const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
    mode: "jit",
    important: true,
    darkMode: "class",
    i18n: {
        locales: ["en-US"],
        defaultLocale: "en-US",
    },
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        // "./src/styles/**/*.{css,less,sass,scss}",
    ],
    theme: {
        extend: {
            colors: {
                // gray: {
                //     ...colors.blueGray,
                //     350: "#bdcad9",
                //     950: "#090c13", //"#07090f",
                // },
            },

            fontFamily: {
                sans: ["Poppins", ...defaultTheme.fontFamily.sans],
            },
            fontSize: {
                "2:5xl": "1.688rem",
            },

            width: {
                fit: "fit-content",
                0.25: "0.0625rem",
                30: "7.5rem",
                38: "9.5rem",
            },
            height: {
                fit: "fit-content",
                0.25: "0.0625rem",
                30: "7.5rem",
                38: "9.5rem",
            },
            margin: {
                0.25: "0.0625rem",
                1.25: "0.3125rem",
            },
            borderWidth: {
                7: "7px",
            },

            backdropBlur: {
                xs: "2px",
            },

            verticalAlign: {
                4: "1rem",
            },
            gridAutoFlow: {
                dense: "dense",
            },
        },
    },
    variants: {
        extend: {
            backgroundColor: ["checked"],
            borderColor: ["checked"],
            inset: ["checked"],
            zIndex: ["hover", "active"],
        },
    },
    plugins: [],
    future: {
        purgeLayersByDefault: true,
    },
};
