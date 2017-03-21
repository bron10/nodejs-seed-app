

var connection = appServices.adaptors.connection;
var models = {}
module.exports = models;

models.logs            = require('./logs');
models.global = {
  ping : connection.ping
}
