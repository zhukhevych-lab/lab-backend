import { migrate } from "./migrate";
import { run } from "./dbClient";

async function seed(): Promise<void> {
  await migrate();

  const now = new Date().toISOString();

  await run(`INSERT OR IGNORE INTO Users (name, email, createdAt)
    VALUES ('Ivan Petrenko', 'ivan@example.com', '${now}');`);

  await run(`INSERT OR IGNORE INTO Users (name, email, createdAt)
    VALUES ('Olena Kovalenko', 'olena@example.com', '${now}');`);

  await run(`INSERT OR IGNORE INTO Users (name, email, createdAt)
    VALUES ('Mykola Shevchenko', 'mykola@example.com', '${now}');`);

  await run(`INSERT OR IGNORE INTO AccessRequests (userId, date, accessType, comments, status, createdAt)
    VALUES (1, '2026-05-01T10:00:00Z', 'Read', 'Need access for research', 'Pending', '${now}');`);

  await run(`INSERT OR IGNORE INTO AccessRequests (userId, date, accessType, comments, status, createdAt)
    VALUES (2, '2026-05-02T11:00:00Z', 'Write', 'Project work access needed', 'Approved', '${now}');`);

  await run(`INSERT OR IGNORE INTO AccessRequests (userId, date, accessType, comments, status, createdAt)
    VALUES (3, '2026-05-03T12:00:00Z', 'Admin', 'Admin access for maintenance', 'Rejected', '${now}');`);

  await run(`INSERT OR IGNORE INTO AccessRequests (userId, date, accessType, comments, status, createdAt)
    VALUES (1, '2026-05-04T09:00:00Z', 'Write', 'Lab experiment access', 'Pending', '${now}');`);

  await run(`INSERT OR IGNORE INTO AccessRequests (userId, date, accessType, comments, status, createdAt)
    VALUES (2, '2026-05-05T14:00:00Z', 'Read', 'Reading lab materials', 'Approved', '${now}');`);

  await run(`INSERT OR IGNORE INTO Approvals (accessRequestId, approverId, decision, notes, createdAt)
    VALUES (2, 1, 'Approved', 'All requirements met', '${now}');`);

  await run(`INSERT OR IGNORE INTO Approvals (accessRequestId, approverId, decision, notes, createdAt)
    VALUES (3, 1, 'Rejected', 'Insufficient justification', '${now}');`);

  await run(`INSERT OR IGNORE INTO Approvals (accessRequestId, approverId, decision, notes, createdAt)
    VALUES (5, 2, 'Approved', 'Standard read access granted', '${now}');`);

  console.log("Seed completed successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});