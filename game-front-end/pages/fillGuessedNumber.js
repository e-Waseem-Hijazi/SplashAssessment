import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, {useEffect, useState} from "react";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:3002/";
import {useRouter} from 'next/router';
import Button from '@mui/material/Button';
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from "@mui/material/Grid";

export default function FillGuessedNumber() {
    const [guessesData, setGuessesData] = useState(null);
    const router = useRouter();
    const data = router.query;
    const handleCheckTheWinner = (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        router.push({
            pathname: '/roundResults',
            query: {
                roundId: data.roundId,
                gameSessionId: data.gameSessionId
            }
        });
    }
    const onSubmitHandler = (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        fetch('http://localhost:3002/playerGuess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerGuessedNumber: event.target.guessedNumber.value,
                roundId: data.roundId,
                gameSessionId: data.gameSessionId
            })
        }).then((res) => {
            const data = res.json();
            data.then(data => {
                setGuessesData(data);
            });
        })
            .catch((err) => {
                console.log(err.message);
            });
    }
    return (
        <div>
            <Box>
                <form onSubmit={onSubmitHandler}>
                    <label className={styles.description} htmlFor="guessedNumber">Guess a number</label>
                    <input
                        type="number"
                        id="guessedNumber"
                        name="guessedNumber"
                        required
                        maxLength="2"
                        disabled={guessesData}
                    />
                    <Button variant="contained" type="submit" disabled={guessesData}>Submit</Button>
                </form>
            </Box>
            {guessesData &&
            <Box>
                <Alert severity="info">
                    <AlertTitle>Info</AlertTitle>
                    Here all the numbers that have been guessed by other players — <strong>check them out!</strong>
                </Alert>
                <List sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}>
                    {guessesData.map(guess => {
                        return (
                            <ListItem>
                                <ListItemText primary={guess.playerDetails[0].playerName}
                                              secondary={'Guessed number is :' + guess.playerGuessedNumber + ' and Current credit is : ' + guess.playerDetails[0].PlayerCredit}/>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            }
            {guessesData &&
            <Grid container item xs={12} justifyContent="center" direction="row">
                <Button hidden={!guessesData} variant="contained" type="button" onClick={handleCheckTheWinner}>Check
                    round results</Button>
            </Grid>
            }
        </div>
    )
}