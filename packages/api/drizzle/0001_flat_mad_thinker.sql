CREATE TABLE `daily_free_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`used_date` text NOT NULL,
	`scene` text NOT NULL,
	`used_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `monthly_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`year_month` text NOT NULL,
	`summary_data` text NOT NULL,
	`story_content` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `agent_contents` ADD `hexagram_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_contents` ADD `mood` text NOT NULL;