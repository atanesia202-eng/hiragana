import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { JpLayout } from "./JpLayout";

export function QuizShell({
  level,
  children,
}: {
  level: number;
  children: ReactNode;
}) {
  return (
    <JpLayout>
      <div className="quiz-wrap">
        <Link to="/" className="back-btn">
          ← กลับหน้าหลัก
        </Link>
        <div className={`quiz-card l${level}`}>{children}</div>
      </div>
    </JpLayout>
  );
}

export function ResultView({
  level,
  score,
  total,
  seconds,
  onRestart,
}: {
  level: number;
  score: number;
  total: number;
  seconds: number;
  onRestart: () => void;
}) {
  void level;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  return (
    <div>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 12 }}>
        🎉 จบเซสชันเรียบร้อย!
      </h2>
      <div className="result-stats">
        <div className="stat-card">
          <div className="stat-value">{score}</div>
          <div className="stat-label">คะแนนรวม</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">ความแม่นยำ</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{seconds}s</div>
          <div className="stat-label">เวลาที่ใช้</div>
        </div>
      </div>
      <div className="action-row">
        <button className="submit-btn" onClick={onRestart}>
          🔄 เริ่มใหม่
        </button>
        <Link to="/" className="back-btn">
          🏠 กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

export function ScoreBar({
  score,
  current,
  total,
}: {
  score: number;
  current: number;
  total: number;
}) {
  const pct = ((current + 1) / total) * 100;
  return (
    <>
      <div className="score-row">
        <div className="score-pill">⭐ คะแนน: {score}</div>
        <div className="score-pill">
          ❓ ข้อ {current + 1}/{total}
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}

export function useTimer() {
  const [start] = useState(() => Date.now());
  return () => Math.round((Date.now() - start) / 1000);
}
