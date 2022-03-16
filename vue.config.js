module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/Audiohaven-Sandbox/': '/',
    transpileDependencies: ["vuetify"],
    pages: {
        index: {
            // entry for the page
            entry: 'src/main.js',
            // the source template
            template: 'public/index.html',
            // output as dist/index.html
            filename: 'index.html'
        },
        // Building index.html duplicate as 404.html
        // For GitHub pages issues with SPAs (Single Page Applications)
        four_oh_four: {
            // entry for the page
            entry: 'src/main.js',
            // the source template
            template: 'public/index.html',
            // output as dist/404.html
            filename: '404.html'
        }
    }
}