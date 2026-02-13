import { useState } from "react";

type Props = {
  max: number;
  label: string;
  onSubmit: (itemCount: number, totalQuestions: number) => void;
  onBack: () => void;
};

export default function NumberInput({ max, label, onSubmit, onBack }: Props) {
  const [value, setValue] = useState(Math.min(5, max).toString());
  const [totalQ, setTotalQ] = useState("20");

  const itemCount = parseInt(value) || 0;
  const defaultQ = Math.max(20, itemCount);

  const handleSubmit = () => {
    if (itemCount >= 4 && itemCount <= max) {
      const q = parseInt(totalQ) || defaultQ;
      onSubmit(itemCount, Math.max(q, itemCount));
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-12 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold text-foreground text-center">
        {label}
      </h2>
      <div className="flex flex-col gap-4 items-center">
        <div className="flex flex-col items-center gap-1">
          <label className="text-muted-foreground text-sm">Số lượng mục (4–{max})</label>
          <input
            type="number"
            min={4}
            max={max}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-24 text-center text-2xl font-bold border-2 border-border rounded-xl py-3 bg-card text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <label className="text-muted-foreground text-sm">Tổng số câu hỏi</label>
          <input
            type="number"
            min={itemCount || 4}
            value={totalQ}
            onChange={(e) => setTotalQ(e.target.value)}
            className="w-24 text-center text-2xl font-bold border-2 border-border rounded-xl py-3 bg-card text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={handleSubmit} className="quiz-btn-primary">
          Bắt đầu
        </button>
        <button onClick={onBack} className="quiz-btn-secondary">
          Quay lại
        </button>
      </div>
    </div>
  );
}
