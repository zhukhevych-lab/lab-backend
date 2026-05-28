CREATE TABLE IF NOT EXISTS AccessRequests (
  id INTEGER PRIMARY KEY,
  userId INTEGER NOT NULL,
  date TEXT NOT NULL,
  accessType TEXT NOT NULL CHECK (accessType IN ('Read', 'Write', 'Admin')),
  comments TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);