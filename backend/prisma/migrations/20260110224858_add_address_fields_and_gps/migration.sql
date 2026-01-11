-- AlterTable
ALTER TABLE "users" ADD COLUMN "address" TEXT;
ALTER TABLE "users" ADD COLUMN "city" TEXT;
ALTER TABLE "users" ADD COLUMN "landmark" TEXT;
ALTER TABLE "users" ADD COLUMN "latitude" REAL;
ALTER TABLE "users" ADD COLUMN "longitude" REAL;
ALTER TABLE "users" ADD COLUMN "pincode" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_vendors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "landmark" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Ahmedabad',
    "pincode" TEXT NOT NULL DEFAULT '380001',
    "latitude" REAL,
    "longitude" REAL,
    "category" TEXT,
    "rating" REAL NOT NULL DEFAULT 4.5,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "commission_rate" REAL NOT NULL DEFAULT 5.0,
    "area_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "vendors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vendors_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_vendors" ("address", "area_id", "category", "commission_rate", "created_at", "id", "is_active", "rating", "review_count", "shop_name", "updated_at", "user_id") SELECT "address", "area_id", "category", "commission_rate", "created_at", "id", "is_active", "rating", "review_count", "shop_name", "updated_at", "user_id" FROM "vendors";
DROP TABLE "vendors";
ALTER TABLE "new_vendors" RENAME TO "vendors";
CREATE UNIQUE INDEX "vendors_user_id_key" ON "vendors"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
