CREATE TABLE "clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url_id" uuid NOT NULL,
	"clicked_at" timestamp DEFAULT now() NOT NULL,
	"ip_hash" varchar(128) NOT NULL
);
CREATE TABLE "urls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"original_url" text NOT NULL,
	"short_code" varchar(32) NOT NULL,
	"custom_alias" varchar(64),
	"title" varchar(256),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "clicks_url_id_idx" ON "clicks" USING btree ("url_id");
CREATE INDEX "clicks_clicked_at_idx" ON "clicks" USING btree ("clicked_at");
CREATE UNIQUE INDEX "urls_short_code_idx" ON "urls" USING btree ("short_code");
CREATE UNIQUE INDEX "urls_custom_alias_idx" ON "urls" USING btree ("custom_alias");
CREATE INDEX "urls_user_id_idx" ON "urls" USING btree ("user_id");