import { useEffect, useMemo, useRef, useState } from "react";
import { allCharacters, getRomaji, shuffle } from "@/lib/hiragana";
import { QuizShell, ScoreBar, ResultView, useTimer } from "@/components/QuizShell";

const SIZE = 380;
const TOTAL = 46;
const SIM_THRESHOLD = 0.42;

type MaskData = { mask: Uint8Array; size: number };

function toMask(src: HTMLCanvasElement, size = 64): MaskData {
  const tmp = document.createElement("canvas");
  tmp.width = size;
  tmp.height = size;
  const ctx = tmp.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(src, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const mask = new Uint8Array(size * size);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    mask[j] = lum < 180 ? 1 : 0;
  }
  return { mask, size };
}

function normalize({ mask, size }: MaskData): MaskData {
  let minX = size,
    minY = size,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (mask[y * size + x]) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return { mask, size };
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const crop = document.createElement("canvas");
  crop.width = w;
  crop.height = h;
  const cctx = crop.getContext("2d")!;
  const img = cctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = mask[(y + minY) * size + (x + minX)] ? 0 : 255;
      const i = (y * w + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  cctx.putImageData(img, 0, 0);
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const octx = out.getContext("2d")!;
  octx.fillStyle = "#fff";
  octx.fillRect(0, 0, size, size);
  const scale = Math.min((size * 0.86) / w, (size * 0.86) / h);
  const dw = w * scale;
  const dh = h * scale;
  octx.drawImage(crop, (size - dw) / 2, (size - dh) / 2, dw, dh);
  return toMask(out, size);
}

function compare(a: MaskData, b: MaskData): number {
  const size = a.size;
  let inter = 0,
    uni = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const ai = a.mask[i],
        bi = b.mask[i];
      if (ai || bi) {
        uni++;
        if (ai && bi) inter++;
        else {
          let near = 0;
          for (let dy = -1; dy <= 1 && !near; dy++) {
            for (let dx = -1; dx <= 1 && !near; dx++) {
              const nx = x + dx,
                ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
              const j = ny * size + nx;
              if (ai && b.mask[j]) near = 1;
              if (bi && a.mask[j]) near = 1;
            }
          }
          if (near) inter += 0.5;
        }
      }
    }
  }
  return uni === 0 ? 0 : inter / uni;
}

function renderTemplate(char: string): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = SIZE;
  off.height = SIZE;
  const ctx = off.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#000";
  ctx.font = `bold ${Math.floor(SIZE * 0.78)}px "Noto Sans JP", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, SIZE / 2, SIZE / 2 + 8);
  return off;
}

export function Level6() {
  const queue = useMemo(() => shuffle(allCharacters()).slice(0, TOTAL), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "bad"; msg: string } | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const elapsed = useTimer();

  const current = queue[idx];
  const romaji = current ? getRomaji(current) : "";

  const setupCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 14;
    setHasStrokes(false);
  };

  useEffect(() => {
    setupCanvas();
    setFeedback(null);
    setSimilarity(null);
    setShowHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const sx = c.width / rect.width;
    const sy = c.height / rect.height;
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    return { x: (p.clientX - rect.left) * sx, y: (p.clientY - rect.top) * sy };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const p = getPos(e);
    drawing.current = true;
    last.current = p;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    setHasStrokes(true);
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const end = () => {
    drawing.current = false;
  };

  const next = () => {
    if (idx + 1 >= TOTAL) setDone(true);
    else setIdx(idx + 1);
  };

  const submit = () => {
    if (!hasStrokes) {
      setFeedback({ type: "bad", msg: "กรุณาวาดตัวอักษรก่อนส่งคำตอบ" });
      return;
    }
    const userMask = normalize(toMask(canvasRef.current!, 64));
    const tplMask = normalize(toMask(renderTemplate(current), 64));
    const sim = compare(userMask, tplMask);
    setSimilarity(sim);
    const ok = sim >= SIM_THRESHOLD;
    if (ok) setScore((s) => s + 1);
    setFeedback({
      type: ok ? "ok" : "bad",
      msg: ok
        ? `ถูกต้อง! 🎉 คำตอบคือ ${current} (${romaji})`
        : `ยังไม่ถูกพอ — คำตอบคือ ${current} (${romaji})`,
    });
  };

  if (done) {
    return (
      <QuizShell level={6}>
        <ResultView
          level={6}
          score={score}
          total={TOTAL}
          seconds={elapsed()}
          onRestart={() => window.location.reload()}
        />
      </QuizShell>
    );
  }

  return (
    <QuizShell level={6}>
      <ScoreBar score={score} current={idx} total={TOTAL} />
      <p style={{ color: "var(--text-muted)" }}>วาดฮิรางานะของ romaji นี้ลงบนกระดาน</p>
      <div className="romaji-prompt">{romaji}</div>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="draw-canvas"
          style={{ width: 380, height: 380, maxWidth: "100%" }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        <div className={`canvas-guide ${hasStrokes && !showHint ? "hidden" : ""}`}>
          {showHint ? current : "✏️"}
        </div>
      </div>

      <div className="tool-row">
        <button className="tool-btn" onClick={setupCanvas}>
          🧽 ล้างกระดาน
        </button>
        <button className="tool-btn" onClick={() => setShowHint((v) => !v)}>
          💡 {showHint ? "ซ่อนตัวอย่าง" : "แสดงตัวอย่าง"}
        </button>
      </div>

      <div>
        {!feedback ? (
          <button className="submit-btn" onClick={submit}>
            ✓ ส่งคำตอบ
          </button>
        ) : (
          <button className="submit-btn" onClick={next}>
            ➡ ข้อถัดไป
          </button>
        )}
      </div>

      {feedback && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.type === "ok" && <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>✅ ถูกต้อง!</div>}
          {feedback.msg}
        </div>
      )}
      {similarity !== null && (
        <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: "0.9rem" }}>
          ความคล้าย: {Math.round(similarity * 100)}%
        </div>
      )}
    </QuizShell>
  );
}
