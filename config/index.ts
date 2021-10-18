const envConfig = require('./app.' + process.env.NODE_ENV + '.ts')
export default {
  ...envConfig.default
}
