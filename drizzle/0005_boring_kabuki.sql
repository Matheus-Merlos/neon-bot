CREATE TABLE "mana_alias" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"value" integer NOT NULL,
	"character" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mana_alias" ADD CONSTRAINT "mana_alias_character_character_id_fk" FOREIGN KEY ("character") REFERENCES "public"."character"("id") ON DELETE no action ON UPDATE no action;