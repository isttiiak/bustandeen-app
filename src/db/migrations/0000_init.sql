CREATE TABLE `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_uid` text NOT NULL,
	`domain` text NOT NULL,
	`method` text NOT NULL,
	`path` text NOT NULL,
	`body` text NOT NULL,
	`tracking_day` text,
	`created_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` integer,
	`state` text NOT NULL,
	`last_error` text
);
--> statement-breakpoint
CREATE INDEX `outbox_owner_state_idx` ON `outbox` (`owner_uid`,`state`,`created_at`);--> statement-breakpoint
CREATE TABLE `query_cache` (
	`owner_uid` text NOT NULL,
	`key` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`owner_uid`, `key`)
);
