module.exports = require("next-transpile-modules")(["crypto-random-string"])({
    reactStrictMode: true,
    future: {
        modern: true,
    },
    webpack5: true,
    images: {
        domains: ["twemoji.maxcdn.com"],
    },
});
