import React, { useState } from "react";
import Header from "../components/Header.jsx";
import PrayerCard from "../components/PrayerCard.jsx";
import RosaryBeads from "../components/RosaryBeads.jsx";

const classicPrayers = [
  {
    title: "✝ The Lord's Prayer",
    text: "Our Father, who art in heaven, hallowed be Thy name;\nThy kingdom come; Thy will be done on earth as it is in heaven.\nGive us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us;\nand lead us not into temptation, but deliver us from evil. Amen.",
    featured: true
  },
  { title: "Hail Mary", text: "Hail Mary, full of grace, the Lord is with thee;\nblessed art thou among women, and blessed is the fruit of thy womb, Jesus.\nHoly Mary, Mother of God, pray for us sinners,\nnow and at the hour of our death. Amen." },
  { title: "Glory Be (Gloria Patri)", text: "Glory be to the Father, and to the Son, and to the Holy Spirit;\nas it was in the beginning, is now and ever shall be, world without end. Amen." },
  { title: "Apostles' Creed", text: "I believe in God, the Father almighty, Creator of heaven and earth.\nI believe in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried.\nHe descended into hell. On the third day He rose again. He ascended into heaven and is seated at the right hand of God the Father almighty.\nFrom there He will come to judge the living and the dead.\nI believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen." },
  { title: "Serenity Prayer", text: "God, grant me the serenity to accept the things I cannot change,\ncourage to change the things I can,\nand wisdom to know the difference.\nAmen." },
  { title: "Act of Contrition", text: "O my God, I am heartily sorry for having offended Thee,\nand I detest all my sins because I dread the loss of heaven and the pains of hell;\nbut most of all because I have offended Thee, my God,\nwho art all good and deserving of all my love.\nI firmly resolve, with the help of Thy grace,\nto confess my sins, to do penance and to amend my life. Amen." },
  { title: "Guardian Angel Prayer", text: "Angel of God, my guardian dear,\nto whom God's love commits me here,\never this day be at my side,\nto light and guard, to rule and guide. Amen." },
  { title: "Grace Before Meals", text: "Bless us, O Lord, and these Thy gifts,\nwhich we are about to receive from Thy bounty,\nthrough Christ our Lord. Amen." }
];

const dailyPrayers = [
  {
    category: "🌅 Morning",
    title: "Morning Prayer",
    text: "O Lord, I offer Thee this day all my prayers, works, joys and sufferings in union with the Sacred Heart of Jesus.\nGuide my steps today, Lord. Help me to seek Your will in all things, to love with patience and humility, and to serve those You place in my path.\nBless this day and make it fruitful for Your kingdom. Amen."
  },
  {
    category: "🌙 Evening",
    title: "Evening Prayer",
    text: "O my God, thank You for this day.\nForgive me for my failures and sins. Grant me a restful sleep and protect me through the night.\nMay I rise tomorrow renewed in spirit to serve You and Your people. Amen."
  },
  {
    category: "🍽️ Meals",
    title: "Before Meals",
    text: "Bless us, O Lord, and these Thy gifts,\nwhich we are about to receive from Thy bounty,\nthrough Christ our Lord. Amen."
  },
  {
    category: "🛡️ Protection",
    title: "Protection Prayer",
    text: "Lord God, send Your angel to watch over me and all those in my care this day.\nProtect us from harm, guide us away from temptation, and keep us safe in Your love. Amen."
  },
  {
    category: "❤️ Forgiveness",
    title: "Forgiveness Prayer",
    text: "Merciful God, I come before You with a humble and contrite heart.\nForgive me for the sins I have committed in thought, word, deed, and omission.\nHelp me to forgive others as You have forgiven me, and renew a right spirit within me. Amen."
  }
];

const devotionalVerses = [
  { verse: '"The Lord is my shepherd; I shall not want." — Psalm 23:1', reflection: "Where do I need to trust God's guidance today?" },
  { verse: '"I can do all things through Christ who strengthens me." — Philippians 4:13', reflection: "What challenge do I need Christ's strength for today?" },
  { verse: '"Be still and know that I am God." — Psalm 46:10', reflection: "Where am I too anxious? Can I surrender this to God?" },
  { verse: '"Love one another as I have loved you." — John 15:12', reflection: "Who can I show Christ's love to today?" },
  { verse: '"The harvest is plentiful but the workers are few." — Matthew 9:37', reflection: "How am I responding to God's call in my ministry?" }
];

const getTodayDevotional = () => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return devotionalVerses[dayOfYear % devotionalVerses.length];
};

const PrayersPage = () => {
  const [activeCategory, setActiveCategory] = useState("classic");
  const devotional = getTodayDevotional();

  const categories = [
    { key: "classic", label: "Classic Prayers" },
    { key: "daily", label: "Daily Prayers" },
    { key: "rosary", label: "🕊 Rosary" }
  ];

  return (
    <div className="min-h-screen bg-parchment">
      <Header date={new Date()} />
      <div className="mx-auto max-w-[640px] px-3 py-4 space-y-3 animate-fadeIn">

        {/* Today's Devotional */}
        <div className="bg-gradient-to-br from-burgundy to-burgundy-light rounded-2xl px-5 py-5 text-ivory shadow-nav">
          <div className="text-gold/80 text-xs uppercase tracking-widest font-semibold mb-3">
            ✦ Today's Devotional ✦
          </div>
          <p className="font-serif italic text-ivory/90 text-[15px] leading-relaxed mb-3">
            {devotional.verse}
          </p>
          <div className="border-t border-ivory/20 pt-3">
            <div className="text-gold/70 text-[10px] uppercase tracking-wider mb-1">Reflection</div>
            <p className="text-ivory/80 text-sm">{devotional.reflection}</p>
          </div>
          <div className="mt-3">
            <p className="text-ivory/70 text-sm italic font-serif">
              Good Shepherd, lead me today in Your paths of righteousness. Amen.
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="bg-ivory rounded-2xl shadow-soft border border-parchment-dark/30 p-1.5 flex gap-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                ${activeCategory === cat.key
                  ? "bg-burgundy text-ivory shadow-soft"
                  : "text-texts hover:text-textp hover:bg-parchment"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Classic Prayers */}
        {activeCategory === "classic" && (
          <div className="space-y-2 animate-fadeIn">
            {classicPrayers.map((p) => (
              <PrayerCard key={p.title} title={p.title} text={p.text} featured={p.featured} />
            ))}
          </div>
        )}

        {/* Daily Prayers */}
        {activeCategory === "daily" && (
          <div className="space-y-2 animate-fadeIn">
            {dailyPrayers.map((p) => (
              <div key={p.title} className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/40 overflow-hidden">
                <div className="bg-gradient-to-r from-parchment to-ivory px-5 py-3 border-b border-parchment-dark/30">
                  <div className="text-[10px] font-semibold text-texts uppercase tracking-widest">{p.category}</div>
                  <div className="font-serif text-burgundy text-sm font-semibold mt-0.5">{p.title}</div>
                </div>
                <div className="px-5 py-4">
                  <p className="text-textp text-[14px] leading-[1.9] font-serif italic whitespace-pre-line">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rosary */}
        {activeCategory === "rosary" && (
          <div className="animate-fadeIn">
            <RosaryBeads />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayersPage;
