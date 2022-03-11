module.exports = {
  // using @vue/babel-preset-app instead of @babel/preset-env,
  // since preset-env is included in babel-preset-app
  // https://cli.vuejs.org/config/#babel
  presets: ['@vue/babel-preset-app'],
  env: {
    "production": {
      "plugins": ["transform-remove-console"]
    }
  }
}
