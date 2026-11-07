CREATE TABLE "rule" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(127) NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(127) NOT NULL,
	"description" text NOT NULL
);
