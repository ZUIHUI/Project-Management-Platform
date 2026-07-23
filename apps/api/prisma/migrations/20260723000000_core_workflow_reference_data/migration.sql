-- The API contract creates every new Issue in the canonical `todo` status.
-- Keep this product reference data in migrations so a production database is
-- usable after `prisma migrate deploy` without loading demo seed fixtures.
INSERT INTO "Status" ("id", "name", "order")
VALUES
  ('todo', 'Todo', 1),
  ('doing', 'Doing', 2),
  ('done', 'Done', 3)
ON CONFLICT ("id") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "order" = EXCLUDED."order";

INSERT INTO "Transition" ("fromStatusId", "toStatusId")
VALUES
  ('todo', 'doing'),
  ('doing', 'todo'),
  ('doing', 'done'),
  ('done', 'doing')
ON CONFLICT ("fromStatusId", "toStatusId") DO NOTHING;
