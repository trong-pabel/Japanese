import { useState, useCallback, useEffect, useRef } from "react";

type QuizItem = {
  id: number;
  question: string;
  answer: string;
};

type Props = {
  title: string;
  items: QuizItem[];
  totalQuestions: number;
  onFinish: () => void;
  storageKey?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Question = {
  itemId: number;
  prompt: string;
  options: string[];
  correctIndex: number;
};

type Pools = {
  unseen: Set<number>;
  wrong: Set<number>;
  correct: Set<number>;
};

const WEIGHTS = { unseen: 0.60, wrong: 0.30, correct: 0.10 };
const HISTORY_SIZE = 3;

function weightedPoolPick(pools: Pools, history: number[]): number | null {
  const candidates: Array<{ pool: keyof Pools; weight: number }> = [];
  if (pools.unseen.size > 0) candidates.push({ pool: "unseen", weight: WEIGHTS.unseen });
  if (pools.wrong.size > 0) candidates.push({ pool: "wrong", weight: WEIGHTS.wrong });
  if (pools.correct.size > 0) candidates.push({ pool: "correct", weight: WEIGHTS.correct });

  if (candidates.length === 0) return null;

  // Weighted random pool selection
  const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * totalWeight;
  let chosenPool: keyof Pools = candidates[0].pool;
  for (const c of candidates) {
    r -= c.weight;
    if (r <= 0) { chosenPool = c.pool; break; }
  }

  const poolItems = Array.from(pools[chosenPool]);

  // Anti-repeat: prefer items not in recent history
  const notRecent = poolItems.filter((id) => !history.includes(id));
  const pickFrom = notRecent.length > 0 ? notRecent : poolItems;

  return pickFrom[Math.floor(Math.random() * pickFrom.length)];
}

function generateQuestion(items: QuizItem[], currentItem: QuizItem): Question {
  const showReverse = Math.random() > 0.5;
  const prompt = showReverse ? currentItem.answer : currentItem.question;
  const correctAnswer = showReverse ? currentItem.question : currentItem.answer;

  const pool = items.filter((i) => i.id !== currentItem.id);
  const wrongAnswers = shuffle(pool)
    .slice(0, 3)
    .map((i) => (showReverse ? i.question : i.answer));

  const options = shuffle([correctAnswer, ...wrongAnswers]);
  const correctIndex = options.indexOf(correctAnswer);

  return { itemId: currentItem.id, prompt, options, correctIndex };
}

function loadPools(key: string, items: QuizItem[]): Pools {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data = JSON.parse(raw);
      const allIds = new Set(items.map((i) => i.id));
      const wrong = new Set<number>((data.wrong || []).filter((id: number) => allIds.has(id)));
      const correct = new Set<number>((data.correct || []).filter((id: number) => allIds.has(id)));
      const unseen = new Set<number>();
      for (const id of allIds) {
        if (!wrong.has(id) && !correct.has(id)) unseen.add(id);
      }
      return { unseen, wrong, correct };
    }
  } catch { /* ignore */ }
  return { unseen: new Set(items.map((i) => i.id)), wrong: new Set(), correct: new Set() };
}

function savePools(key: string, pools: Pools) {
  try {
    localStorage.setItem(key, JSON.stringify({
      wrong: Array.from(pools.wrong),
      correct: Array.from(pools.correct),
    }));
  } catch { /* ignore */ }
}

