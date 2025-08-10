// src/components/Chart.jsx
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function Chart({ coinId, days }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coinId) return;

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
        );
        const data = await res.json();

        // Format data for chart.js
        const prices = data.prices.map(([timestamp, price]) => ({
          x: timestamp,
          y: price,
        }));

        setChartData({
          datasets: [
            {
              label: `${coinId.toUpperCase()} Price (USD)`,
              data: prices,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        });
      } catch (err) {
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [coinId, days]);

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!chartData) return null;

  return (
    <div style={{ maxWidth: "700px", margin: "auto", width: "100%", height: "400px" }}>
      <Line
        options={{
          responsive: true,
          maintainAspectRatio: false,  // Prevent resizing issues
          scales: {
            x: {
              type: "time",
              time: {
                unit: days === "1" ? "hour" : "day",
                tooltipFormat: "PP p",
              },
            },
            y: {
              beginAtZero: false,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
          },
        }}
        data={chartData}
        height={400}  // Explicit height to match container
      />
    </div>
  );
}
