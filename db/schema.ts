import { integer, pgTable, serial, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  credits: integer("credits").default(3),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: varchar("projectId").notNull().unique(),
  projectName: varchar("projectName").notNull(),
  userEmail: varchar("userEmail").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const WhiteboardData=pgTable("whiteboarddata",{
  id: serial("id").primaryKey(),
  projectId: varchar("projectId").notNull().unique().references(()=>projects.projectId),
  elements: jsonb("elements").notNull(),
  appState: jsonb("appState").notNull(),
  files: jsonb("files").notNull(),
  updatedAt:timestamp("updatedAt").defaultNow().notNull(),
})
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
