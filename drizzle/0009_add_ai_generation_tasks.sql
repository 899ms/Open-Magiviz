-- Add AI Generation Tasks Table
-- This migration adds a table to track AI generation tasks (taskId and userId mapping)
-- This allows us to deduct points only when the task succeeds (via webhook callback)
-- 
-- This migration is safe to run on existing databases and will not affect existing data.

-- Create ai_generation_tasks table
CREATE TABLE IF NOT EXISTS "ai_generation_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"taskId" text NOT NULL UNIQUE,
	"userId" text NOT NULL,
	"taskType" text NOT NULL,
	"pointsDeducted" boolean DEFAULT false NOT NULL,
	"pointsAmount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "ai_generation_tasks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "ai_task_task_id_idx" ON "ai_generation_tasks"("taskId");
CREATE INDEX IF NOT EXISTS "ai_task_user_id_idx" ON "ai_generation_tasks"("userId");
CREATE INDEX IF NOT EXISTS "ai_task_status_idx" ON "ai_generation_tasks"("status");
