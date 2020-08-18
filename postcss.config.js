const path = require('path')
const { calcSize } = require('@csssr/gpn-utils/lib/css')

// При локальной сборке после изменений в этом конфиге нужно удалить кэш babel-плагина (папка /tmp/bptp-*)
// https://github.com/wbyoung/babel-plugin-transform-postcss#caching

module.exports = ctx => ({
  plugins: [
    require('postcss-functions')({
      functions: {
        'calc-size': function (size) {
          return calcSize(size, isNaN(size))
        },
      },
    }),
    require('postcss-mixins')({
      mixinsFiles: path.join(process.cwd(), 'src/styles/mixins/**/*.css'),
    }),
    require('postcss-nested'),
    require('postcss-preset-env')({
      stage: 2,
      features: {
        autoprefixer: true,
        'custom-selectors': true,
        'nesting-rules': false,
      },
    }),
    /**
     * Отключаем данный плагин для сборки через Webpack так как с его работой
     * справляется `file-loader`.
     */
    !ctx.webpack && require('postcss-url')({
      url: 'inline',
    }),
    /**
     * Отключаем данный плагин для сборки через Webpack так как он конфликтует с
     * системой CSS модулей из `css-loader` и они не могут работать совместно,
     * кроме того отключение его через проверку в контексте наличия ссылки на
     * webpack позволяет исключить проблему неправильной генерации типов для CSS
     * файлов.
     */
    !ctx.webpack && require('postcss-modules')({
      getJSON: ctx.extractModules || (() => { }),
      generateScopedName: '[folder]__[local]--[hash:base64:5]',
    }),
    process.env.NODE_ENV === 'production' &&
      // Из-за cssnano при сборке js класс columns (в компоненте Group барчарта) превращается в column-count (при сборке css всё ок)
      !process.env.BUILDING_JS &&
      require('cssnano')(),
  ],
})
