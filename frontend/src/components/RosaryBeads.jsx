import React, { useMemo, useState } from "react";

const mysteries = {
  Joyful: ["Annunciation", "Visitation", "Nativity", "Presentation", "Finding in the Temple"],
  Sorrowful: ["Agony in the Garden", "Scourging", "Crowning with Thorns", "Carrying the Cross", "Crucifixion"],
  Glorious: ["Resurrection", "Ascension", "Descent of the Holy Spirit", "Assumption", "Coronation of Mary"],
  Luminous: ["Baptism in the Jordan", "Wedding at Cana", "Proclamation of the Kingdom", "Transfiguration", "Institution of the Eucharist"]
};

const buildBeads = () => {
  const beads = [];
  for (let d = 0; d < 5; d++) {
    beads.push({ type: "ourFather", decade: d });
    for (let i = 0; i < 10; i++) beads.push({ type: "hailMary", decade: d, index: i });
    beads.push({ type: "gloryBe", decade: d });
  }
  return beads;
};

const prayers = {
  ourFather: "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  hailMary: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  gloryBe: "Glory be to the Father, and to the Son, and to the Holy Spirit; as it was in the beginning, is now and ever shall be, world without end. Amen."
};

const beadLabels = { ourFather: "Our Father", hailMary: "Hail Mary", gloryBe: "Glory Be" };
const beadColors = {
  ourFather: "bg-burgundy border-burgundy",
  hailMary: "bg-parchment border-parchment-dark",
  gloryBe: "bg-gold/30 border-gold"
};

const RosaryBeads = () => {
  const [current, setCurrent] = useState(0);
  const [mystery, setMystery] = useState("Joyful");
  const beads = useMemo(() => buildBeads(), []);
  const total = beads.length;
  const bead = beads[current] || {};
  const decade = (bead.decade || 0) + 1;
  const hmIndex = typeof bead.index === "number" ? bead.index + 1 : 0;
  const progress = Math.round((current / (total - 1)) * 100);

  const next = () => { if (current + 1 < total) setCurrent(current + 1); };
  const reset = () => setCurrent(0);

  return (
    <div className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/40 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-parchment to-ivory px-5 py-3 border-b border-parchment-dark/30 flex items-center justify-between">
        <div>
          <div className="font-serif text-burgundy text-sm font-semibold">🕊 Rosary Tracker</div>
          <div className="text-texts text-xs mt-0.5">Decade {decade} of 5</div>
        </div>
        <select
          value={mystery}
          onChange={(e) => setMystery(e.target.value)}
          className="border border-parchment-dark rounded-xl px-3 py-1.5 text-xs bg-parchment focus:border-gold transition-all"
        >
          {Object.keys(mysteries).map(k => <option key={k}>{k}</option>)}
        </select>
      </div>

      <div className="px-5 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-texts mb-1">
            <span>{beadLabels[bead.type] || ""}{bead.type === "hailMary" ? ` ${hmIndex}/10` : ""}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-1.5 bg-parchment rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-burgundy to-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Beads visual — grouped by decade */}
        <div className="space-y-2 mb-4">
          {[0, 1, 2, 3, 4].map(d => {
            const decadeBeads = beads.filter(b => b.decade === d);
            return (
              <div key={d} className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] text-texts w-14 text-right mr-1">Dec. {d + 1}</span>
                {decadeBeads.map((b, idx) => {
                  const globalIdx = beads.indexOf(b);
                  const isActive = globalIdx === current;
                  const isDone = globalIdx < current;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrent(globalIdx)}
                      className={`rounded-full border-2 transition-all duration-200
                        ${b.type === "ourFather" ? "w-4 h-4" : b.type === "gloryBe" ? "w-3.5 h-3.5" : "w-3 h-3"}
                        ${isActive ? "bg-gold border-gold scale-125 shadow-glow" :
                          isDone ? "bg-burgundy/60 border-burgundy/50" :
                          beadColors[b.type]}
                      `}
                      title={beadLabels[b.type]}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Current prayer text */}
        <div className="bg-parchment rounded-xl px-4 py-3 mb-4 border border-parchment-dark/30">
          <div className="text-xs font-semibold text-burgundy mb-1">{beadLabels[bead.type]}</div>
          <p className="text-textp text-[13px] leading-relaxed italic font-serif">
            {prayers[bead.type] || ""}
          </p>
        </div>

        {/* Mystery meditation */}
        <div className="bg-burgundy/5 rounded-xl px-4 py-2.5 mb-4 border border-burgundy/10">
          <div className="text-[10px] font-semibold text-texts uppercase tracking-wider">Meditation</div>
          <div className="text-sm text-burgundy font-serif mt-0.5">
            {mysteries[mystery][Math.min(decade - 1, 4)]}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={next}
            disabled={current >= total - 1}
            className="flex-1 px-4 py-2.5 bg-burgundy hover:bg-burgundy-dark text-ivory text-sm font-medium rounded-xl
              transition-all hover:-translate-y-0.5 hover:shadow-nav disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            Next Bead →
          </button>
          <button
            onClick={reset}
            className="px-4 py-2.5 bg-parchment border border-parchment-dark hover:bg-parchment-dark text-textp text-sm rounded-xl transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default RosaryBeads;
