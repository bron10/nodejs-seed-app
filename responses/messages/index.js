module.exports = {
	ok 					: require('./ok'),
	forbidden 			: require('./forbidden'),
	notFound 			: require('./notFound'),
	serverError 		: require('./serverError'),
    unprocessableEntity : require('./unprocessable-entity'),
    preconditionFailed 	: require('./precondition-failed'),
    largeEntity 		: require('./large-entity'),
    authFailure 		: require('./auth-failure')
}