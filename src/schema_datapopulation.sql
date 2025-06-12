-- Books reference table (static data)
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  book_number INTEGER NOT NULL, -- 1-66
  name_spanish VARCHAR(50) NOT NULL,
  name_english VARCHAR(50) NOT NULL,
  testament VARCHAR(10) NOT NULL, -- 'old' or 'new'
  total_chapters INTEGER NOT NULL,
  total_verses INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters reference table (static data)
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  chapter_number INTEGER NOT NULL,
  verse_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, chapter_number)
);

-- Verses reference table (static data) - for exact tracking
CREATE TABLE verses (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  global_verse_id INTEGER NOT NULL UNIQUE, -- 1 to 31102
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, chapter_number, verse_number)
);

-- User profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading plans
CREATE TABLE reading_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  daily_verse_target INTEGER NOT NULL,
  estimated_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User's selected reading plan
CREATE TABLE user_reading_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  reading_plan_id INTEGER REFERENCES reading_plans(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual verse readings (core table)
CREATE TABLE verse_readings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  verse_id INTEGER REFERENCES verses(id),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, verse_id) -- Prevents duplicate progress counting
);

-- Daily reading sessions (for streak tracking)  
CREATE TABLE daily_readings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  reading_date DATE NOT NULL,
  verses_read_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reading_date)
);

-- Indexes for performance
CREATE INDEX idx_verse_readings_user_id ON verse_readings(user_id);
CREATE INDEX idx_verse_readings_read_at ON verse_readings(read_at);
CREATE INDEX idx_daily_readings_user_date ON daily_readings(user_id, reading_date);
CREATE INDEX idx_verses_global_id ON verses(global_verse_id);



-- Bible Reference Data Population for Reina Valera 1960
-- Run this after creating the schema

-- Insert Books (Reina Valera 1960)
INSERT INTO books (book_number, name_spanish, name_english, testament, total_chapters, total_verses) VALUES
-- Old Testament
--example, its already correctly applied in the DB
(1, 'Génesis', 'Genesis', 'old', 50, 1533),
(39, 'Malaquías', 'Malachi', 'old', 4, 55),
-- New Testament
(40, 'Mateo', 'Matthew', 'new', 28, 1071),
(66, 'Apocalipsis', 'Revelation', 'new', 22, 404);

-- Insert Chapters with verse counts
-- This is a large dataset, this is an example

-- Ruth chapters
INSERT INTO chapters (book_id, chapter_number, verse_count) VALUES
(8, 1, 22), (8, 2, 23), (8, 3, 18), (8, 4, 22);


-- New Testament books start here

-- Mark chapters
INSERT INTO chapters (book_id, chapter_number, verse_count) VALUES
(41, 1, 45), (41, 2, 28), (41, 3, 35), (41, 4, 41), (41, 5, 43),
(41, 6, 56), (41, 7, 37), (41, 8, 38), (41, 9, 50), (41, 10, 52),
(41, 11, 33), (41, 12, 44), (41, 13, 37), (41, 14, 72), (41, 15, 47),
(41, 16, 20);





-- Create function to populate verses table
CREATE OR REPLACE FUNCTION populate_verses()
RETURNS void AS $$
DECLARE
    book_rec RECORD;
    chapter_rec RECORD;
    verse_num INTEGER;
    global_id INTEGER := 1;
BEGIN
    -- Loop through all books and chapters to create verse records
    FOR book_rec IN SELECT id, book_number FROM books ORDER BY book_number LOOP
        FOR chapter_rec IN SELECT chapter_number, verse_count FROM chapters WHERE book_id = book_rec.id ORDER BY chapter_number LOOP
            FOR verse_num IN 1..chapter_rec.verse_count LOOP
                INSERT INTO verses (book_id, chapter_number, verse_number, global_verse_id)
                VALUES (book_rec.id, chapter_rec.chapter_number, verse_num, global_id);
                global_id := global_id + 1;
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert default reading plans
INSERT INTO reading_plans (name, description, daily_verse_target, estimated_days) VALUES
('Casual', 'Lectura relajada - perfecto para comenzar', 5, 6220),
('Regular', 'Lectura constante - un buen ritmo', 12, 2592),
('Comprometido', 'Lectura seria - dedicación diaria', 25, 1244),
('Intensivo', 'Lectura completa en un año', 85, 366),
('Rápido', 'Para lectores experimentados', 50, 622);

-- After running the above, execute the function to populate verses
-- SELECT populate_verses();

-- Verify total verse count
-- SELECT COUNT(*) FROM verses; -- Should be 31,102

