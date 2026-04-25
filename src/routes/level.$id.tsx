import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { QuizLevel } from "@/components/QuizLevel";
import { Level5 } from "@/components/Level5";
import { Level6 } from "@/components/Level6";
import { JpLayout } from "@/components/JpLayout";

export const Route = createFileRoute("/level/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Level ${params.id} — Japanese Language Learning` },
      { name: "description", content: `แบบฝึกฮิรางานะ Level ${params.id}` },
    ],
  }),
  loader: ({ params }) => {
    const n = Number(params.id);
    if (!Number.isInteger(n) || n < 1 || n > 6) throw notFound();
    return { level: n as 1 | 2 | 3 | 4 | 5 | 6 };
  },
  component: LevelPage,
  notFoundComponent: () => (
    <JpLayout>
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>ไม่พบเลเวลที่ต้องการ</h2>
        <Link to="/" className="back-btn" style={{ marginTop: 16 }}>
          ← กลับหน้าหลัก
        </Link>
      </div>
    </JpLayout>
  ),
  errorComponent: ({ error }) => (
    <JpLayout>
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>เกิดข้อผิดพลาด</h2>
        <p style={{ color: "var(--text-muted)" }}>{error.message}</p>
        <Link to="/" className="back-btn" style={{ marginTop: 16 }}>
          ← กลับหน้าหลัก
        </Link>
      </div>
    </JpLayout>
  ),
});

function LevelPage() {
  const { id } = Route.useParams();
  const level = Number(id) as 1 | 2 | 3 | 4 | 5 | 6;
  if (level === 1) return <QuizLevel level={1} mode="choice3" />;
  if (level === 2) return <QuizLevel level={2} mode="choice6" />;
  if (level === 3) return <QuizLevel level={3} mode="type-hint" />;
  if (level === 4) return <QuizLevel level={4} mode="type-bare" />;
  if (level === 5) return <Level5 />;
  return <Level6 />;
}
