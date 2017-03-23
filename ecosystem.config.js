module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // First application
    {
      name      : "API",
      script    : "app.js",
      ignore_watch : ['node_modules', 'temp', 'log'],
      watch   : true,
      // watch_options: {
      //   "followSymlinks": false
      // },
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "development"
      }
    }
  ]
}
