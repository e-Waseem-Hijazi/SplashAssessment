import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import {useRouter} from "next/router";
import Grid from '@mui/material/Grid';
import BarChart from "./components/barChart";
import CircularProgress from '@mui/material/CircularProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Chip from '@mui/material/Chip';

function RoundResults({data}) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(10);
    useEffect(() => {
        if (timeLeft === 0) {
            setTimeLeft(null)
        }
        // exit early when we reach 0
        if (!timeLeft) return;
        // save intervalId to clear the interval when the
        // component re-renders
        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        // clear interval on re-render to avoid memory leaks
        return () => {
            clearInterval(intervalId);
        };
    });

    const handleNextRound = (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        router.push({
            pathname: '/fillGuessedNumber',
            query: {
                roundId: data.newRoundId,
                gameSessionId: router.query.gameSessionId
            }
        });
    }

    const handleStartOver = (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        router.push('/');
    }
    return (
        <Grid container spacing={8}>
            <Grid item xs={8}>
                <h1>Round results</h1>
                <List>
                    {data.resultData.map(player => {
                        return (
                            <ListItem>
                                <ListItemIcon>
                                    <AccountCircleIcon/>
                                </ListItemIcon>
                                <ListItemText primary={player.playerName} secondary={'Credit: ' + player.PlayerCredit}/>
                                <Chip label={player.lastRoundStatus}
                                      color={player.lastRoundStatus === 'Lost' ? 'warning' : 'success'}/>
                            </ListItem>
                        );
                    })}
                </List>

            </Grid>
            <Grid item xs={4}>
                <BarChart data={{secretNumber: data.secretNumber, roundId: router.query.roundId}}/>
            </Grid>
            <Grid container item xs={12} justifyContent="center" direction="flex">
                {data &&
                <Button hidden={!data} disabled={timeLeft} variant="contained" type="button"
                        onClick={handleNextRound}>go to next Round
                </Button>
                }
                {timeLeft &&
                <div> in {timeLeft} sec . <CircularProgress size={22}/></div>
                }
            </Grid>
            <Grid container item xs={12} paddingTop={10} justifyContent="center" direction="flex">
                or
            </Grid>
            <Grid container item xs={12} justifyContent="center" direction="flex">
                <Button hidden={!data} variant="outlined" type="button"
                        onClick={handleStartOver}>Start over
                </Button>
            </Grid>
        </Grid>
    );
}

// This gets called on every request
export async function getServerSideProps(context) {
    const query = context.query;
    // Fetch data from external API
    const res = await fetch('http://localhost:3002/roundResults?roundId=' + query.roundId + '&gameSessionId=' + query.gameSessionId);
    const data = await res.json();
    return {
        props: {data}
    }
}

export default RoundResults