export default function Quiz({ title, items, totalQuestions, onFinish, storageKey }: Props) {
  const [pools, setPools] = useState<Pools>(() => {
    if (storageKey) return loadPools(storageKey, items);
    return { unseen: new Set(items.map((i) => i.id)), wrong: new Set(), correct: new Set() };
  });
  const historyRef = useRef<number[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [totalAsked, setTotalAsked] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const itemMap = useRef(new Map(items.map((i) => [i.id, i])));

  const pickNext = useCallback((currentPools: Pools, answered: number) => {
    if (answered >= totalQuestions) {
      setFinished(true);
      return;
    }
    const nextId = weightedPoolPick(currentPools, historyRef.current);
    if (nextId === null) {
      setFinished(true);
      return;
    }
    const item = itemMap.current.get(nextId)!;
    const q = generateQuestion(items, item);
    historyRef.current = [...historyRef.current.slice(-(HISTORY_SIZE - 1)), nextId];
    setQuestion(q);
    setSelected(null);
  }, [items, totalQuestions]);

  useEffect(() => {
    pickNext(pools, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = useCallback(
    (idx: number) => {
      if (selected !== null || !question) return;
      setSelected(idx);
      const isCorrect = idx === question.correctIndex;
      setTotalAsked((n) => n + 1);
      if (isCorrect) setTotalCorrect((n) => n + 1);

      const newAsked = totalAsked + 1;

      setPools((prev) => {
        const next: Pools = {
          unseen: new Set(prev.unseen),
          wrong: new Set(prev.wrong),
          correct: new Set(prev.correct),
        };
        const id = question.itemId;
        next.unseen.delete(id);
        if (isCorrect) {
          next.wrong.delete(id);
          next.correct.add(id);
        } else {
          next.correct.delete(id);
          next.wrong.add(id);
        }
        if (storageKey) savePools(storageKey, next);

        setTimeout(() => pickNext(next, newAsked), 1200);
        return next;
      });
    },
    [selected, question, pickNext, storageKey]
  );

  const handleFinish = () => {
    if (storageKey) {
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    }
    onFinish();
  };

  const handleRestart = () => {
    const fresh: Pools = { unseen: new Set(items.map((i) => i.id)), wrong: new Set(), correct: new Set() };
    setPools(fresh);
    historyRef.current = [];
    setTotalAsked(0);
    setTotalCorrect(0);
    setFinished(false);
    setSelected(null);
    if (storageKey) savePools(storageKey, fresh);
    pickNext(fresh, 0);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-8 py-12 animate-fade-in">
        <h2 className="font-serif text-3xl font-bold text-foreground">Kết quả</h2>
        <div className="text-center">
          <p className="text-6xl font-bold text-primary font-serif">
            {totalCorrect}/{totalAsked}
          </p>
          <p className="mt-2 text-muted-foreground">câu đúng</p>
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={handleRestart} className="quiz-btn-primary">Làm lại</button>
          <button onClick={handleFinish} className="quiz-btn-secondary">Trang chủ</button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const optionBaseClass =
    "w-full text-left px-6 py-5 rounded-2xl border-2 border-border bg-card shadow-sm " +
    "hover:border-primary hover:bg-muted/70 hover:shadow-md " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
    "active:scale-[0.99] transition-all cursor-pointer flex items-center gap-4 min-h-[110px]";
  const optionCorrectClass =
    "w-full text-left px-6 py-5 rounded-2xl border-2 border-[hsl(var(--correct))] " +
    "bg-[hsl(var(--correct)/0.1)] text-[hsl(var(--correct))] shadow-sm " +
    "flex items-center gap-4 min-h-[110px]";
  const optionIncorrectClass =
    "w-full text-left px-6 py-5 rounded-2xl border-2 border-[hsl(var(--incorrect))] " +
    "bg-[hsl(var(--incorrect)/0.1)] text-[hsl(var(--incorrect))] shadow-sm " +
    "flex items-center gap-4 min-h-[110px]";
  const optionDisabledClass =
    "w-full text-left px-6 py-5 rounded-2xl border-2 border-border bg-card text-muted-foreground " +
    "opacity-55 shadow-sm flex items-center gap-4 min-h-[110px]";

  return (
    <div className="flex flex-col items-center gap-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between w-full max-w-md px-2">
        <h2 className="font-serif text-xl font-bold text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {totalAsked}/{totalQuestions} · Đúng: {totalCorrect}
        </span>
      </div>

      {/* Pool status bar */}
      <div className="flex gap-3 text-xs text-muted-foreground w-full max-w-md px-2">
        <span>🆕 {pools.unseen.size}</span>
        <span>❌ {pools.wrong.size}</span>
        <span>✅ {pools.correct.size}</span>
      </div>

      <div className="mt-4 flex items-center justify-center min-h-[120px]">
        <p
          className={`text-center font-serif font-bold ${
            question.prompt.length <= 3
              ? "text-7xl sm:text-8xl"
              : "text-2xl sm:text-3xl"
          } text-foreground`}
        >
          {question.prompt}
        </p>
      </div>

      {/* Answer cards: 1 column on mobile, 2x2 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mt-6 px-2 sm:px-0">
        {question.options.map((opt, idx) => {
          let cls = optionBaseClass;
          if (selected !== null) {
            if (idx === question.correctIndex) cls = optionCorrectClass;
            else if (idx === selected) cls = optionIncorrectClass;
            else cls = optionDisabledClass;
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={cls}
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-muted text-foreground text-lg font-bold shrink-0">
                {idx + 1}
              </span>
              <span className="flex-1 text-xl sm:text-2xl leading-tight font-semibold">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
