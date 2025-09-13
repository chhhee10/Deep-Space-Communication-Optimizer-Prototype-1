import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TransmissionChart = ({ history }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Transmission History',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels: history.map((_, index) => `T${index + 1}`),
    datasets: [
      {
        label: 'Packet Size (bytes)',
        data: history.map(h => h.size),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        label: 'Transmission Time (s)',
        data: history.map(h => h.transmission_time),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
      },
    ],
  };

  return (
    <div className="transmission-chart">
      <h3>Transmission Visualization</h3>
      {history.length === 0 ? (
        <p>No transmission data available</p>
      ) : (
        <Line options={options} data={data} />
      )}
    </div>
  );
};

export default TransmissionChart;