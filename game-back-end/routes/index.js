const express = require("express");
const router = express.Router();

const dbo = require('../db/connection');
const {ObjectId} = require("mongodb");
router.get("/", (req, res) => {
    res.send({response: "I am alive"}).status(200);
});

//this route is used to get the round results
router.get("/roundResults", (req, res) => {
    const data = req.query;
    if (data) {
        const roundId = data.roundId;
        const gameSessionId = data.gameSessionId;
        const dbConnect = dbo.getDb();
        let roundSecretNumber = null;
        //first we get round information
        dbConnect
            .collection('rounds')
            .findOne({_id: ObjectId(roundId)}, function (err, roundsResult) {
                if (err) {
                    res.status(400).send('Error fetching!');
                } else {
                    roundSecretNumber = roundsResult.secretNumber;
                    //get all players guesses related to this round
                    dbConnect
                        .collection('players_guesses')
                        .find({roundId: roundsResult._id.toString()})
                        .toArray(function (err, guessesResult) {
                            const updatePlayers = new Promise((resolve, reject) => {
                                //updating the players credits according to our roles
                                guessesResult.forEach((element, index, array) => {
                                    dbConnect.collection("players").findOne({_id: element.playerId}, function (err, playersResult) {
                                        if (err) {
                                            res.status(400).send('Error!');
                                        } else {
                                            const cuttedCredit = playersResult.PlayerCredit - 10;
                                            //new credit rule
                                            const newCredit = element.playerGuessedNumber < roundsResult.secretNumber ? (cuttedCredit + (element.playerGuessedNumber * 10)) : (cuttedCredit);
                                            //update the player info
                                            dbConnect.collection("players").updateOne({_id: element.playerId}, {
                                                $set: {
                                                    PlayerCredit: newCredit,
                                                    lastRoundStatus: element.playerGuessedNumber < roundsResult.secretNumber ? "Won" : 'Lost'
                                                }
                                            });
                                            if (index === array.length - 1) resolve();
                                        }
                                    });

                                });
                            });
                            updatePlayers.then(() => {
                                //after updating the players info, we create the new round record
                                let newRoundId = null;
                                dbConnect
                                    .collection('rounds')
                                    .insertOne({secretNumber: generateSecretNumber()}, function (err, roundResult) {
                                        if (err) {
                                            res.status(400).send('Error!');
                                        } else {
                                            newRoundId = roundResult.insertedId.toString();
                                        }
                                    });

                                const query = {gameSessionId: ObjectId(gameSessionId)};
                                //after all, we return the players updated info to show it to the user
                                dbConnect
                                    .collection('players')
                                    .find(query)
                                    .toArray(function (err, resultPlayersGuesses) {
                                        if (err) {
                                            res.status(400).send('Error fetching listings!');
                                        } else {
                                            res.json({
                                                resultData: resultPlayersGuesses,
                                                newRoundId: newRoundId,
                                                secretNumber: roundSecretNumber
                                            });
                                        }
                                    });
                            });
                        });
                }
            });

    }
});

//this route is used to save the player guess
router.post("/playerGuess", (req, res) => {
    const data = req.body;
    if (data) {
        const dbConnect = dbo.getDb();
        let roundId = data.roundId;
        const playerGuessedNumber = data.playerGuessedNumber;
        const gameSessionId = data.gameSessionId;
        //we get all initial players for this round
        const query = {gameSessionId: ObjectId(gameSessionId)};
        dbConnect
            .collection('players')
            .find(query)
            .toArray(function (err, result) {
                if (err) {
                    res.status(400).send('Error fetching listings!');
                } else {
                    const insertPlayersGuesses = new Promise((resolve, reject) => {
                        //add player guesses
                        result.forEach((element, index, array) => {
                            dbConnect
                                .collection('players_guesses')
                                .insertOne({
                                    playerId: element._id,
                                    roundId: roundId,
                                    playerGuessedNumber: (element.type === 'user' ? playerGuessedNumber : generateNumber())
                                }, function (err, resultGameSessions) {
                                    if (err) {
                                        res.status(400).send(err.message);
                                    }
                                });
                            if (index === array.length - 1) resolve();
                        });
                    });
                    insertPlayersGuesses.then(() => {
                        //after all ,return all players guesses to show it to the user
                        dbConnect
                            .collection('players_guesses')
                            .aggregate([
                                {
                                    $lookup:
                                        {
                                            from: 'players',
                                            localField: 'playerId',
                                            foreignField: '_id',
                                            as: 'playerDetails'
                                        }
                                },
                                {
                                    $match: {roundId: roundId}
                                }
                            ])
                            .toArray(function (err, resultPlayersGuesses) {
                                if (err) {
                                    res.status(400).send('Error fetching!');
                                } else {
                                    res.json(resultPlayersGuesses);
                                }
                            });
                    });
                }
            });
    }
});


//this rout is used to the save all the initial information
router.post("/player", (req, res) => {
    const data = req.body;
    if (data) {
        const dbConnect = dbo.getDb();
        //save new game session
        dbConnect
            .collection('game_sessions')
            .insertOne({}, function (err, resultGameSessions) {
                if (err) {
                    res.status(400).send(err.message);
                } else {
                    //save new round
                    dbConnect
                        .collection('rounds')
                        .insertOne({secretNumber: generateSecretNumber()}, function (err, result) {
                            if (err) {
                                res.status(400).send(err.message);
                            } else {
                                const roundId = result.insertedId;
                                //init all the players information
                                const documents = [{
                                    playerName: data.playerName,
                                    PlayerCredit: 100,
                                    type: 'user',
                                    gameSessionId: resultGameSessions.insertedId
                                },
                                    {
                                        playerName: 'anonymous1',
                                        type: 'computer',
                                        PlayerCredit: 100,
                                        gameSessionId: resultGameSessions.insertedId
                                    },
                                    {
                                        playerName: 'anonymous2',
                                        type: 'computer',
                                        PlayerCredit: 100,
                                        gameSessionId: resultGameSessions.insertedId
                                    },
                                    {
                                        playerName: 'anonymous3',
                                        type: 'computer',
                                        PlayerCredit: 100,
                                        gameSessionId: resultGameSessions.insertedId
                                    },
                                    {
                                        playerName: 'anonymous4',
                                        type: 'computer',
                                        PlayerCredit: 100,
                                        gameSessionId: resultGameSessions.insertedId
                                    }
                                ];
                                //save the players
                                dbConnect
                                    .collection('players')
                                    .insertMany(documents, function (err, result) {
                                        if (err) {
                                            res.status(400).send(err.message);
                                        } else {
                                            res.json({roundId: roundId, gameSessionId: resultGameSessions.insertedId});
                                        }
                                    });
                            }
                        });
                }
            });
    } else {
        res.status(400).send('Error!');
    }
});


function generateNumber() {
    return Math.floor(
        Math.random() * (10 - 1) + 1
    )
}

function generateSecretNumber() {
    const range = 10;
    return parseFloat((range * Math.random()).toString()).toFixed(2);
}

module.exports = router;