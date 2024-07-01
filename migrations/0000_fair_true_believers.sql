CREATE TABLE IF NOT EXISTS "categoria" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"descricao" varchar(63) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventario" (
	"id" serial NOT NULL,
	"id_item" integer NOT NULL,
	"id_personagem" integer NOT NULL,
	"durabilidade_atual" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(127) NOT NULL,
	"descricao" text NOT NULL,
	"preco" integer NOT NULL,
	"durabilidade" integer NOT NULL,
	"categoria" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jogador" (
	"discord_id" bigint PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "npc" (
	"id" serial PRIMARY KEY NOT NULL,
	"jogador" bigint NOT NULL,
	"sintaxe" varchar(15) NOT NULL,
	"webhook_discord_id" text NOT NULL,
	"webhook_token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personagem" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(127) NOT NULL,
	"xp" integer NOT NULL,
	"gold" integer NOT NULL,
	"jogador" bigint NOT NULL,
	"ativo" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rank" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"descricao" varchar(63) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rank_personagem" (
	"id" serial NOT NULL,
	"id_rank" integer NOT NULL,
	"id_personagem" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_item_item_id_fk" FOREIGN KEY ("id_item") REFERENCES "public"."item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_personagem_personagem_id_fk" FOREIGN KEY ("id_personagem") REFERENCES "public"."personagem"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item" ADD CONSTRAINT "item_categoria_categoria_id_fk" FOREIGN KEY ("categoria") REFERENCES "public"."categoria"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "npc" ADD CONSTRAINT "npc_jogador_jogador_discord_id_fk" FOREIGN KEY ("jogador") REFERENCES "public"."jogador"("discord_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personagem" ADD CONSTRAINT "personagem_jogador_jogador_discord_id_fk" FOREIGN KEY ("jogador") REFERENCES "public"."jogador"("discord_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_personagem" ADD CONSTRAINT "rank_personagem_id_rank_rank_id_fk" FOREIGN KEY ("id_rank") REFERENCES "public"."rank"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rank_personagem" ADD CONSTRAINT "rank_personagem_id_personagem_personagem_id_fk" FOREIGN KEY ("id_personagem") REFERENCES "public"."personagem"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
