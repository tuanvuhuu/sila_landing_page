import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { currentSite } from "@/lib/site";
import AdminEditor from "./AdminEditor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAuthed()) {
    redirect("/admin/login");
  }
  const site = currentSite();
  const content = await getContent(site);
  return <AdminEditor initial={content} initialSite={site} />;
}
