-- Ordem de exibição das mídias de um post do feed (0 = primeira).
-- Posts antigos ficam todos com 0; a ordem entre eles segue como está.
ALTER TABLE fed_midia ADD COLUMN IF NOT EXISTS ordem INTEGER NOT NULL DEFAULT 0;
