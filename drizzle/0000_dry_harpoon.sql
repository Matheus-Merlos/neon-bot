CREATE TABLE "character" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"xp" integer NOT NULL,
	"gold" integer NOT NULL,
	"player" bigint NOT NULL,
	"image_url" varchar(255),
	"salt" varchar(5),
	"class" integer,
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(127) NOT NULL,
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_objective" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(127) NOT NULL,
	"xp" integer NOT NULL,
	"gold" integer NOT NULL,
	"description" text NOT NULL,
	"class" integer NOT NULL,
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "completed_class_objective" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"class_objective_id" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "completed_objective" (
	"id" serial PRIMARY KEY NOT NULL,
	"objective_id" integer NOT NULL,
	"character_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"durability" integer NOT NULL,
	"character_id" integer NOT NULL,
	"item_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(127) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"durability" integer NOT NULL,
	"can_buy" boolean NOT NULL,
	"image" varchar(255),
	"salt" varchar(5),
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"xp" integer NOT NULL,
	"gold" integer NOT NULL,
	"difficulty" integer NOT NULL,
	"image_url" varchar(255),
	"salt" varchar(5),
	"guild_id" bigint NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_complete" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"mission_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_difficulty" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(31) NOT NULL,
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "objective" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(127) NOT NULL,
	"xp" integer NOT NULL,
	"gold" integer NOT NULL,
	"description" text NOT NULL,
	"type" integer NOT NULL,
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "objective_difficulty" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(31) NOT NULL,
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player" (
	"discord_id" bigint PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rank" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(31) NOT NULL,
	"xp" integer NOT NULL,
	"extra_attributes" integer NOT NULL,
	"extra_habs" integer NOT NULL,
	"guild_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reached_rank" (
	"id" serial NOT NULL,
	"character_id" integer NOT NULL,
	"rank_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "selected_objective" (
	"id" serial PRIMARY KEY NOT NULL,
	"objective_id" integer NOT NULL,
	"character_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character" ADD CONSTRAINT "character_player_player_discord_id_fk" FOREIGN KEY ("player") REFERENCES "public"."player"("discord_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character" ADD CONSTRAINT "character_class_class_id_fk" FOREIGN KEY ("class") REFERENCES "public"."class"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_objective" ADD CONSTRAINT "class_objective_class_class_id_fk" FOREIGN KEY ("class") REFERENCES "public"."class"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "completed_class_objective" ADD CONSTRAINT "completed_class_objective_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "completed_class_objective" ADD CONSTRAINT "completed_class_objective_class_objective_id_class_objective_id_fk" FOREIGN KEY ("class_objective_id") REFERENCES "public"."class_objective"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "completed_objective" ADD CONSTRAINT "completed_objective_objective_id_objective_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."objective"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "completed_objective" ADD CONSTRAINT "completed_objective_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission" ADD CONSTRAINT "mission_difficulty_mission_difficulty_id_fk" FOREIGN KEY ("difficulty") REFERENCES "public"."mission_difficulty"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mission_complete" ADD CONSTRAINT "mission_complete_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mission_complete" ADD CONSTRAINT "mission_complete_mission_id_mission_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."mission"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_type_objective_difficulty_id_fk" FOREIGN KEY ("type") REFERENCES "public"."objective_difficulty"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "reached_rank" ADD CONSTRAINT "reached_rank_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "reached_rank" ADD CONSTRAINT "reached_rank_rank_id_rank_id_fk" FOREIGN KEY ("rank_id") REFERENCES "public"."rank"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "selected_objective" ADD CONSTRAINT "selected_objective_objective_id_objective_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."objective"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "selected_objective" ADD CONSTRAINT "selected_objective_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE cascade;