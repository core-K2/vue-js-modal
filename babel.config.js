module.exports = function(babel) {
  babel.cache(true)

  return {
    presets: ['@babel/preset-env'],
    plugins: [
      '@babel/plugin-transform-object-rest-spread',
      '@babel/plugin-transform-optional-chaining'
    ]
  }
}
