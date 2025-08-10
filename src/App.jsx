import Chart from "./components/Chart";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import CryptoSelector from "./components/CryptoSelector";
import "./App.css";

const POPULAR_COINS = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin" },
  { id: "ethereum", symbol: "eth", name: "Ethereum" },
  { id: "ripple", symbol: "xrp", name: "Ripple" },
  { id: "cardano", symbol: "ada", name: "Cardano" },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin" },
  { id: "polkadot", symbol: "dot", name: "Polkadot" },
  { id: "litecoin", symbol: "ltc", name: "Litecoin" },
  { id: "binancecoin", symbol: "bnb", name: "Binancecoin" },
];


export default function App() {
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [timeframe, setTimeframe] = useState("1"); 
  const [isFetching, setIsFetching] = useState(false);

  const fetchCoins = useCallback(async () => {
    if (isFetching) return;
  setLoading(true);
  setError(null);
  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: selectedCoin ? selectedCoin : POPULAR_COINS.map(c => c.id).join(","),
          order: "market_cap_desc",
          per_page: 20,
          page: 1,
          sparkline: false,
        },
      }
    );
    setCoins(res.data);
    setFilteredCoins(res.data);
  } catch (err) {
    setError(err.message || "Failed to fetch");
  } finally {
    setLoading(false);
  }
}, [selectedCoin]);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

 
  useEffect(() => {
    if (refreshInterval) clearInterval(refreshInterval);
    const interval = setInterval(() => {
      fetchCoins();
    }, 30000);
    setRefreshInterval(interval);

    return () => clearInterval(interval);
  }, [fetchCoins]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCoins(coins);
    } else {
      const filtered = coins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoins(filtered);
    }
  }, [searchTerm, coins]);

  return (
    <div className="container">
      <h1>Crypto Price Tracker</h1>

      {/* Search bar */}
      <div className="top-controls">
      <input
        type="text"
        placeholder="Search by coin name or symbol..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <div className="selector-wrapper">
        <CryptoSelector
          options={POPULAR_COINS}
          value={selectedCoin}
          onChange={setSelectedCoin}
          placeholder="Select"
        />
        
      </div>
      <button onClick={fetchCoins} className="refresh-btn">
          Refresh Now
        </button>
      </div>

      {/* Dropdown for coin selection */}
      

      {/* UI states */}
      {loading && <div className="center">Loading...</div>}
      {error && <div className="center error">Error: {error}</div>}
      {!loading && !error && filteredCoins.length === 0 && (
        <div className="center">No data found</div>
      )}

      {!loading && !error && filteredCoins.length > 0 && (
        <>
          <div className="table-wrapper">
            <table className="coin-table">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Price (USD)</th>
                  <th>24h Change</th>
                  <th>Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoins.map((c) => (
                  <tr key={c.id}>
                    <td className="coin-cell">
                      <img src={c.image} alt={c.name} width="24" />{" "}
                      <span>{c.name}</span>
                      <small className="symbol"> {c.symbol.toUpperCase()}</small>
                    </td>
                    <td>${Number(c.current_price).toLocaleString()}</td>
                    <td
                      style={{
                        color:
                          c.price_change_percentage_24h < 0 ? "red" : "green",
                      }}
                    >
                      {c.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    <td>${Number(c.market_cap).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart for selected coin */}
          {selectedCoin ? (
            <div className="chart-section">
              <h2>{selectedCoin.toUpperCase()} Price Chart</h2>
              <div className="timeframe-buttons">
                <button
                  className={timeframe === "1" ? "active" : ""}
                  onClick={() => setTimeframe("1")}
                >
                  1D
                </button>
                <button
                  className={timeframe === "7" ? "active" : ""}
                  onClick={() => setTimeframe("7")}
                >
                  7D
                </button>
                <button
                  className={timeframe === "30" ? "active" : ""}
                  onClick={() => setTimeframe("30")}
                >
                  1M
                </button>
              </div>
              <Chart coinId={selectedCoin} days={timeframe} />
            </div>
          ) : (
            <p className="center">Select a coin to see price trends chart.</p>
          )}
        </>
      )}
    </div>
  );
}
