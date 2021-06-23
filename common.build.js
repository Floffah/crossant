const dev = process.argv.includes("--watch") || process.argv.includes("--dev");

module.exports = {
    bundle: true,
    target: "node16",
    platform: "node",
    watch: dev,
    color: true,
    logLevel: "info",
    minify: !dev,
    minifyIdentifiers: !dev,
    minifySyntax: !dev,
    minifyWhitespace: !dev,
    format: "cjs",
    sourcemap: dev,
};
