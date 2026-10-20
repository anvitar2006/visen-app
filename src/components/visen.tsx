"use client";
import SanaView from "@/features/sana/view";
import HabitsView from "@/features/habits/view";
import VisionView from "@/features/vision/view";
import WeekView from "@/features/week/view";
import TodayView from "@/features/today/view";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CircleHelp,
  Flower2,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
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
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("visen-theme");
    } catch {}
    setDark(
      saved
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      try {
        if (!localStorage.getItem("visen-theme")) setDark(m.matches);
      } catch {
        setDark(m.matches);
      }
    };
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (dark !== null)
      document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  function toggleTheme() {
    setDark(!dark);
    try {
      localStorage.setItem("visen-theme", dark ? "light" : "dark");
    } catch {}
  }
  function navigate(next: View) {
    setView(next);
    setMenu(false);
    setNotice(false);
  }
  const demo = () => setNotice(true);
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
            <Flower2 size={25} strokeWidth={1} />
            <p>
              Small steps.
              <br />A life that feels like you.
            </p>
          </div>
          <button className="theme-button" onClick={toggleTheme}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            <span>{dark ? "Light mode" : "Dark mode"}</span>
          </button>
          <div className="profile">
            <span className="avatar">A</span>
            <div>
              <strong>Alex Morgan</strong>
              <span>Your personal space</span>
            </div>
            <span className="sample-pill">DEMO</span>
          </div>
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
              <span /> SAMPLE EXPERIENCE
            </span>
            <button
              className="icon-button"
              aria-label="About this preview"
              onClick={demo}
            >
              <CircleHelp size={18} />
            </button>
          </div>
        </header>
        <div className="page-content">
          <PageHeading
            eyebrow={headings[view].eyebrow}
            title={headings[view].title}
            description={headings[view].description}
            action={
              headings[view].action ? (
                <button
                  className="outline-button heading-action"
                  onClick={demo}
                >
                  <Plus size={16} />
                  {headings[view].action}
                </button>
              ) : undefined
            }
          />
          {notice && (
            <div className="notice" role="status">
              <span>
                This is a read-only design preview. Planning changes and
                personalized guidance are not available yet. No data has been
                changed.
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
          {view === "Today" && <TodayView demo={demo} navigate={navigate} />}
          {view === "Week" && <WeekView demo={demo} navigate={navigate} />}
          {view === "My Vision" && <VisionView demo={demo} />}
          {view === "Habits" && <HabitsView demo={demo} />}
          {view === "Sana" && <SanaView />}
          <footer className="page-footer">
            <span>
              VISEN <span className="footer-dot">·</span> A LIFE WITH INTENTION
            </span>
            <span>Sample content · Visual foundation</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
