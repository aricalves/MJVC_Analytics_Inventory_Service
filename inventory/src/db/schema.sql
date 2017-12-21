
DROP TABLE IF EXISTS "review"

CREATE TABLE "review" (
"id"  SERIAL ,
"experience_id" INTEGER ,
"user_id" INTEGER ,
"rating" INTEGER ,
"body" TEXT ,
"timestamp" TIMESTAMP ,
PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "category"

CREATE TABLE "category" (
"id"  SERIAL ,
"title" TEXT ,
PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "host"

CREATE TABLE "host" (
"id"  SERIAL ,
"first_name" TEXT ,
"last_name" TEXT ,
"description" TEXT ,
"photo_url" TEXT ,
PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "experience"

CREATE TABLE "experience" (
"id"  SERIAL ,
"title" TEXT ,
"description" TEXT ,
"photo_url" TEXT ,
"is_available" BOOLEAN ,
"rating" INTEGER ,
"review_count" INTEGER ,
"price" INTEGER ,
"location_id" INTEGER ,
"host_id" INTEGER ,
"categories_id" INTEGER ,
PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "location"

CREATE TABLE "location" (
"id"  SERIAL ,
"country" TEXT ,
"state" TEXT ,
"city" TEXT ,
"address" TEXT ,
PRIMARY KEY ("id")
);

ALTER TABLE "review" ADD FOREIGN KEY ("experience_id") REFERENCES "experience" ("id");
ALTER TABLE "experience" ADD FOREIGN KEY ("location_id") REFERENCES "location" ("id");
ALTER TABLE "experience" ADD FOREIGN KEY ("host_id") REFERENCES "host" ("id");
ALTER TABLE "experience" ADD FOREIGN KEY ("categories_id") REFERENCES "category" ("id");