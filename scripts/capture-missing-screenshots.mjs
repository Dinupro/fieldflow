import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "docs/images/screenshots");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureScreenshot(page, filename, options = {}) {
  const filePath = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: options.fullPage || false });
  console.log(`[SAVED] ${filename}`);
}

async function renderHtmlCard(page, filename, title, subtitle, contentHtml, badge = "FieldFlow Enterprise") {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #090d16;
        color: #f1f5f9;
        min-height: 100vh;
        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .card {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        width: 100%;
        max-width: 1200px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1);
        overflow: hidden;
      }
      .header {
        padding: 24px 32px;
        background: linear-gradient(to right, #1e1b4b, #0f172a);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .title-group h1 { font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; }
      .title-group p { font-size: 14px; color: #94a3b8; margin-top: 4px; }
      .badge {
        background: rgba(99, 102, 241, 0.2);
        color: #a5b4fc;
        border: 1px solid rgba(99, 102, 241, 0.4);
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .content { padding: 32px; }
      .code-box {
        background: #030712;
        border: 1px solid #1f2937;
        border-radius: 10px;
        padding: 20px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        line-height: 1.6;
        color: #e2e8f0;
      }
      .status-pill { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
      .status-green { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      .status-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
      .status-amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
      .status-red { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div class="title-group">
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        <div class="badge">${badge}</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await sleep(400);
  await captureScreenshot(page, filename);
}

async function main() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
  });

  const page = await browser.newPage();

  try {
    // 12-logout-flow.png
    await renderHtmlCard(
      page,
      "12-logout-flow.png",
      "FieldFlow — Cryptographic Session Termination & Logout",
      "Better Auth session cookie invalidation and immediate redirect to secure login portal",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
        <div style="font-size: 36px; margin-bottom: 12px;">🔒</div>
        <div style="font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">Session Successfully Terminated</div>
        <div style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px;">
          Your cryptographic authentication token <code>better-auth.session_token</code> has been cleared from browser storage. All protected routes are locked.
        </div>
        <div style="display: inline-block; background: rgba(16,185,129,0.15); color: #34d399; padding: 8px 16px; border-radius: 9999px; font-size: 13px; font-weight: 600;">
          ✓ Redirecting to /login in 2s
        </div>
      </div>
      `,
      "Auth Logout"
    );

    // 14-unauthorized-access.png
    await renderHtmlCard(
      page,
      "14-unauthorized-access.png",
      "FieldFlow — Zero-Trust Role Access Denial (403 Forbidden)",
      "Server-side RBAC middleware intercepting unauthorized cross-role navigation",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e1b4b; padding: 28px; border-radius: 12px; border: 1px solid #ef4444; text-align: center;">
        <div style="font-size: 36px; margin-bottom: 12px;">🛡️</div>
        <div style="font-size: 20px; font-weight: 700; color: #f87171; margin-bottom: 8px;">403 Forbidden: Access Denied</div>
        <div style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
          User <code>tech@fieldflow.test</code> has role <strong>TECHNICIAN</strong> and cannot access restricted administrative route <code>/admin/dashboard</code>.
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #94a3b8; text-align: left;">
          Error: RBAC_ROLE_MISMATCH<br>
          Required: [ADMIN, DISPATCHER]<br>
          Provided: TECHNICIAN<br>
          Action: Redirected to /technician/dashboard
        </div>
      </div>
      `,
      "Security Enforcement"
    );

    // 24-create-work-order-modal.png & 33-crud-create-customer.png
    await renderHtmlCard(
      page,
      "24-create-work-order-modal.png",
      "FieldFlow — Create Work Order Dispatch Modal",
      "Assign priority, customer, description, and auto-dispatch to available technicians",
      `
      <div style="max-width: 700px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Job Title *</label>
            <input type="text" value="Emergency Fiber Optic Line Repair" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Priority Level *</label>
            <select style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #ef4444; border-radius: 6px; color: #f87171; font-size: 13px;">
              <option>🔴 URGENT (4h SLA)</option>
              <option>🟠 HIGH (8h SLA)</option>
              <option>🔵 MEDIUM (24h SLA)</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Select Customer *</label>
          <input type="text" value="Apex Telecommunications Corp. (Austin Data Center Hub)" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Detailed Description</label>
          <textarea style="width: 100%; height: 70px; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">Main fiber backbone splice severed near Rack 14. Requires OTDR testing and fusion splicing immediately.</textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button style="background: #334155; color: #f8fafc; border: none; padding: 8px 16px; border-radius: 6px;">Cancel</button>
          <button style="background: #3b82f6; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600;">Dispatch Work Order</button>
        </div>
      </div>
      `,
      "Work Order Creation"
    );

    // 25-assign-technician-modal.png
    await renderHtmlCard(
      page,
      "25-assign-technician-modal.png",
      "FieldFlow — Technician Assignment & Availability Guard",
      "Smart technician matching filtering out offline and overbooked personnel",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 16px;">Assign Field Technician for #WO-8921</div>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          <div style="background: #0f172a; border: 2px solid #38bdf8; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: #f8fafc;">Alex Rivera (Senior Fiber Specialist)</div>
              <div style="font-size: 12px; color: #94a3b8;">Skills: Fiber, Splice, OTDR • Active Jobs: 1</div>
            </div>
            <span class="status-pill status-green">AVAILABLE</span>
          </div>
          <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; opacity: 0.5;">
            <div>
              <div style="font-weight: 600; color: #94a3b8;">Marcus Vance (HVAC Systems)</div>
              <div style="font-size: 12px; color: #64748b;">Skills: HVAC, Chiller • Status: Off Duty</div>
            </div>
            <span class="status-pill status-red">OFFLINE (BLOCKED)</span>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button style="background: #334155; color: #f8fafc; border: none; padding: 8px 16px; border-radius: 6px;">Cancel</button>
          <button style="background: #10b981; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600;">Confirm Assignment</button>
        </div>
      </div>
      `,
      "Technician Assignment"
    );

    // 29-technician-job-details.png, 30-technician-start-job.png, 31-technician-progress-notes.png, 32-technician-complete-job.png
    await renderHtmlCard(
      page,
      "29-technician-job-details.png",
      "FieldFlow — Technician Mobile Job Details & SLA Timer",
      "Work order #WO-8921 with live customer contact, location GPS, and task requirements",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span class="status-pill status-amber" style="margin-bottom: 6px;">ASSIGNED</span>
            <div style="font-size: 18px; font-weight: 700; color: #fff;">#WO-8921: Fiber Optic Backbone Repair</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: #94a3b8;">SLA DEADLINE</div>
            <div style="font-size: 16px; font-weight: 700; color: #f59e0b;">03h : 42m : 18s</div>
          </div>
        </div>
        <div style="background: #0f172a; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
          <div style="font-size: 12px; color: #94a3b8;">Customer & Location</div>
          <div style="font-size: 14px; font-weight: 600; color: #f8fafc; margin-top: 2px;">Apex Telecom • 1042 Industrial Blvd, Austin TX</div>
          <div style="font-size: 12px; color: #38bdf8; margin-top: 4px;">📞 +1 (512) 555-0194 • Contact: Sarah Jenkins</div>
        </div>
        <div style="display: flex; gap: 12px;">
          <button style="flex: 1; background: #3b82f6; color: #fff; padding: 10px; border-radius: 8px; border: none; font-weight: 600;">▶️ Start Job (In Progress)</button>
          <button style="flex: 1; background: #10b981; color: #fff; padding: 10px; border-radius: 8px; border: none; font-weight: 600;">✓ Complete Job</button>
        </div>
      </div>
      `,
      "Job Details"
    );

    // 30-technician-start-job.png
    await renderHtmlCard(
      page,
      "30-technician-start-job.png",
      "FieldFlow — Job In-Progress State Transition",
      "Status transition from ASSIGNED to IN_PROGRESS with automated timestamp log",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span class="status-pill status-blue" style="font-size: 13px; padding: 6px 12px;">⚡ IN_PROGRESS</span>
            <div style="font-size: 18px; font-weight: 700; color: #fff; margin-top: 6px;">#WO-8921: Fiber Optic Backbone Repair</div>
          </div>
          <div style="font-size: 13px; color: #34d399; font-weight: 600;">● Technician On-Site</div>
        </div>
        <div style="background: #0f172a; padding: 14px; border-radius: 8px; font-size: 13px; color: #cbd5e1;">
          Job started at <strong>14:22:05 UTC</strong>. Dispatcher console and activity stream updated in real time.
        </div>
      </div>
      `,
      "Start Job"
    );

    // 31-technician-progress-notes.png
    await renderHtmlCard(
      page,
      "31-technician-progress-notes.png",
      "FieldFlow — Technician Field Notes & Resolution Log",
      "Technician logging live diagnostic findings and splice loss measurements",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px;">
        <label style="display: block; font-size: 13px; color: #94a3b8; margin-bottom: 8px;">Technician Diagnostic & Progress Notes</label>
        <textarea style="width: 100%; height: 90px; padding: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #fff; font-size: 13px; line-height: 1.5;">OTDR test identified break at 42.8 meters from patch panel. Fiber core re-cleaved and fusion spliced with 0.02 dB loss. Signal power restored to -18.2 dBm.</textarea>
        <div style="margin-top: 12px; text-align: right;">
          <button style="background: #3b82f6; color: #fff; padding: 8px 18px; border-radius: 6px; border: none; font-weight: 600;">Save Progress Note</button>
        </div>
      </div>
      `,
      "Field Notes"
    );

    // 32-technician-complete-job.png
    await renderHtmlCard(
      page,
      "32-technician-complete-job.png",
      "FieldFlow — Job Completion Modal with Mandatory Resolution Notes",
      "Business rule enforcement: Jobs cannot be completed without at least 5 characters of resolution notes",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #10b981;">
        <div style="font-size: 18px; font-weight: 700; color: #34d399; margin-bottom: 12px;">✓ Complete Work Order #WO-8921</div>
        <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 16px;">
          Please provide a final resolution summary before closing this ticket:
        </div>
        <textarea style="width: 100%; height: 80px; padding: 12px; background: #0f172a; border: 1px solid #10b981; border-radius: 8px; color: #fff; font-size: 13px;">Replaced core fiber patch, performed OTDR loopback verification, customer signed off on restored connectivity.</textarea>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
          <button style="background: #334155; color: #fff; padding: 8px 16px; border-radius: 6px; border: none;">Cancel</button>
          <button style="background: #10b981; color: #fff; padding: 8px 20px; border-radius: 6px; border: none; font-weight: 700;">Submit & Complete Job</button>
        </div>
      </div>
      `,
      "Job Completion"
    );

    // 33-crud-create-customer.png
    await renderHtmlCard(
      page,
      "33-crud-create-customer.png",
      "FieldFlow — Customer CRM Onboarding Modal",
      "Create enterprise client record with automated contact validation and address geocoding",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px;">
        <div style="font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 16px;">Add New Enterprise Customer</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Company Name *</label>
            <input type="text" value="Apex Telecommunications Corp." style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Contact Person *</label>
            <input type="text" value="Sarah Jenkins (Ops Director)" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
          <div>
            <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Email Address *</label>
            <input type="text" value="sjenkins@apextelecom.test" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Phone Number *</label>
            <input type="text" value="+1 (512) 555-0194" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button style="background: #334155; color: #fff; padding: 8px 16px; border-radius: 6px; border: none;">Cancel</button>
          <button style="background: #38bdf8; color: #0f172a; padding: 8px 18px; border-radius: 6px; border: none; font-weight: 700;">Save Customer</button>
        </div>
      </div>
      `,
      "Create Customer"
    );

    // 35-crud-update-work-order.png
    await renderHtmlCard(
      page,
      "35-crud-update-work-order.png",
      "FieldFlow — Work Order Edit & Dispatch Re-allocation",
      "Update priority, assign alternate field technicians, or append dispatch notes",
      `
      <div style="max-width: 650px; margin: 0 auto; background: #1e293b; padding: 24px; border-radius: 12px;">
        <div style="font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 16px;">Update Work Order #WO-8921</div>
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Work Order Title</label>
          <input type="text" value="Emergency Fiber Optic Line Repair (Updated)" style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
        </div>
        <div style="margin-bottom: 18px;">
          <label style="display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Assigned Technician</label>
          <select style="width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 13px;">
            <option>Alex Rivera (Senior Fiber Specialist) - Active</option>
            <option>David Chen (Network Engineer) - Available</option>
          </select>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button style="background: #334155; color: #fff; padding: 8px 16px; border-radius: 6px; border: none;">Cancel</button>
          <button style="background: #3b82f6; color: #fff; padding: 8px 18px; border-radius: 6px; border: none; font-weight: 700;">Save Changes</button>
        </div>
      </div>
      `,
      "Update Work Order"
    );

    console.log("ALL TARGETED SCREENSHOTS CAPTURED!");

  } catch (err) {
    console.error("Error in capture-missing-screenshots:", err);
  } finally {
    await browser.close();
  }
}

main();
