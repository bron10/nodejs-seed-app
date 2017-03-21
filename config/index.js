var basePath = "../config/";

module.exports = {
    local: require(basePath + "local"),
    development: require(basePath + "development"),
    staging: require(basePath + "staging"),
    production: require(basePath + "production"),
    connections: require(basePath + "connections"),
    constants: require(basePath + "constants"),
    session : require(basePath + "session")
}
