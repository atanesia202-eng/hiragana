import { useEffect, useMemo, useState } from "react";
import { allCharacters, shuffle } from "@/lib/hiragana";
import { QuizShell, ScoreBar, ResultView, useTimer } from "@/components/QuizShell";

const vocab = [
  { thai: "แมว", hiragana: "ねこ" },
  { thai: "ภูเขา", hiragana: "やま" },
  { thai: "ทะเล", hiragana: "うみ" },
  { thai: "ฟ้า", hiragana: "そら" },
  { thai: "แม่", hiragana: "はは" },
  { thai: "มือ", hiragana: "て" },
  { thai: "หู", hiragana: "みみ" },
  { thai: "จมูก", hiragana: "はな" },
  { thai: "ปลา", hiragana: "さかな" },
  { thai: "ดวงดาว", hiragana: "ほし" },
  { thai: "บ้าน", hiragana: "いえ" },
  { thai: "รถ", hiragana: "くるま" },
  { thai: "แม่น้ำ", hiragana: "かわ" },
  { thai: "ต้นไม้", hiragana: "き" },
  { thai: "ฤดูร้อน", hiragana: "なつ" },
  { thai: "ฤดูหนาว", hiragana: "ふゆ" },
  { thai: "หนังสือ", hiragana: "ほん" },
  { thai: "ป่า", hiragana: "もり" },
  { thai: "กลางวัน", hiragana: "ひる" },
  { thai: "กลางคืน", hiragana: "よる" },
  { thai: "เพื่อน", hiragana: "とも" },
  { thai: "ตอนเช้า", hiragana: "あさ" },
  { thai: "เสือ", hiragana: "とら" },
  { thai: "ลิง", hiragana: "さる" },
  { thai: "นก", hiragana: "とり" },
  { thai: "เก้าอี้", hiragana: "いす" },
  { thai: "เวลา", hiragana: "とき" },
  { thai: "ข้างบน", hiragana: "うえ" },
  { thai: "ข้างล่าง", hiragana: "した" },
  { thai: "หน้า", hiragana: "かお" },
];

const ALL = allCharacters();

export function Level5() {
  const total = 20;
  const queue = useMemo(() => shuffle(vocab).slice(0, total), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: "ok" | "bad"; msg: string } | null>(null);
  const elapsed = useTimer();

  const current = queue[idx];
  const guess = picked.join("");

  const next = () => {
    if (idx + 1 >= total) setDone(true);
    else {
      setIdx(idx + 1);
      setPicked([]);
      setFeedback(null);
    }
  };

  const submit = () => {
    if (feedback) return;
    if (picked.length === 0) {
      setFeedback({ type: "bad", msg: "กรุณาเลือกตัวอักษรก่อน" });
      return;
    }
    const ok = guess === current.hiragana;
    if (ok) setScore((s) => s + 1);
    setFeedback({
      type: ok ? "ok" : "bad",
      msg: ok ? "ถูกต้อง! 🎉" : `ผิด! คำตอบคือ: ${current.hiragana}`,
    });
    setTimeout(next, ok ? 1100 : 1900);
  };

  if (done) {
    return (
      <QuizShell level={5}>
        <ResultView
          level={5}
          score={score}
          total={total}
          seconds={elapsed()}
          onRestart={() => window.location.reload()}
        />
      </QuizShell>
    );
  }

  return (
    <QuizShell level={5}>
      <ScoreBar score={score} current={idx} total={total} />
      <p style={{ color: "var(--text-muted)" }}>คำศัพท์ภาษาไทย — สะกดเป็นฮิรางานะ</p>
      <div className="char-display">{current.thai}</div>

      <div
        style={{
          minHeight: 56,
          padding: 12,
          background: "var(--bg-secondary)",
          borderRadius: 12,
          fontFamily: '"Noto Sans JP", sans-serif',
          fontSize: "2rem",
          letterSpacing: 4,
          marginBottom: 14,
        }}
      >
        {guess || <span style={{ opacity: 0.35, fontSize: "1rem" }}>เลือกตัวอักษรด้านล่าง</span>}
      </div>

      <div className="tool-row">
        <button className="tool-btn" onClick={() => setPicked(picked.slice(0, -1))}>
          ⌫ ลบ
        </button>
        <button className="tool-btn" onClick={() => setPicked([])}>
          🗑 ล้าง
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(46px, 1fr))",
          gap: 6,
          marginBottom: 16,
        }}
      >
        {ALL.map((c) => (
          <button
            key={c}
            className="choice-btn"
            style={{ padding: "10px 4px", fontSize: "1.2rem" }}
            onClick={() => setPicked([...picked, c])}
            disabled={!!feedback}
          >
            {c}
          </button>
        ))}
      </div>

      <button className="submit-btn" onClick={submit} disabled={!!feedback}>
        ✓ ส่งคำตอบ
      </button>
      {feedback && <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>}
    </QuizShell>
  );
}
