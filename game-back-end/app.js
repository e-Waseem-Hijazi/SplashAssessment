const express = require("express");
const http = require("http");
const dbo = require('./db/connection');

const port = 3002;
const index = require("./routes/index");
const {ObjectId} = require("mongodb");

const app = express();
app.use(express.json());
app.use(index);

const server = http.createServer(app);

const io = require("socket.io")(server, {cors: {origin: '*'}});

//listen to socket connection
io.on("connection", (socket) => {
    //refresh the secret number for the graph by round id
    socket.on('refresh-secret-number', function (data, callback) {
        console.log(data)
        if (data) {
            const dbConnect = dbo.getDb();
            //get round and return the secret number
            dbConnect
                .collection('rounds')
                .findOne({_id: ObjectId(data)}, function (err, roundsResult) {
                    if (err) {
                        return callback('your data is not okay mate!');
                    } else {
                        return callback(roundsResult.secretNumber);
                    }
                });
        }
    });
});

// perform a database connection when the server starts
dbo.connectToServer(function (err) {
    if (err) {
        console.error(err);
        process.exit();
    }
    // start the Express server
    server.listen(port, () => console.log(`Listening on port ${port}`));
});