/**
 * @apiDefine NotFoundError
 *
 * @apiError NotFound This api doesnt exists.
 *
 * @apiErrorExample Not Found
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Api does not exist"
 *     }
 */

module.exports = {
    status_code: 404,
    company : {
        info : {
            message : "company info missing"
        }
    }
}
