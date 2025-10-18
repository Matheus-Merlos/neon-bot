CREATE TABLE "npc" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"guild_id" bigint NOT NULL,
	"discord_id" bigint NOT NULL,
	"webhook_id" bigint NOT NULL,
	"webhook_token" varchar(512) NOT NULL
);
