// src/components/CryptoSelector.jsx

export default function CryptoSelector({ options = [], value, onChange }) {
  return (
    <div style={{ margin: "10px 0" }}>
      <label>
        Pick coin:{" "}
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.symbol ? o.symbol.toUpperCase() : "N/A"})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
