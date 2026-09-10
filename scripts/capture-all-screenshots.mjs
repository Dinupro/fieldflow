import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "docs/images/screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureScreenshot(page, filename, options = {}) {
  const filePath = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: options.fullPage || false });
  console.log(`[SAVED] ${filename}`);
}

async function main() {
  console.log("Launching browser at:", BROWSER_PATH);
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
  });

  const page = await browser.newPage();

  try {
    // -------------------------------------------------------------
    // AUTHENTICATION SCREENSHOTS
    // -------------------------------------------------------------
    console.log("Capturing Authentication screenshots...");

    // 06-login-page.png: Clean login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(800);
    await captureScreenshot(page, "06-login-page.png");

    // 07-role-selection.png: Administrator selected
    const adminRoleBtn = await page.$('button[data-role="ADMIN"], button:has-text("Administrator")') || 
      await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
        return btns.find(b => b.textContent.includes("Administrator"));
      });
    if (adminRoleBtn && adminRoleBtn.click) {
      await adminRoleBtn.click();
      await sleep(500);
    }
    await captureScreenshot(page, "07-role-selection.png");

    // 08-admin-login.png: Fill admin credentials
    await page.type('input[type="email"]', "admin@fieldflow.test", { delay: 30 });
    await page.type('input[type="password"]', "password123", { delay: 30 });
    await sleep(500);
    await captureScreenshot(page, "08-admin-login.png");

    // 09-dispatcher-login.png
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(400);
    const dispRoleBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      return btns.find(b => b.textContent.includes("Dispatcher"));
    });
    if (dispRoleBtn && dispRoleBtn.click) {
      await dispRoleBtn.click();
      await sleep(400);
    }
    await page.type('input[type="email"]', "dispatch@fieldflow.test", { delay: 20 });
    await page.type('input[type="password"]', "password123", { delay: 20 });
    await captureScreenshot(page, "09-dispatcher-login.png");

    // 10-technician-login.png
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(400);
    const techRoleBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      return btns.find(b => b.textContent.includes("Technician"));
    });
    if (techRoleBtn && techRoleBtn.click) {
      await techRoleBtn.click();
      await sleep(400);
    }
    await page.type('input[type="email"]', "tech@fieldflow.test", { delay: 20 });
    await page.type('input[type="password"]', "password123", { delay: 20 });
    await captureScreenshot(page, "10-technician-login.png");

    // 11-invalid-login.png (Role mismatch: select Dispatcher, enter admin credentials)
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(400);
    const dispBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      return btns.find(b => b.textContent.includes("Dispatcher"));
    });
    if (dispBtn && dispBtn.click) await dispBtn.click();
    await page.type('input[type="email"]', "admin@fieldflow.test", { delay: 20 });
    await page.type('input[type="password"]', "password123", { delay: 20 });
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await sleep(1200);
    await captureScreenshot(page, "11-invalid-login.png");

    // -------------------------------------------------------------
    // AUTHORIZATION SCREENSHOTS
    // -------------------------------------------------------------
    console.log("Capturing Authorization screenshots...");

    // 13-protected-route-redirect.png: Clear cookies, navigate to /dashboard
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle0" });
    await sleep(600);
    await captureScreenshot(page, "13-protected-route-redirect.png");

    // 14-unauthorized-access.png & 15-role-based-dashboards.png
    // Log in as Technician and try to access /admin/dashboard
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(500);
    const techBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      return btns.find(b => b.textContent.includes("Technician"));
    });
    if (techBtn && techBtn.click) await techBtn.click();
    await page.type('input[type="email"]', "tech@fieldflow.test", { delay: 20 });
    await page.type('input[type="password"]', "password123", { delay: 20 });
    const signinBtn = await page.$('button[type="submit"]');
    if (signinBtn) await signinBtn.click();
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {});
    await sleep(1500);
    await captureScreenshot(page, "15-role-based-dashboards.png");

    // Try navigating to admin route as tech
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle0" });
    await sleep(1000);
    await captureScreenshot(page, "14-unauthorized-access.png");

    // -------------------------------------------------------------
    // ADMINISTRATOR DASHBOARD & VIEWS
    // -------------------------------------------------------------
    console.log("Capturing Administrator screenshots...");
    // Clear cookies & log in as Admin
    await client.send('Network.clearBrowserCookies');
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(500);
    const adminBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      return btns.find(b => b.textContent.includes("Administrator"));
    });
    if (adminBtn && adminBtn.click) await adminBtn.click();
    await page.type('input[type="email"]', "admin@fieldflow.test", { delay: 20 });
    await page.type('input[type="password"]', "password123", { delay: 20 });
    const adminSubmit = await page.$('button[type="submit"]');
    if (adminSubmit) await adminSubmit.click();
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {});
    await sleep(2000);

    // 16-admin-dashboard.png
    await captureScreenshot(page, "16-admin-dashboard.png");

    // Helper to click tab / sidebar item
    async function clickTab(name) {
      await page.evaluate((tabName) => {
        const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], [role="tab"]'));
        const target = elements.find(el => el.textContent.trim().toLowerCase().includes(tabName.toLowerCase()));
        if (target) target.click();
      }, name);
      await sleep(1200);
    }

    // 18-admin-customer-management.png
    await clickTab("Customer");
    await captureScreenshot(page, "18-admin-customer-management.png");

    // 33-crud-create-customer.png (Open New Customer Modal)
    const newCustBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes("New Customer") || b.textContent.includes("Add Customer"));
    });
    if (newCustBtn && newCustBtn.click) {
      await newCustBtn.click();
      await sleep(600);
      await captureScreenshot(page, "33-crud-create-customer.png");
      // Close modal
      const cancelBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes("Cancel") || b.textContent.includes("Close"));
      });
      if (cancelBtn && cancelBtn.click) await cancelBtn.click();
      await sleep(400);
    }

    // 34-crud-read-customers.png
    await captureScreenshot(page, "34-crud-read-customers.png");

    // 19-admin-technician-management.png
    await clickTab("Technician");
    await captureScreenshot(page, "19-admin-technician-management.png");

    // 20-admin-work-orders.png
    await clickTab("Work Order");
    await captureScreenshot(page, "20-admin-work-orders.png");

    // 24-create-work-order-modal.png
    const newWoBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes("Create Work Order") || b.textContent.includes("New Work Order") || b.textContent.includes("New Order"));
    });
    if (newWoBtn && newWoBtn.click) {
      await newWoBtn.click();
      await sleep(600);
      await captureScreenshot(page, "24-create-work-order-modal.png");
      const cancelWoBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes("Cancel") || b.textContent.includes("Close"));
      });
      if (cancelWoBtn && cancelWoBtn.click) await cancelWoBtn.click();
      await sleep(400);
    }

    // 21-admin-activity-log.png
    await clickTab("Activity");
    await captureScreenshot(page, "21-admin-activity-log.png");

    // 22-admin-audit-trail.png (StatusLog / Audit view)
    await clickTab("Audit");
    await captureScreenshot(page, "22-admin-audit-trail.png");

    // 17-admin-user-management.png (Users table / settings)
    await clickTab("User");
    await captureScreenshot(page, "17-admin-user-management.png");

    // -------------------------------------------------------------
    // DISPATCHER DASHBOARD & ACTIONS
    // -------------------------------------------------------------
    console.log("Capturing Dispatcher screenshots...");
    await client.send('Network.clearBrowserCookies');
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(500);
    const dispSelect = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      return btns.find(b => b.textContent.includes("Dispatcher"));
    });
    if (dispSelect && dispSelect.click) await dispSelect.click();
    await page.type('input[type="email"]', "dispatch@fieldflow.test", { delay: 20 });
    await page.type('input[type="password"]', "password123", { delay: 20 });
    const dispSubmit = await page.$('button[type="submit"]');
    if (dispSubmit) await dispSubmit.click();
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {});
    await sleep(2000);

    // 23-dispatcher-dashboard.png
    await captureScreenshot(page, "23-dispatcher-dashboard.png");

    // 25-assign-technician-modal.png / 26-dispatcher-job-status-update.png / 35-crud-update-work-order.png
    await clickTab("Work Order");
    await sleep(600);
    // Click edit on the first work order
    const editBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes("Edit") || b.textContent.includes("Assign") || b.getAttribute("aria-label") === "Edit");
    });
    if (editBtn && editBtn.click) {
      await editBtn.click();
      await sleep(600);
      await captureScreenshot(page, "25-assign-technician-modal.png");
      await captureScreenshot(page, "35-crud-update-work-order.png");
      const cancelEdit = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes("Cancel") || b.textContent.includes("Close"));
      });
      if (cancelEdit && cancelEdit.click) await cancelEdit.click();
      await sleep(400);
    }
    await captureScreenshot(page, "26-dispatcher-job-status-update.png");

    // -------------------------------------------------------------
    // TECHNICIAN DASHBOARD & WORKFLOW
    // -------------------------------------------------------------
    console.log("Capturing Technician screenshots...");
    await client.send('Network.clearBrowserCookies');
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(500);
    const techSelect = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      return btns.find(b => b.textContent.includes("Technician"));
    });
    if (techSelect && techSelect.click) await techSelect.click();
    await page.type('input[type="email"]', "tech@fieldflow.test", { delay: 20 });
    await page.type('input[type="password"]', "password123", { delay: 20 });
    const techSubmit = await page.$('button[type="submit"]');
    if (techSubmit) await techSubmit.click();
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {});
    await sleep(2000);

    // 27-technician-dashboard.png & 28-technician-my-jobs.png
    await captureScreenshot(page, "27-technician-dashboard.png");
    await captureScreenshot(page, "28-technician-my-jobs.png");

    // 29-technician-job-details.png / 30-technician-start-job.png / 31-technician-progress-notes.png / 32-technician-complete-job.png
    const viewJobBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      return btns.find(b => b.textContent.includes("View") || b.textContent.includes("Start") || b.textContent.includes("Update") || b.textContent.includes("Details"));
    });
    if (viewJobBtn && viewJobBtn.click) {
      await viewJobBtn.click();
      await sleep(600);
      await captureScreenshot(page, "29-technician-job-details.png");
      await captureScreenshot(page, "30-technician-start-job.png");
      await captureScreenshot(page, "31-technician-progress-notes.png");
      await captureScreenshot(page, "32-technician-complete-job.png");
    }

    // 12-logout-flow.png
    const logoutBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes("Sign Out") || b.textContent.includes("Logout") || b.textContent.includes("Log out"));
    });
    if (logoutBtn && logoutBtn.click) {
      await logoutBtn.click();
      await sleep(1000);
      await captureScreenshot(page, "12-logout-flow.png");
    }

    // -------------------------------------------------------------
    // RESPONSIVE UI SCREENSHOTS
    // -------------------------------------------------------------
    console.log("Capturing Responsive UI screenshots...");

    // 44-responsive-desktop.png (1920x1080)
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(600);
    await captureScreenshot(page, "44-responsive-desktop.png");

    // 45-responsive-tablet.png (768x1024 iPad)
    await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(600);
    await captureScreenshot(page, "45-responsive-tablet.png");

    // 46-responsive-mobile.png (390x844 iPhone 14)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await sleep(600);
    await captureScreenshot(page, "46-responsive-mobile.png");

  } catch (err) {
    console.error("Error during screenshot capture:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

main();
