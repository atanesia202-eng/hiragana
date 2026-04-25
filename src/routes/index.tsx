import { createFileRoute, Link } from "@tanstack/react-router";
import { JpLayout } from "@/components/JpLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Japanese Language Learning — เรียนฮิรางานะ" },
      {
        name: "description",
        content:
          "เรียนรู้ตัวอักษรฮิรางานะภาษาญี่ปุ่น 6 เลเวล: ปรนัย, พิมพ์คำตอบ, เขียนคำศัพท์ และฝึกเขียนบนกระดาน",
      },
    ],
  }),
  component: Home,
});

const levels = [
  {
    n: 1,
    diff: "ง่าย",
    title: "แบบทดสอบปรนัย 3 ตัวเลือก",
    desc: "ครอบคลุม 46 ตัวอักษร + มีเสียงช่วย + คำใบ้",
  },
  {
    n: 2,
    diff: "ปานกลาง",
    title: "แบบทดสอบปรนัย 6 ตัวเลือก",
    desc: "46 ข้อ + ไม่มีเสียงช่วย",
  },
  {
    n: 3,
    diff: "ปานกลาง",
    title: "พิมพ์คำตอบ (มีเสียงช่วย)",
    desc: "46 ข้อ + มีเสียงและคำใบ้ตัวอักษรแรก",
  },
  {
    n: 4,
    diff: "ยาก",
    title: "พิมพ์คำตอบ (ไม่มีเสียงช่วย)",
    desc: "46 ข้อ + จับเวลา + ทดสอบความจำแท้จริง",
  },
  {
    n: 5,
    diff: "ยากพิเศษ",
    title: "เขียนฮิรางานะจากคำศัพท์ไทย",
    desc: "เลือกตัวอักษรจาก 46 ตัวเพื่อสะกดคำ",
  },
  {
    n: 6,
    diff: "ฝึกเขียน",
    title: "วาดฮิรางานะบนกระดาน",
    desc: "โจทย์เป็น romaji เช่น ka → วาด か ลงในกระดาน",
  },
];

function Home() {
  return (
    <JpLayout>
      <main>
        <div className="levels-grid">
          {levels.map((l) => (
            <div key={l.n} className={`level-card l${l.n}`}>
              <span className="difficulty">{l.diff}</span>
              <h2>Level {l.n}</h2>
              <div className="level-desc">
                <p>{l.title}</p>
                <small>{l.desc}</small>
              </div>
              <Link to="/level/$id" params={{ id: String(l.n) }} className="start-btn">
                ▶ เริ่มเรียนรู้
              </Link>
            </div>
          ))}
        </div>
      </main>
    </JpLayout>
  );
}
