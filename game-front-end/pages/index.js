import styles from '../styles/Home.module.css'
import React from "react";
import {useRouter} from 'next/router';
import Button from '@mui/material/Button';

export default function Home() {
    const router = useRouter();
    const onSubmitHandler = (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        fetch('http://localhost:3002/player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({playerName: event.target.PlayerName.value})
        })
            .then((res) => {
                const data = res.json();
                data.then(data => {
                    router.push({
                        pathname: '/fillGuessedNumber',
                        query: {
                            roundId: data.roundId,
                            playerName: event.target.PlayerName.value,
                            gameSessionId: data.gameSessionId
                        }
                    });
                });
            })
            .catch((err) => {
                console.log(err.message);
            });
    }
    return (
        <div>
            <h1 className={styles.title}>
                Welcome to <a href="#">Splash Game!</a>
            </h1>
            <form onSubmit={onSubmitHandler}>
                <label className={styles.description} htmlFor="PlayerName">Your name</label>
                <input
                    type="text"
                    id="PlayerName"
                    name="PlayerName"
                    required
                    minLength="4"
                    maxLength="20"
                />
                <Button variant="contained" type="submit">Start Game</Button>
            </form>
        </div>
    )
}
