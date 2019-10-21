CREATE TABLE packrat_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  year_released INTEGER NOT NULL,
  info TEXT NOT NULL,
  image_url VARCHAR(2000),
  collection_id INTEGER
    REFERENCES packrat_collections(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE packrat_collections
  ADD COLUMN
    user_id INTEGER REFERENCES packrat_users(id) ON DELETE SET NULL NOT NULL;