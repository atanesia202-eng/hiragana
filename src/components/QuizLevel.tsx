import { useEffect, useMemo, useState } from "react";
import {
  allCharacters,
  generateChoices,
  getRomaji,
  playSound,
  shuffle,
  checkRomaji,
} from "@/lib/hiragana";
import { QuizShell, ScoreBar, ResultView, useTimer } from "@/components/QuizShell";

type Mode = "choice3" | "choice6" | "type-hint" | "type-bare";

export function QuizLevel({
  level,
  mode,
}: {
  level: 1 | 2 | 3 | 4;
  mode: Mode;
}) {
  const total = 46;
  const queue = useMemo(() => shuffle(allCharacters()).slice(0, total), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ type: "ok" | "bad"; msg: string } | null>(null);
  const elapsed = useTimer();

  const current = queue[idx];
  const correct = getRomaji(current);
  const choices = useMemo(() => {
    if (mode === "choice3") return generateChoices(current, 3, true);
    if (mode === "choice6") return generateChoices(current, 6, true);
    return [];
  }, [current, mode]);

  const next = () => {
    if (idx + 1 >= total) {
      setDone(true);
    } else {
      setIdx(idx + 1);
      setPicked(null);
      setInput("");
      setFeedback(null);
    }
  };

  const submitChoice = (c: string) => {
    if (picked) return;
    setPicked(c);
    const ok = c === correct;
    if (ok) setScore((s) => s + 1);
    setFeedback({
      type: ok ? "ok" : "bad",
      msg: ok ? "ถูกต้อง! 🎉" : `ผิด! คำตอบที่ถูกคือ: ${correct}`,
    });
    setTimeout(next, ok ? 900 : 1600);
  };

  const submitInput = () => {
    if (feedback) return;
    if (!input.trim()) {
      setFeedback({ type: "bad", msg: "กรุณาพิมพ์คำตอบ" });
      return;
    }
    const ok = checkRomaji(input, correct);
    if (ok) setScore((s) => s + 1);
    setFeedback({
      type: ok ? "ok" : "bad",
      msg: ok ? "ถูกต้อง! 🎉" : `ผิด! คำตอบคือ: ${correct}`,
    });
    setTimeout(next, ok ? 900 : 1600);
  };


  if (done) {
    return (
      <QuizShell level={level}>
        <ResultView
          level={level}
          score={score}
          total={total}
          seconds={elapsed()}
          onRestart={() => window.location.reload()}
        />
      </QuizShell>
    );
  }

  const showHint = mode === "type-hint";
  const isType = mode === "type-hint" || mode === "type-bare";

  return (
    <QuizShell level={level}>
      <ScoreBar score={score} current={idx} total={total} />
      <div className="char-display">{current}</div>

      {(mode === "choice3" || mode === "type-hint") && (
        <button className="tool-btn" onClick={() => playSound(current)}>
          🔊 เล่นเสียง
        </button>
      )}

      {showHint && (
        <div className="hint" style={{ marginTop: 14 }}>
          💡 คำใบ้: <b>{correct.charAt(0).toUpperCase()}</b> — พิมพ์คำตอบเป็นโรมาจิ
        </div>
      )}

      {!isType && (
        <div className="choices">
          {choices.map((c) => {
            let cls = "choice-btn";
            if (picked) {
              if (c === correct) cls += " correct";
              else if (c === picked) cls += " incorrect";
            }
            return (
              <button
                key={c}
                className={cls}
                disabled={!!picked}
                onClick={() => submitChoice(c)}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {isType && (
        <div style={{ marginTop: 14 }}>
          <input
            className="answer-input"
            value={input}
            disabled={!!feedback}
            onChange={(e) => setInput(e.target.value.toLowerCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitInput();
            }}
            placeholder="พิมพ์คำตอบที่นี่..."
            autoFocus
          />
          <div>
            <button className="submit-btn" onClick={submitInput} disabled={!!feedback}>
              ✓ ตรวจคำตอบ
            </button>
          </div>
        </div>
      )}

      {feedback && <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>}
    </QuizShell>
  );
}
