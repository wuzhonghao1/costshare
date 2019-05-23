/* eslint-disable import/no-extraneous-dependencies,no-unused-vars,no-param-reassign */
const { injectBabelPlugin } = require('react-app-rewired')
const rewireLess = require('react-app-rewire-less')

module.exports = function override(config, env) {
  config = injectBabelPlugin(['import', { libraryName: 'antd', style: true }], config)
  config = rewireLess.withLoaderOptions({
    modifyVars: {
      '@primary-color': '#2d3c4f',
      '@form-item-margin-bottom': '12px',
      '@input-height-lg': '26px',
      '@layout-header-background': '#2d3c4f',
      '@menu-dark-submenu-bg': '#666',
    },
  })(config, env)
  return config
}
