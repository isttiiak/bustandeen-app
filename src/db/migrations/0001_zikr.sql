CREATE TABLE `zikr_day` (
	`owner_uid` text NOT NULL,
	`day` text NOT NULL,
	`zikr_type` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`shown` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`owner_uid`, `day`, `zikr_type`)
);
--> statement-breakpoint
CREATE TABLE `zikr_unsent` (
	`owner_uid` text NOT NULL,
	`day` text NOT NULL,
	`zikr_type` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`untimed_amount` integer DEFAULT 0 NOT NULL,
	`first_ts` integer,
	`last_ts` integer,
	PRIMARY KEY(`owner_uid`, `day`, `zikr_type`)
);
