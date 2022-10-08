const {MongoClient} = require('mongodb');
const connectionString = "mongodb://localhost:27017/splash_game";
const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
let dbConnection;
module.exports = {
    connectToServer: function (callback) {
        client.connect(function (err, db) {
            if (err || !db) {
                return callback(err);
            }
            dbConnection = db.db('splash_game');
            return callback();
        });
    },
    getDb: function () {
        return dbConnection;
    },
};