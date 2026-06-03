-- ЛР5: додаємо поле ownerUserId для IDOR-захисту
-- Якщо колонка вже існує — міграція просто пропустить помилку (SQLite не підтримує IF NOT EXISTS для колонок)
ALTER TABLE AccessRequests ADD COLUMN ownerUserId INTEGER NOT NULL DEFAULT 1;