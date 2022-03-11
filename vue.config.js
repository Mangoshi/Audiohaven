const Dotenv = require('dotenv-webpack');

module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/dist/': '/',
    "transpileDependencies": [
        "vuetify"
    ],
    configureWebpack: {
        plugins: [
            new Dotenv()
        ]
    }
}