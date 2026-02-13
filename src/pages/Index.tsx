import { useState } from "react";
import NumberInput from "@/components/NumberInput";
import Quiz from "@/components/Quiz";
import { kanjiData } from "@/data/kanjiData";
import { vocabularyData } from "@/data/vocabulary";

type Screen = "home" | "kanji-setup" | "kanji-quiz" | "vocab-setup" | "vocab-quiz";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [count, setCount] = useState(5);
  const [totalQ, setTotalQ] = useState(20);

  if (screen === "home") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
            日本語
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Học tiếng Nhật mỗi ngày
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <button
            onClick={() => setScreen("kanji-setup")}
            className="home-card group"
          >
            <span className="text-5xl font-serif block mb-2 group-hover:scale-110 transition-transform">漢字</span>
            <span className="text-lg font-medium">Kanji</span>
            <span className="text-sm text-muted-foreground">{kanjiData.length} chữ</span>
          </button>
          <button
            onClick={() => setScreen("vocab-setup")}
            className="home-card group"
          >
            <span className="text-5xl font-serif block mb-2 group-hover:scale-110 transition-transform">言葉</span>
            <span className="text-lg font-medium">Từ vựng</span>
            <span className="text-sm text-muted-foreground">{vocabularyData.length} từ</span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "kanji-setup") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <NumberInput
          max={kanjiData.length}
          label="Bạn muốn học bao nhiêu Kanji?"
          onSubmit={(n, q) => { setCount(n); setTotalQ(q); setScreen("kanji-quiz"); }}
          onBack={() => setScreen("home")}
        />
      </div>
    );
  }

  if (screen === "kanji-quiz") {
    const items = kanjiData.slice(0, count).map((k) => ({
      id: k.id,
      question: k.kanji,
      answer: k.info,
    }));
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Quiz title="Kanji" items={items} totalQuestions={totalQ} onFinish={() => setScreen("home")} storageKey={`kanji-${count}`} />
      </div>
    );
  }

  if (screen === "vocab-setup") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <NumberInput
          max={vocabularyData.length}
          label="Bạn muốn học bao nhiêu từ vựng?"
          onSubmit={(n, q) => { setCount(n); setTotalQ(q); setScreen("vocab-quiz"); }}
          onBack={() => setScreen("home")}
        />
      </div>
    );
  }

  // vocab-quiz
  const items = vocabularyData.slice(0, count).map((v) => ({
    id: v.id,
    question: v.word,
    answer: v.meaning,
  }));
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Quiz title="Từ vựng" items={items} totalQuestions={totalQ} onFinish={() => setScreen("home")} storageKey={`vocab-${count}`} />
    </div>
  );
};

export default Index;
