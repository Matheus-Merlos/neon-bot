ALTER TABLE "mana_alias" DROP CONSTRAINT "mana_alias_character_character_id_fk";
--> statement-breakpoint
ALTER TABLE "mana_alias" ADD CONSTRAINT "mana_alias_character_character_id_fk" FOREIGN KEY ("character") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE cascade;