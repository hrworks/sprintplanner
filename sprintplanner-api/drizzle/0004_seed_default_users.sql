-- Seed default users for local development
INSERT OR IGNORE INTO users (id, email, name, google_id, role, status, created_at) 
VALUES 
  ('dev-user-1', 'simon.franz@hrworks.de', 'Simon Franz', 'dev-google-1', 'admin', 'active', unixepoch()),
  ('dev-user-2', 'simon.franz+2@hrworks.de', 'Simon Franz 2', 'dev-google-2', 'user', 'active', unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO user_settings (user_id, show_my_cursor, show_other_cursors)
VALUES
  ('dev-user-1', 1, 1),
  ('dev-user-2', 1, 1);
