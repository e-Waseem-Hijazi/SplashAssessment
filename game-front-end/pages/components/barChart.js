import * as React from "react";
import {Chart} from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import Button from "@mui/material/Button";

ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    BarElement
);
import socketIOClient from "socket.io-client";
import {useEffect, useState} from "react";

export default function BarChart({data}) {
    const socket = socketIOClient('http://localhost:3002/');
    const [chartData, setChartData] = useState({
        datasets: [
            {
                label: 'Secret number',
                data: [{x: 'Secret number', y: data.secretNumber}],
                backgroundColor: '#1976d2',
            }
        ],
    });

    useEffect(() => {
        return () => socket.disconnect();
    }, []);
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Secret number',
            },
            scales: {
                y: {
                    max: 10,
                    min: 0,
                    ticks: {
                        stepSize: 0.1
                    }
                }
            }
        },
    };

    const handleRefreshChart = (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        socket.emit('refresh-secret-number', data.roundId, function (dataFromServer) {
            setChartData(
                {
                    datasets: [
                        {
                            label: 'Secret number',
                            data: [{x: 'Secret number', y: dataFromServer}],
                            backgroundColor: '#1976d2',
                        }
                    ],
                }
            );
        });
    }

    return (
        <div>
            <Chart options={chartOptions} data={chartData} type={"bar"}/>
            <Button variant="outlined" type="button"
                    onClick={handleRefreshChart}>Refresh
            </Button>
        </div>
    );
}