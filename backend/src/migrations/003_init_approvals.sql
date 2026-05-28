CREATE TABLE IF NOT EXISTS Approvals (
  id INTEGER PRIMARY KEY,
  accessRequestId INTEGER NOT NULL,
  approverId INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('Approved', 'Rejected')),
  notes TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (accessRequestId) REFERENCES AccessRequests(id) ON DELETE CASCADE,
  FOREIGN KEY (approverId) REFERENCES Users(id) ON DELETE RESTRICT
);