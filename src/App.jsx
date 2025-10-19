import { useState } from "react";
import "./style/style.css";

const App = () => {
  const [boxes, setBoxes] = useState([]); // Kutuları saklayacağız
  const [isSpinning, setIsSpinning] = useState(false);

  // Her item ve sayısı
  const items = [
    { name: "Tırnak", count: 100, color: "#4caf50" },
    { name: "Ayak", count: 1, color: "#2196f3" },
    { name: "Elmas", count: 99, color: "#9c27b0" },
    { name: "Sıradan", count: 800, color: "#ff9800" }
  ];

  // Kutuları karıştırmak için (shuffle)
  const shuffleArray = (array) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // 1000 kutu oluştur
    let tempBoxes = [];

    items.forEach((item) => {
      for (let i = 0; i < item.count; i++) {
        tempBoxes.push(item);
      }
    });
    // Karıştır
    tempBoxes = shuffleArray(tempBoxes);


    // Logla
    const counts = {};
    tempBoxes.forEach((b) => {
      counts[b.name] = (counts[b.name] || 0) + 1;
    });
    setBoxes(tempBoxes);
    setIsSpinning(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={spin} disabled={isSpinning}>
        {isSpinning ? "Oluşturuluyor..." : "1000 Kutu Oluştur"}
      </button>

      <div className="Case">
        {boxes.map((box, i) => (
          <div
            key={i}
            title={box.name}
            style={{
              backgroundColor: box.color,
            }}
            className="CaseItem"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default App;
