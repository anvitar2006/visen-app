import type { Category, Commitment, Task } from "./planning";
import {
  sampleTasks,
  sampleGoals,
  sampleMilestones,
  sampleHabits,
  sampleCommitments,
  sampleToday,
  sampleTimeZone,
} from "./sample-planning";
export const categories: readonly Category[] = [
  { id: "career", name: "Work & focus", tone: "blue" },
  { id: "wellbeing", name: "Wellbeing", tone: "sage" },
  { id: "personal", name: "Personal", tone: "taupe" },
  { id: "reflection", name: "Reflection", tone: "lavender" },
  { id: "creativity", name: "Creativity", tone: "lavender" },
  { id: "connection", name: "Connection", tone: "taupe" },
];
export function categoryFor(id: string) {
  return categories.find((c) => c.id === id)!;
}
export const tasks: readonly Task[] = sampleTasks;
export const commitments: readonly Commitment[] = sampleCommitments;
export const todayTasks = tasks.filter(
  (task) => task.plannedDate === sampleToday,
);
export const todayPriorities = todayTasks.slice(0, 3);
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
  (name, i) => ({
    name,
    date: 19 + i,
    isoDate: `2026-10-${19 + i}`,
    note: i === 3 ? "A fuller day" : i === 1 ? "Room to breathe" : "",
  }),
);
export function timeLabel(instant: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: sampleTimeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(instant));
}
export function dateLabel(
  date: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
export const todayCommitments = commitments.filter(
  (c) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: c.timeZone }).format(
      new Date(c.startAt),
    ) === sampleToday,
);
/** Read-only projections of the SAME records, not independent task stores. */
export const planningItems = [
  ...tasks.map((task) => ({
    id: task.id,
    kind: "task" as const,
    title: task.title,
    date: task.plannedDate!,
    category: categoryFor(task.categoryId),
    status: task.status,
    priority: task.priority,
    start: task.scheduledStart,
    detail: task.scheduledStart
      ? `${timeLabel(task.scheduledStart)} · ${task.estimatedMinutes} min`
      : `${task.estimatedMinutes} min · Flexible`,
    record: task,
  })),
  ...commitments.map((commitment) => ({
    id: commitment.id,
    kind: "commitment" as const,
    title: commitment.title,
    date: new Intl.DateTimeFormat("en-CA", {
      timeZone: commitment.timeZone,
    }).format(new Date(commitment.startAt)),
    category: categoryFor(commitment.categoryId),
    status: "scheduled" as const,
    priority: "normal" as const,
    start: commitment.startAt,
    detail: timeLabel(commitment.startAt),
    record: commitment,
  })),
];
export type PlanningItem = (typeof planningItems)[number];
// The fictional day is viewed at 10 AM. This is a fixed preview, not live scheduling.
export const todayUpcomingItems = planningItems
  .filter(
    (item) =>
      item.date === sampleToday &&
      item.start &&
      item.start > "2026-10-20T14:00:00.000Z",
  )
  .sort((a, b) => a.start!.localeCompare(b.start!));
const goalDisplay = {
  "goal-career": {
    category: "CAREER & PURPOSE",
    progress: 42,
    steps: "3 of 7 milestones",
    nextMilestoneId: "milestone-1-4",
  },
  "goal-wellbeing": {
    category: "MIND & BODY",
    progress: 60,
    steps: "3 of 5 milestones",
    nextMilestoneId: "milestone-2-4",
  },
  "goal-curiosity": {
    category: "PERSONAL GROWTH",
    progress: 25,
    steps: "1 of 4 milestones",
    nextMilestoneId: "milestone-3-2",
  },
};
export const goals = sampleGoals.map((goal) => ({
  ...goal,
  ...goalDisplay[goal.id],
  color: categoryFor(goal.categoryId).tone,
  detail: goal.description,
  milestone: sampleMilestones.find(
    (m) => m.id === goalDisplay[goal.id].nextMilestoneId,
  )!.title,
}));
const habitDisplay = {
  "habit-movement": {
    detail: "3 times a week",
    days: [true, false, false, false, false, false, false],
    count: "1 of 3",
  },
  "habit-reading": {
    detail: "5 times a week",
    days: [true, true, false, false, false, false, false],
    count: "2 of 5",
  },
  "habit-stillness": {
    detail: "Every day",
    days: [true, false, false, false, false, false, false],
    count: "1 of 7",
  },
};
export const habits = sampleHabits.map((habit) => ({
  ...habit,
  ...habitDisplay[habit.id],
  color: categoryFor(habit.categoryId).tone,
}));
export const todayHabits = habits.map((habit) => ({
  id: habit.id,
  name: habit.name,
  color: habit.color,
  done: habit.days[1],
}));
