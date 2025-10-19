import { useState, useRef } from "react";
import "./style/style.css";

const App = () => {
  const [boxes, setBoxes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const caseRef = useRef(null);

  const items = [
    { name: "Tırnak", count: 100, color: "#4caf50" },
    { name: "Ayak", count: 1, color: "#2196f3" },
    { name: "Elmas", count: 99, color: "#9c27b0" },
    { name: "Sıradan", count: 800, color: "#ff9800" },
  ];

  const shuffleArray = (array) =>
    array
      .map((v) => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ v }) => v);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Kutuları oluştur ve karıştır
    let tempBoxes = [];
    items.forEach((item) => {
      for (let i = 0; i < item.count; i++) {
        tempBoxes.push(item);
      }
    });
    tempBoxes = shuffleArray(tempBoxes);
    setBoxes(tempBoxes);

    const itemWidth = 100;
    const gap = 5;
    const centerPosition = 400; // İmleç sol kenarı

    // Kazanan index rastgele
    const winnerIndex = Math.floor(Math.random() * tempBoxes.length);
    const result = tempBoxes[winnerIndex];
    console.log(`🎯 Kazanan item: ${result.name} | Index: ${winnerIndex}`);

    // Ortalamak için translateX
    const translateX = -(winnerIndex * (itemWidth + gap) - centerPosition + itemWidth / 2);

    const caseElement = caseRef.current;
    caseElement.style.transition = "none";
    caseElement.style.transform = `translateX(0px)`;

    setTimeout(() => {
      caseElement.style.transition = "transform 1.5s ease-out";
      caseElement.style.transform = `translateX(${translateX}px)`;
    }, 50);

    setTimeout(() => {
      setIsSpinning(false);
    }, 1600);
  };

  return (
    <div style={{ padding: 20, position: "relative" }}>
      <button onClick={spin} disabled={isSpinning}>
        {isSpinning ? "Dönüyor..." : "Spin Başlat"}
      </button>

      <div className="CaseWrapper">
        <div className="Case" ref={caseRef}>
          {boxes.map((box, i) => (
            <div
              key={i}
              className="CaseItem"
              style={{
                backgroundColor: box.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "14px",
              }}
              title={`${box.name} (${i})`}
            >
              {i}
            </div>
          ))}
        </div>

        {/* İmleç */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 400,
            width: 4,
            height: 100,
            background: "red",
            zIndex: 10,
          }}
        ></div>
      </div>
    </div>
  );
};

export default App;
