module.exports = {
  presets: ['@babel/preset-env'],
  env: {
    "production": {
      "plugins": ["transform-remove-console"]
    }
  }
}
