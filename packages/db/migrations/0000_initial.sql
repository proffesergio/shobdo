CREATE TYPE "public"."generation_status" AS ENUM('queued', 'running', 'completed', 'failed');
--> statement-breakpoint
CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"script_id" uuid NOT NULL,
	"voice_id" uuid,
	"status" "generation_status" DEFAULT 'queued' NOT NULL,
	"controls" jsonb NOT NULL,
	"audio_object_key" text,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "duration_nonnegative" CHECK ("generations"."duration_ms" is null or "generations"."duration_ms" >= 0)
);

--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scripts_id_owner_unique" UNIQUE("id","owner_id")
);

--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_subject" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_subject_unique" UNIQUE("auth_subject")
);

--> statement-breakpoint
CREATE TABLE "voice_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"policy_version" text NOT NULL,
	"accepted_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "consents_id_owner_unique" UNIQUE("id","owner_id")
);

--> statement-breakpoint
CREATE TABLE "voices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"consent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "voices_id_owner_unique" UNIQUE("id","owner_id")
);

--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_script_id_owner_id_scripts_id_owner_id_fk" FOREIGN KEY ("script_id","owner_id") REFERENCES "public"."scripts"("id","owner_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_voice_id_owner_id_voices_id_owner_id_fk" FOREIGN KEY ("voice_id","owner_id") REFERENCES "public"."voices"("id","owner_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "voice_consents" ADD CONSTRAINT "voice_consents_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "voices" ADD CONSTRAINT "voices_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "voices" ADD CONSTRAINT "voices_consent_id_owner_id_voice_consents_id_owner_id_fk" FOREIGN KEY ("consent_id","owner_id") REFERENCES "public"."voice_consents"("id","owner_id") ON DELETE no action ON UPDATE no action;
