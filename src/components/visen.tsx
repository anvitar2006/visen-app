"use client";
import { PlanningProvider, usePlanning } from "@/features/planning/store";
import PlanningEditor from "@/features/planning/editor";
import { dateLabel } from "@/domain/dates";
import SanaView from "@/features/sana/view";
import HabitsView from "@/features/habits/view";
import VisionView from "@/features/vision/view";
import WeekView from "@/features/week/view";
import TodayView from "@/features/today/view";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CircleHelp,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
  Undo2,
} from "lucide-react";
import {
  primaryNavigation,
  NavigationButton,
  type View,
} from "@/components/navigation";
import SanaMark from "@/components/sana-mark";
import PageHeading from "@/components/ui/page-heading";
const headings = {
  Today: {
    eyebrow: "TUESDAY, OCTOBER 20 · SAMPLE DAY",
    title: "Good morning, Alex.",
    description: "",
    action: "Add a task",
  },
  Week: {
    eyebrow: "YOUR WEEK, WITH INTENTION",
    title: "A week with room to breathe.",
    description: "The plans that matter, with space for life in between.",
    action: "Add a plan",
  },
  "My Vision": {
    eyebrow: "THE BIGGER PICTURE",
    title: "Become who you envision.",
    description:
      "Let the life you want to create bring meaning to the everyday.",
    action: "New goal",
  },
  Habits: {
    eyebrow: "THE THINGS YOU COME BACK TO",
    title: "Small rituals. A steadier rhythm.",
    description:
      "Simple things that help you feel a little more like yourself.",
    action: "New habit",
  },
  Sana: {
    eyebrow: "THOUGHTFUL GUIDANCE, YOUR DECISIONS",
    title: "A little clarity, with Sana.",
    description:
      "A quiet place to sort through your plans and find a little perspective.",
    action: null,
  },
} satisfies Record<
  View,
  { eyebrow: string; title: string; description: string; action: string | null }
