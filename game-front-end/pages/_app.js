import '../styles/globals.css'
import styles from "../styles/Home.module.css";
import React from "react";
import Head from "next/head";

function MyApp({Component, pageProps}) {
    return (

        <div className={styles.container}>
            <Head>
                <title>Splash Game</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main}>
                <Component {...pageProps} />
            </main>
            <footer className={styles.footer}>
                Powered by Wasim Hejazi
            </footer>
        </div>
    )
}

export default MyApp
