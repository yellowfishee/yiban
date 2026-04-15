CREATE TABLE `agent_contents` (
	`id` text PRIMARY KEY NOT NULL,
	`checkin_id` text NOT NULL,
	`user_id` text NOT NULL,
	`scene` text NOT NULL,
	`content` text NOT NULL,
	`cached` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`checkin_id`) REFERENCES `checkins`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hexagram_id` text NOT NULL,
	`meihua_data` text NOT NULL,
	`mood` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hexagram_id` text NOT NULL,
	`adopted_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`openid` text NOT NULL,
	`phone` text,
	`nickname` text NOT NULL,
	`avatar` text NOT NULL,
	`is_premium` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openid_unique` ON `users` (`openid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);