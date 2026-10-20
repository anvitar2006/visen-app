import {
  sampleTasks,
  sampleGoals,
  sampleMilestones,
  sampleHabits,
} from "./sample-planning";
// Read-only display adapters. Snapshot progress is illustrative, not a production calculation.
const taskDisplay = {
  "task-portfolio": {
    detail: "Career & purpose · 45 min",
    category: "Career",
    color: "rose",
  },
  "task-pilates": {
    detail: "11:00 AM · 50 min",
    category: "Wellbeing",
    color: "sage",
  },
  "task-reading": {
    detail: "Personal growth · 20 min",
    category: "Personal",
    color: "sand",
  },
};
const goalDisplay = {
  "goal-career": {
    category: "CAREER & PURPOSE",
    progress: 42,
    steps: "3 of 7 milestones",
    color: "rose",
    nextMilestoneId: "milestone-1-4",
  },
  "goal-wellbeing": {
    category: "MIND & BODY",
    progress: 60,
    steps: "3 of 5 milestones",
    color: "sage",
    nextMilestoneId: "milestone-2-4",
  },
  "goal-curiosity": {
    category: "PERSONAL GROWTH",
    progress: 25,
    steps: "1 of 4 milestones",
    color: "sand",
    nextMilestoneId: "milestone-3-2",
  },
};
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
export const tasks = sampleTasks.map((task) => ({
  ...task,
  ...taskDisplay[task.id],
  done: task.status === "completed",
}));
export const goals = sampleGoals.map((goal) => ({
  ...goal,
  ...goalDisplay[goal.id],
  detail: goal.description,
  milestone: sampleMilestones.find(
    (m) => m.id === goalDisplay[goal.id].nextMilestoneId,
  )!.title,
}));
export const habits = sampleHabits.map((habit) => ({
  ...habit,
  ...habitDisplay[habit.id],
}));
// Tuesday is the fixed sample day; this is a display snapshot, not a scheduling engine.
export const todayHabits = habits.map((habit) => ({
  id: habit.id,
  name: habit.name,
  done: habit.days[1],
}));
export const days = [
  {
    name: "Mon",
    date: 19,
    items: ["Weekly reset", "Portfolio research"],
    load: "A gentle start",
  },
  {
    name: "Tue",
    date: 20,
    items: ["Refine portfolio", "Pilates at the studio", "Coffee with Maya"],
    load: "Room to breathe",
  },
  {
    name: "Wed",
    date: 21,
    items: ["Project workshop", "Grocery run"],
    load: "A balanced day",
  },
  {
    name: "Thu",
    date: 22,
    items: [
      "Design presentation",
      "Lunch with Alex",
      "Evening class",
      "Application review",
    ],
    load: "A fuller day",
  },
  {
    name: "Fri",
    date: 23,
    items: ["Finish case study", "Dinner with friends"],
    load: "Finish with intention",
  },
  {
    name: "Sat",
    date: 24,
    items: ["Farmers market", "A long walk"],
    load: "Time for yourself",
  },
  {
    name: "Sun",
    date: 25,
    items: ["Slow morning", "Plan the week ahead"],
    load: "Rest & reset",
  },
];
export const weekItemDetails: Record<
  string,
  { category: string; color: "rose" | "sage" | "sand"; detail: string }
> = {
  "Weekly reset": {
    category: "Personal",
    color: "sand",
    detail: "20 min · Flexible",
  },
  "Portfolio research": {
    category: "Career",
    color: "rose",
    detail: "45 min · Flexible",
  },
  "Refine portfolio": {
    category: "Career",
    color: "rose",
    detail: "45 min · Flexible",
  },
  "Pilates at the studio": {
    category: "Wellbeing",
    color: "sage",
    detail: "11:00 AM · 50 min",
  },
  "Coffee with Maya": {
    category: "Connection",
    color: "sand",
    detail: "3:30 PM · Corner café",
  },
  "Project workshop": {
    category: "Career",
    color: "rose",
    detail: "10:00 AM · 60 min",
  },
  "Grocery run": {
    category: "Personal",
    color: "sand",
    detail: "30 min · Flexible",
  },
  "Design presentation": {
    category: "Career",
    color: "rose",
    detail: "9:00 AM · 60 min",
  },
  "Lunch with Alex": {
    category: "Connection",
    color: "sand",
    detail: "12:30 PM · 60 min",
  },
  "Evening class": {
    category: "Learning",
    color: "sage",
    detail: "6:00 PM · 90 min",
  },
  "Application review": {
    category: "Career",
    color: "rose",
    detail: "45 min · Flexible",
  },
  "Finish case study": {
    category: "Career",
    color: "rose",
    detail: "60 min · Flexible",
  },
  "Dinner with friends": {
    category: "Connection",
    color: "sand",
    detail: "7:00 PM · An open evening",
  },
  "Farmers market": {
    category: "Personal",
    color: "sand",
    detail: "A slow Saturday morning",
  },
  "A long walk": {
    category: "Wellbeing",
    color: "sage",
    detail: "40 min · Outdoors",
  },
  "Slow morning": {
    category: "Wellbeing",
    color: "sage",
    detail: "Leave a little room",
  },
  "Plan the week ahead": {
    category: "Personal",
    color: "sand",
    detail: "20 min · Flexible",
  },
};
