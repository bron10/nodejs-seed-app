module.exports = {
    development: {
        main: {
            charset: "UTF8_GENERAL_CI",
            timezone: "0000",
            connectTimeout: 10000,
            connectionLimit: 100,

            host: "127.0.0.1",
            user: "root",
            password: "root",
            database : "node-app",
            port : 8889
        },
        read:[{
            charset: "UTF8_GENERAL_CI",
            timezone: "0000",
            connectTimeout: 10000,
            connectionLimit: 100,
            host: "127.0.0.1",
            user: "root",
            password: "root",
            database : "node-app",
            port : 8889
        }]
    },
    staging: {
        main: {},
        read:[]
    },
    production: {
        main: {},
        read: []
    },
    mongo : {
        development : {
         db              : 'freedomtix',
         credentials     : null,
         hosts           : ['localhost:27017'],
         options         : {}
        }
    }
};
