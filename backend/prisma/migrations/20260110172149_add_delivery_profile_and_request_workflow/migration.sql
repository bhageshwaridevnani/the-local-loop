/*
  Warnings:

  - You are about to drop the column `rating` on the `deliveries` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "delivery_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 4.5,
    "total_deliveries" INTEGER NOT NULL DEFAULT 0,
    "vehicle_type" TEXT,
    "vehicle_number" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT false,
    "available_from" TEXT,
    "available_to" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "delivery_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "delivery_partner_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" DATETIME,
    "rejected_at" DATETIME,
    "pickup_time" DATETIME,
    "delivery_time" DATETIME,
    "rejection_reason" TEXT,
    "customer_rating" REAL,
    "vendor_rating" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deliveries_delivery_partner_id_fkey" FOREIGN KEY ("delivery_partner_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_deliveries" ("created_at", "delivery_partner_id", "delivery_time", "id", "order_id", "pickup_time", "status", "updated_at") SELECT "created_at", "delivery_partner_id", "delivery_time", "id", "order_id", "pickup_time", "status", "updated_at" FROM "deliveries";
DROP TABLE "deliveries";
ALTER TABLE "new_deliveries" RENAME TO "deliveries";
CREATE UNIQUE INDEX "deliveries_order_id_key" ON "deliveries"("order_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "delivery_profiles_user_id_key" ON "delivery_profiles"("user_id");
