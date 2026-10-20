/** Storage-independent planning contracts. Runtime local-storage validation lives in storage.ts. */
export type LocalDate = `${number}-${number}-${number}`;
export type Timestamp = string; // ISO 8601 UTC; validated at the storage boundary.
export type EntityId = string;
export type PlanningStatus = "active" | "paused" | "completed";
export interface PlanningRecord {
  readonly id: EntityId;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
export interface Goal extends PlanningRecord {
  readonly title: string;
  readonly description: string;
  readonly categoryId: string;
  readonly status: PlanningStatus;
  readonly targetDate?: LocalDate;
}
export interface Milestone extends PlanningRecord {
  readonly goalId: EntityId;
  readonly title: string;
  readonly position: number;
  readonly targetDate?: LocalDate;
  readonly status: "open" | "completed";
}
export interface Task extends PlanningRecord {
  readonly title: string;
  readonly categoryId: string;
  readonly status: "open" | "in-progress" | "completed";
  readonly priority: "high" | "normal" | "low";
  readonly scheduledStart?: Timestamp;
  readonly plannedDate?: LocalDate;
  readonly dueDate?: LocalDate;
  readonly estimatedMinutes?: number;
  readonly goalId?: EntityId;
  readonly milestoneId?: EntityId;
}
export interface Habit extends PlanningRecord {
  readonly name: string;
  readonly categoryId: string;
  readonly goalId?: EntityId;
  readonly frequency:
    | { readonly kind: "weekly-target"; readonly timesPerWeek: number }
    | { readonly kind: "selected-days"; readonly weekdays: readonly number[] }; // ISO weekdays: Monday=1.
  readonly status: "active" | "paused";
}
export type CompletionSubject =
  | { readonly type: "goal"; readonly id: EntityId }
  | { readonly type: "task"; readonly id: EntityId }
  | { readonly type: "milestone"; readonly id: EntityId }
  | { readonly type: "habit"; readonly id: EntityId };
/** A minimal history contract, not an event bus or an event-sourced application.
 * localDate/timeZone preserve the calendar day intended when the action happened.
 * Retractions refer to an earlier completion; retries must reuse the original ID.
 */
export type CompletionEvent = {
  readonly id: EntityId;
  readonly subject: CompletionSubject;
  readonly occurredAt: Timestamp;
  readonly localDate: LocalDate;
  readonly timeZone: string;
} & (
  | { readonly kind: "completed" }
  | { readonly kind: "retracted"; readonly completionEventId: EntityId }
);

export interface Commitment extends PlanningRecord {
  readonly title: string;
  readonly categoryId: string;
  readonly startAt: Timestamp;
  readonly endAt: Timestamp;
  readonly timeZone: string;
}
export interface Category {
  readonly id: string;
  readonly name: string;
  readonly tone: "sage" | "blue" | "lavender" | "taupe" | "rose";
}
