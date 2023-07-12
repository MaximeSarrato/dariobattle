CREATE TABLE users (
  login VARCHAR(255) PRIMARY KEY,
  password VARCHAR(255),
  games INT DEFAULT 0,
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);