>;
export default function Visen() {
  return (
    <PlanningProvider>
      <VisenApp />
    </PlanningProvider>
  );
}
function VisenApp() {
  const planning = usePlanning();
  const { data, openEditor, ready } = planning;
  const [view, setView] = useState<View>("Today");
  const [dark, setDark] = useState<boolean | null>(null);
  const [mobile, setMobile] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => {
      setMobile(query.matches);
      if (!query.matches) setMenu(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!menu || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = navigationRef.current;
    panel?.querySelector<HTMLButtonElement>(".mobile-close")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((el) => el.getClientRects().length > 0);
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, [menu, mobile]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () =>
      setDark(
        data.preferences.theme === "system"
          ? media.matches
          : data.preferences.theme === "dark",
      );
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [data.preferences.theme]);
  useEffect(() => {
    if (dark !== null) {
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      try {
        if (data.preferences.theme === "system")
          localStorage.removeItem("visen-theme");
        else localStorage.setItem("visen-theme", data.preferences.theme);
      } catch {}
    }
  }, [dark, data.preferences.theme]);
  function toggleTheme() {
    planning.commit(
      (d) => {
        d.preferences.theme = dark ? "light" : "dark";
      },
      "Appearance saved",
      false,
      false,
    );
  }
  function navigate(next: View) {
    setView(next);
    setMenu(false);
    setNotice(false);
  }
  const demo = () => setNotice(true);
  const addPlan = () =>
    openEditor(
      view === "My Vision" ? "goal" : view === "Habits" ? "habit" : "task",
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside
        id="main-navigation"
        ref={navigationRef}
        inert={mobile && !menu}
        role={mobile && menu ? "dialog" : undefined}
        aria-modal={mobile && menu ? true : undefined}
        className={`sidebar ${menu ? "open" : ""}`}
        aria-label="Main navigation"
      >
        <a className="wordmark" href="#today" onClick={() => navigate("Today")}>
          visen
        </a>
        <p className="brand-caption">BECOME WHO YOU ENVISION.</p>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X size={21} />
        </button>
        <nav>
          {primaryNavigation.map(({ name, icon: Icon }) => (
            <NavigationButton
              key={name}
              view={name}
              active={view === name}
              icon={<Icon size={19} strokeWidth={1.5} />}
              onNavigate={navigate}
            />
          ))}
        </nav>
        <div className="sidebar-sana">
          <span className="eyebrow">A LITTLE GUIDANCE</span>
          <NavigationButton
            view="Sana"
            active={view === "Sana"}
            label="Meet Sana"
            icon={<SanaMark small />}
            trailing={<ArrowUpRight size={15} />}
            onNavigate={navigate}
          />
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <p>
              Small steps.
              <br />A life that feels like you.
            </p>
          </div>
          <button className="theme-button" onClick={toggleTheme}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            <span>{dark ? "Light mode" : "Dark mode"}</span>
          </button>
          <button
            className="profile"
            onClick={() => {
              setMenu(false);
              openEditor("settings");
            }}
            aria-label="Your space and data settings"
          >
            <span className="avatar">
              {data.preferences.name.slice(0, 1) || "V"}
            </span>
            <div>
              <strong>{data.preferences.name || "Your space"}</strong>
              <span>Your personal space</span>
            </div>
            <span className="sample-pill">LOCAL</span>
          </button>
        </div>
      </aside>
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation overlay"
          onClick={() => setMenu(false)}
        />
      )}
      <main id="main-content" tabIndex={-1} inert={mobile && menu}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              aria-expanded={menu}
              aria-controls="main-navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Your space</span>
            <span className="slash">/</span>
            <strong>{view}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-label">
              <span />{" "}
              {data.sample ? "INCLUDES SAMPLE PLANS" : "SAVED ON THIS DEVICE"}
            </span>
            <button
              className="icon-button"
              aria-label="Undo last change"
              title="Undo last change"
              disabled={!planning.canUndo}
              onClick={planning.undo}
            >
              <Undo2 size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="About local storage"
              onClick={demo}
            >
              <CircleHelp size={18} />
            </button>
          </div>
        </header>
        <div className="page-content">
          {view !== "Sana" && (
            <PageHeading
              eyebrow={
                view === "Today"
                  ? dateLabel(planning.today, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }).toUpperCase()
                  : headings[view].eyebrow
              }
              title={
                view === "Today"
                  ? `Hello${data.preferences.name ? `, ${data.preferences.name}` : ""}.`
                  : headings[view].title
              }
              description={headings[view].description}
              action={
                headings[view].action ? (
                  <button
                    className="outline-button heading-action"
                    onClick={addPlan}
                  >
                    <Plus size={16} />
                    {headings[view].action}
                  </button>
                ) : undefined
              }
            />
          )}
          {notice && (
            <div className="notice" role="status">
              <span>
                Plans are saved only in this browser, without accounts or cloud
                sync. Export a backup from Your space. Sana is still a scripted
                preview; she cannot change your plans.
              </span>
              <button
                className="icon-button"
                aria-label="Dismiss preview information"
                onClick={() => setNotice(false)}
              >
                <X size={18} />
              </button>
            </div>
          )}
          {!ready && <p role="status">Opening your space…</p>}
          {planning.error && (
            <div className="notice" role="alert">
              <span>{planning.error}</span>
              <button
                className="text-link"
                onClick={() => openEditor("settings")}
              >
                Data & recovery
              </button>
              <button
                className="icon-button"
                aria-label="Dismiss storage warning"
                onClick={() => planning.setError("")}
              >
                <X size={18} />
              </button>
            </div>
          )}
          {planning.message && (
            <div className="save-notice" role="status">
              <span>{planning.message}</span>
              {planning.canUndo && (
                <button className="text-link" onClick={planning.undo}>
                  Undo
                </button>
              )}
              <button
                className="icon-button"
                aria-label="Dismiss save message"
                onClick={() => planning.setMessage("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {ready &&
            !data.tasks.length &&
            !data.goals.length &&
            !data.habits.length &&
            !data.commitments.length &&
            view !== "Sana" && (
              <div className="empty-welcome">
                <p>
                  Your space is ready. Start with one plan, or explore fictional
                  examples.
                </p>
                <button
                  className="text-link"
                  onClick={() => openEditor("settings")}
                >
                  Profile, sample plans & data
                </button>
              </div>
            )}
          {ready && view === "Today" && <TodayView navigate={navigate} />}
          {view === "Week" && <WeekView navigate={navigate} />}
          {view === "My Vision" && <VisionView />}
          {view === "Habits" && <HabitsView />}
          {view === "Sana" && <SanaView />}
          <footer className="page-footer">
            <span>
              VISEN <span className="footer-dot">·</span> A LIFE WITH INTENTION
            </span>
            <span>Local planning · No cloud sync</span>
          </footer>
        </div>
      </main>
      <PlanningEditor />
    </div>
  );
}
