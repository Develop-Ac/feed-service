-- AlterTable: Add 'municipio' column to support city names from new API
ALTER TABLE "sis_feriados" ADD COLUMN "municipio" TEXT;

-- Update data: Set 'municipio' to 'SORRISO' where codigo_ibge is 5107909 or 5106250 (legacy) if applicable
UPDATE "sis_feriados" SET "municipio" = 'SORRISO' WHERE "codigo_ibge" IN (5107909, 5106250);

-- Optional: You might want to clear old holidays to re-sync cleanly with the new API
-- DELETE FROM "sis_feriados" WHERE "ano" >= EXTRACT(YEAR FROM CURRENT_DATE);
