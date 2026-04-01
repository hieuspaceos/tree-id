CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `landing_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`config` text NOT NULL,
	`published` integer DEFAULT false,
	`created_at` text DEFAULT '(datetime(''now''))',
	`updated_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `landing_pages_slug_unique` ON `landing_pages` (`slug`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`plan` text DEFAULT 'free',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `content_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`collection` text NOT NULL,
	`slug` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`description` text DEFAULT '',
	`body` text,
	`metadata` text DEFAULT '{}' NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT '(datetime(''now''))',
	`updated_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_content_collection_slug` ON `content_entries` (`collection`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_content_collection_status` ON `content_entries` (`collection`,`status`);--> statement-breakpoint
CREATE TABLE `distribution_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`content_type` text NOT NULL,
	`platforms` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'drafted' NOT NULL,
	`word_count` integer DEFAULT 0,
	`notes` text,
	`distributed_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE INDEX `idx_distribution_slug` ON `distribution_logs` (`slug`);--> statement-breakpoint
CREATE TABLE `entity_definitions` (
	`name` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`fields` text DEFAULT '[]' NOT NULL,
	`public_config` text,
	`created_at` text DEFAULT '(datetime(''now''))',
	`updated_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE TABLE `entity_instances` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_name` text NOT NULL,
	`slug` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT '(datetime(''now''))',
	`updated_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_entity_instances_name_slug` ON `entity_instances` (`entity_name`,`slug`);--> statement-breakpoint
CREATE TABLE `landing_templates` (
	`name` text PRIMARY KEY NOT NULL,
	`description` text,
	`target_audience` text,
	`config` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `owner_landing_pages` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`template` text,
	`config` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT '(datetime(''now''))',
	`updated_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE TABLE `product_configs` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`config` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT '(datetime(''now''))',
	`updated_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text DEFAULT '{}' NOT NULL,
	`updated_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`subscribed_at` text DEFAULT '(datetime(''now''))'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_token_unique` ON `subscribers` (`token`);--> statement-breakpoint
CREATE INDEX `idx_subscribers_email` ON `subscribers` (`email`);--> statement-breakpoint
CREATE INDEX `idx_subscribers_token` ON `subscribers` (`token`);--> statement-breakpoint
CREATE TABLE `tenant_databases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`db_name` text NOT NULL,
	`db_url` text NOT NULL,
	`db_token` text NOT NULL,
	`schema_version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'provisioning' NOT NULL,
	`created_at` text DEFAULT '(datetime(''now''))',
	`updated_at` text DEFAULT '(datetime(''now''))',
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_databases_user_id_unique` ON `tenant_databases` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_databases_db_name_unique` ON `tenant_databases` (`db_name`);