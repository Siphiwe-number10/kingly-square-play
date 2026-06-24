import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { loadProfile, saveProfile, defaultProfile, loadHistory, type UserProfile } from "@/lib/storage";
import { Mail, BookOpen, ClipboardList, Save, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — AI Productivity Hub" },
      { name: "description", content: "Manage your account details and see your AI productivity stats." },
    ],
  }),
  component: ProfilePage,
});

const COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6"];

function ProfilePage() {
  const [p, setP] = useState<UserProfile>(defaultProfile);
  const [stats, setStats] = useState({ email: 0, research: 0, meetings: 0, total: 0 });

  useEffect(() => {
    setP(loadProfile());
    const h = loadHistory();
    setStats({
      email: h.filter((x) => x.module === "email").length,
      research: h.filter((x) => x.module === "research").length,
      meetings: h.filter((x) => x.module === "meetings").length,
      total: h.length,
    });
  }, []);

  const initials = useMemo(() => {
    const n = p.name.trim();
    if (!n) return "U";
    return n.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  }, [p.name]);

  const save = () => {
    saveProfile(p);
    toast.success("Profile saved");
  };

  return (
    <AppShell title="Your Profile" subtitle="Personalize your account">
      <div className="mx-auto grid max-w-4xl gap-6">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-24 opacity-90"
            style={{ background: `linear-gradient(135deg, ${p.avatarColor}, transparent 70%)` }}
          />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div
              className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-white shadow-lg ring-4 ring-card"
              style={{ backgroundColor: p.avatarColor }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">{p.name || "Unnamed user"}</h2>
              <p className="truncate text-sm text-muted-foreground">{p.role || "Add a role"}</p>
              <p className="truncate text-xs text-muted-foreground">{p.email || "Add an email"}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-4">
          <Stat label="Total outputs" value={stats.total} icon={UserIcon} />
          <Stat label="Emails" value={stats.email} icon={Mail} />
          <Stat label="Research" value={stats.research} icon={BookOpen} />
          <Stat label="Meetings" value={stats.meetings} icon={ClipboardList} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Account details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="Jane Doe" maxLength={80} />
            </Field>
            <Field label="Email">
              <Input type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} placeholder="jane@company.com" maxLength={160} />
            </Field>
            <Field label="Role">
              <Input value={p.role} onChange={(e) => setP({ ...p, role: e.target.value })} placeholder="Product Manager" maxLength={80} />
            </Field>
            <Field label="Avatar color">
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setP({ ...p, avatarColor: c })}
                    aria-label={`Pick ${c}`}
                    className={"h-7 w-7 rounded-full ring-offset-2 transition-all " + (p.avatarColor === c ? "ring-2 ring-foreground" : "ring-0")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Bio">
              <Textarea rows={3} value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value.slice(0, 280) })} placeholder="A short bio (max 280 chars)" />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={save}>
              <Save className="mr-2 h-4 w-4" /> Save profile
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Mail }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold">{value}</div>
        <div className="truncate text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}