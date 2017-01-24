exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL 
                      //  ||
                      // 'mongodb://localhost/blog-app-mongoose-challenge-solution';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
exports.PORT = process.env.PORT || 8080;
