import { prisma } from "@/lib/db";
import { getContent } from "@/lib/content";
import EventTabs from "./EventTabs";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const c = await getContent();
  return {
    title: `Sự kiện — ${c.centerName}`,
    description: `Các sự kiện, hoạt động sắp tới và đã diễn ra tại ${c.centerName}.`,
  };
}

export default async function EventsPage() {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { status: "published", date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.event.findMany({
      where: { status: "published", date: { lt: now } },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a href="/" className="logo">
            <img src="/logo.png" alt="ESL Academy" />
            <span className="wm">ESL Academy<small>English as a Second Language</small></span>
          </a>
          <div className="nav-right">
            <a href="/" className="btn btn-ghost">← Trang chủ</a>
          </div>
        </div>
      </header>

      <section className="ev-page">
        <div className="wrap">
          <div className="head">
            <span className="kicker">Sự kiện</span>
            <h1>Hoạt động tại trung tâm 🎉</h1>
          </div>
          <EventTabs
            upcoming={JSON.parse(JSON.stringify(upcoming))}
            past={JSON.parse(JSON.stringify(past))}
          />
        </div>
      </section>
    </>
  );
}
