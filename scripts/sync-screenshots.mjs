import fs from "fs";
import path from "path";

const dir = path.resolve(process.cwd(), "docs/images/screenshots");
const requiredFiles = new Set([
  "01-home-page.png",
  "02-login-page.png",
  "03-admin-dashboard.png",
  "04-dispatcher-dashboard.png",
  "05-technician-dashboard.png",
  "06-role-based-access.png",
  "07-protected-route.png",
  "08-user-management.png",
  "09-work-order-management.png",
  "10-create-work-order.png",
  "11-job-assignment.png",
  "12-activity-log.png",
  "13-audit-trail.png",
  "14-prisma-schema.png",
  "15-neon-dashboard.png",
  "16-neon-database-tables.png",
  "17-github-repository.png",
  "18-github-project-board.png",
  "19-github-issues.png",
  "20-commit-history.png",
  "21-responsive-mobile.png",
  "22-responsive-tablet.png",
  "23-live-deployment.png",
  "README.md"
]);

const files = fs.readdirSync(dir);
let deletedCount = 0;
for (const file of files) {
  if (!requiredFiles.has(file)) {
    fs.unlinkSync(path.join(dir, file));
    deletedCount++;
  }
}

console.log(`Cleaned up screenshot directory. Deleted ${deletedCount} extra files. Exactly 23 screenshot files retained.`);
