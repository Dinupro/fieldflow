import "dotenv/config";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "crypto";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  console.log("Connected to PostgreSQL database. Starting seed...");

  try {
    // 0. Ensure Enum and Column DDL Updates (must be outside transaction block in PostgreSQL)
    await client.query(`ALTER TYPE "WorkOrderStatus" ADD VALUE IF NOT EXISTS 'ACCEPTED'`);
    await client.query(`ALTER TYPE "WorkOrderStatus" ADD VALUE IF NOT EXISTS 'PAUSED'`);
    await client.query(`ALTER TYPE "WorkOrderStatus" ADD VALUE IF NOT EXISTS 'CLOSED'`);
    await client.query(`ALTER TABLE "StatusLog" ADD COLUMN IF NOT EXISTS "notes" TEXT`);
    console.log("PostgreSQL enum and StatusLog DDL verified and committed.");

    await client.query("BEGIN");

    const defaultPassword = "password123";
    const hashedPassword = await hashPassword(defaultPassword);

    console.log("Hashed demo password successfully.");

    // Helper to upsert user and account
    async function upsertUser(email, name, role) {
      // Check if user exists
      const existing = await client.query('SELECT id FROM "user" WHERE email = $1', [email]);
      let userId;

      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        await client.query(
          'UPDATE "user" SET name = $1, role = $2, "updatedAt" = NOW() WHERE id = $3',
          [name, role, userId]
        );
      } else {
        userId = randomUUID();
        await client.query(
          'INSERT INTO "user" (id, email, name, "emailVerified", role, "createdAt", "updatedAt") VALUES ($1, $2, $3, true, $4, NOW(), NOW())',
          [userId, email, name, role]
        );
      }

      // Upsert credential account in "account" table
      const existingAccount = await client.query(
        'SELECT id FROM "account" WHERE "userId" = $1 AND "providerId" = $2',
        [userId, "credential"]
      );

      if (existingAccount.rows.length > 0) {
        await client.query(
          'UPDATE "account" SET password = $1, "updatedAt" = NOW() WHERE id = $2',
          [hashedPassword, existingAccount.rows[0].id]
        );
      } else {
        const accountId = randomUUID();
        await client.query(
          'INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          [accountId, userId, userId, "credential", hashedPassword]
        );
      }

      return userId;
    }

    // 1. Create Core Users
    const adminId = await upsertUser("admin@fieldflow.test", "Alex Rivera (Admin)", "ADMIN");
    const dispatcherId = await upsertUser("dispatch@fieldflow.test", "Marcus Vance (Dispatcher)", "DISPATCHER");
    const techUserId = await upsertUser("tech@fieldflow.test", "Devon Miller", "TECHNICIAN");

    console.log("Core users provisioned: Admin, Dispatcher, Technician.");

    // 2. Provision Technicians in "Technician" table
    async function upsertTech(email, name, phone, spec, skills, status, area, notes, userId = null) {
      const existing = await client.query('SELECT id FROM "Technician" WHERE email = $1', [email]);
      let techId;
      if (existing.rows.length > 0) {
        techId = existing.rows[0].id;
        await client.query(
          `UPDATE "Technician" 
           SET name = $1, phone = $2, specialization = $3, skills = $4, status = $5, "serviceArea" = $6, notes = $7, "userId" = $8, "updatedAt" = NOW()
           WHERE id = $9`,
          [name, phone, spec, skills, status, area, notes, userId, techId]
        );
      } else {
        techId = randomUUID();
        await client.query(
          `INSERT INTO "Technician" (id, name, email, phone, specialization, skills, status, "serviceArea", notes, "userId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [techId, name, email, phone, spec, skills, status, area, notes, userId]
        );
      }
      return techId;
    }

    const devonTechId = await upsertTech(
      "tech@fieldflow.test",
      "Devon Miller",
      "+1 (512) 555-0144",
      "Fiber & Network Infrastructure",
      ["Fiber Splicing", "CAT6 Cabling", "Cisco CCNA", "OTDR Testing"],
      "BUSY",
      "Austin Metro & Round Rock",
      "Lead certified field network specialist with 8+ years enterprise cabling experience.",
      techUserId
    );

    const sarahTechId = await upsertTech(
      "sarah.jenkins@fieldflow.io",
      "Sarah Jenkins",
      "+1 (214) 555-0188",
      "HVAC & Climate Control",
      ["HVAC Certified", "EPA Universal", "BMS & BAS Systems", "Chiller Diagnostics"],
      "AVAILABLE",
      "Dallas - Fort Worth Metro",
      "Commercial HVAC master technician certified for critical infrastructure."
    );

    const elenaTechId = await upsertTech(
      "elena.rostova@fieldflow.io",
      "Elena Rostova",
      "+1 (713) 555-0199",
      "Biomedical & Power Electronics",
      ["Biomed Calibration", "High Voltage 480V", "UPS Power", "NFPA-99"],
      "AVAILABLE",
      "Houston Metro & Medical Center",
      "Specialist in hospital uninterruptible power systems and clinical imaging hardware."
    );

    const marcusTechId = await upsertTech(
      "marcus.vance.tech@fieldflow.io",
      "Marcus Vance",
      "+1 (512) 555-0177",
      "Access Control & Security Systems",
      ["CCTV Surveillance", "HID Access Control", "Milestone VMS", "Fiber Backhaul"],
      "OFF",
      "Austin - Central & South",
      "Master security technician with field license and high-security clearance."
    );

    console.log("Technicians roster provisioned (Devon Miller, Sarah Jenkins, Elena Rostova, Marcus Vance).");

    // 3. Provision Customers in "customer" table
    async function upsertCustomer(email, name, company, phone, address, city, notes) {
      const existing = await client.query('SELECT id FROM "customer" WHERE email = $1', [email]);
      let custId;
      if (existing.rows.length > 0) {
        custId = existing.rows[0].id;
        await client.query(
          `UPDATE "customer"
           SET name = $1, company = $2, phone = $3, address = $4, city = $5, notes = $6, "updatedAt" = NOW()
           WHERE id = $7`,
          [name, company, phone, address, city, notes, custId]
        );
      } else {
        custId = randomUUID();
        await client.query(
          `INSERT INTO "customer" (id, name, company, email, phone, address, city, notes, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [custId, name, company, email, phone, address, city, notes]
        );
      }
      return custId;
    }

    const apexCustId = await upsertCustomer(
      "dispatch@apexlogistics.com",
      "David Sterling",
      "Apex Logistics & Distribution Hub",
      "+1 (512) 890-1200",
      "7400 Logistics Pkwy, Gate 4",
      "Austin, TX",
      "Loading dock security gate code: #4921. Contact warehouse lead on arrival."
    );

    const metroCustId = await upsertCustomer(
      "facilities@metrohealth.org",
      "Dr. Rachel Vance",
      "Metro Health Medical Center",
      "+1 (512) 670-3400",
      "1200 Health Sciences Blvd, Level 3",
      "Austin, TX",
      "Strict PPE compliance required. Badge check at Main East Reception."
    );

    const skylineCustId = await upsertCustomer(
      "dispatch@skylineretail.net",
      "Karen Lindqvist",
      "Skyline Retail Galleria",
      "+1 (214) 555-8920",
      "450 Galleria Mall Way, Suite 100",
      "Dallas, TX",
      "Work must be executed in morning window before store opening."
    );

    console.log("Customer directory seeded (Apex Logistics, Metro Health, Skyline Retail).");

    // 4. Provision Work Orders & Status Logs in "WorkOrder" & "StatusLog" tables
    async function upsertWorkOrder(title, desc, custId, techId, priority, status, schedDate, compDate, notes, logs = []) {
      const existing = await client.query('SELECT id FROM "WorkOrder" WHERE title = $1', [title]);
      let woId;
      if (existing.rows.length > 0) {
        woId = existing.rows[0].id;
        await client.query(
          `UPDATE "WorkOrder"
           SET description = $1, "customerId" = $2, "technicianId" = $3, priority = $4, status = $5, "scheduledAt" = $6, "completedAt" = $7, "completionNotes" = $8, "updatedAt" = NOW()
           WHERE id = $9`,
          [desc, custId, techId, priority, status, schedDate, compDate, notes, woId]
        );
        // Clear existing status logs to re-insert fresh lifecycle history
        await client.query('DELETE FROM "StatusLog" WHERE "workOrderId" = $1', [woId]);
      } else {
        woId = randomUUID();
        await client.query(
          `INSERT INTO "WorkOrder" (id, title, description, "customerId", "technicianId", priority, status, "scheduledAt", "completedAt", "completionNotes", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [woId, title, desc, custId, techId, priority, status, schedDate, compDate, notes]
        );
      }

      // Insert all StatusLog records
      for (const log of logs) {
        await client.query(
          `INSERT INTO "StatusLog" (id, "workOrderId", "changedById", "fromStatus", "toStatus", notes, "changedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [randomUUID(), woId, log.changedById, log.fromStatus, log.toStatus, log.notes || null, log.changedAt]
        );
      }

      return woId;
    }

    const now = new Date();
    const schedTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const schedToday = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const compYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const closedTwoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // 1. OPEN (Created)
    await upsertWorkOrder(
      "Cleanroom Chiller Diagnostics & BAS Sensor Replacement",
      "Inspect rooftop chiller compressor 2, replace failing 4-20mA pressure transducer, and calibrate building automation setpoints.",
      metroCustId,
      null,
      "HIGH",
      "OPEN",
      schedTomorrow,
      null,
      null,
      [
        {
          changedById: dispatcherId,
          fromStatus: "OPEN",
          toStatus: "OPEN",
          notes: "Work order created and placed in unassigned dispatch queue.",
          changedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
      ]
    );

    // 2. ASSIGNED
    await upsertWorkOrder(
      "Emergency Optical Backbone Splicing & Tier-2 OTDR Cert",
      "Restore severed 96-strand optical trunk line connecting Server Vault 2B to Central Dispatch. Splice ribbon fibers and verify <0.05dB loss.",
      apexCustId,
      devonTechId,
      "URGENT",
      "ASSIGNED",
      schedTomorrow,
      null,
      null,
      [
        {
          changedById: dispatcherId,
          fromStatus: "OPEN",
          toStatus: "OPEN",
          notes: "Work order created.",
          changedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        },
        {
          changedById: dispatcherId,
          fromStatus: "OPEN",
          toStatus: "ASSIGNED",
          notes: "Assigned to Devon Miller for optical certification and emergency splicing.",
          changedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        },
      ]
    );

    // 3. ACCEPTED
    await upsertWorkOrder(
      "Substation SCADA Remote Terminal Unit (RTU) Firmware Flash",
      "Perform firmware update on Schweitzer Engineering SEL-3530 RTU controller. Backup configuration and verify DNP3 telemetry link.",
      apexCustId,
      devonTechId,
      "HIGH",
      "ACCEPTED",
      schedToday,
      null,
      null,
      [
        {
          changedById: dispatcherId,
          fromStatus: "OPEN",
          toStatus: "ASSIGNED",
          notes: "Dispatched to Devon Miller for RTU firmware update.",
          changedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        },
        {
          changedById: techUserId,
          fromStatus: "ASSIGNED",
          toStatus: "ACCEPTED",
          notes: "Work order accepted by Devon Miller. En route to site with necessary cable adapters.",
          changedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
      ]
    );

    // 4. IN_PROGRESS
    await upsertWorkOrder(
      "Point-of-Sale Network Switchover & Cat6A Drop Certifications",
      "Deploy 12 shielded Cat6A drops across retail counters 1-8. Terminate patch panels and verify Gigabit PoE line resistance.",
      skylineCustId,
      devonTechId,
      "HIGH",
      "IN_PROGRESS",
      schedToday,
      null,
      null,
      [
        {
          changedById: dispatcherId,
          fromStatus: "OPEN",
          toStatus: "ASSIGNED",
          notes: "Dispatched to Devon Miller.",
          changedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        },
        {
          changedById: techUserId,
          fromStatus: "ASSIGNED",
          toStatus: "ACCEPTED",
          notes: "Accepted by technician.",
          changedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
        {
          changedById: techUserId,
          fromStatus: "ACCEPTED",
          toStatus: "IN_PROGRESS",
          notes: "On-site arrival confirmed. Terminating switch patch panel in IDF 2.",
          changedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        },
      ]
    );

    // 5. PAUSED
    await upsertWorkOrder(
      "Medical Diagnostic Ultrasound Power Supply Overhaul",
      "Replace aging filter capacitors on main DC rectifier rail. Test output voltage stability under transducer ultrasound drive cycle.",
      metroCustId,
      sarahTechId,
      "MEDIUM",
      "PAUSED",
      schedToday,
      null,
      null,
      [
        {
          changedById: dispatcherId,
          fromStatus: "OPEN",
          toStatus: "ASSIGNED",
          notes: "Assigned to Sarah Jenkins.",
          changedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
        },
        {
          changedById: dispatcherId,
          fromStatus: "ASSIGNED",
          toStatus: "ACCEPTED",
          notes: "Job accepted.",
          changedAt: new Date(now.getTime() - 7 * 60 * 60 * 1000),
        },
        {
          changedById: dispatcherId,
          fromStatus: "ACCEPTED",
          toStatus: "IN_PROGRESS",
          notes: "Work started in diagnostic lab.",
          changedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        },
        {
          changedById: dispatcherId,
          fromStatus: "IN_PROGRESS",
          toStatus: "PAUSED",
          notes: "Paused work: Replacement 450V electrolytic capacitors delayed in courier transit. Expected arrival tomorrow morning.",
          changedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
      ]
    );

    // 6. COMPLETED
    await upsertWorkOrder(
      "Critical Care UPS Power Inverter Failover Calibration",
      "Conducted primary and secondary inverter transfer tests. Calibrated ATS sensors and validated 12.4kW runtime capacity under peak load.",
      metroCustId,
      devonTechId,
      "MEDIUM",
      "COMPLETED",
      compYesterday,
      compYesterday,
      "Full load test completed. 4ms ATS transfer latency verified. Digital customer sign-off obtained from Dr. Rachel Vance.",
      [
        {
          changedById: dispatcherId,
          fromStatus: "OPEN",
          toStatus: "ASSIGNED",
          notes: "Dispatched to Devon Miller for critical healthcare power audit.",
          changedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
        },
        {
          changedById: techUserId,
          fromStatus: "ASSIGNED",
          toStatus: "ACCEPTED",
          notes: "Job accepted by technician.",
          changedAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
        },
        {
          changedById: techUserId,
          fromStatus: "ACCEPTED",
          toStatus: "IN_PROGRESS",
          notes: "Started ATS failover diagnostics.",
          changedAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
        },
        {
          changedById: techUserId,
          fromStatus: "IN_PROGRESS",
          toStatus: "COMPLETED",
          notes: "Full load test completed. 4ms ATS transfer latency verified. Digital customer sign-off obtained from Dr. Rachel Vance.",
          changedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
      ]
    );

    // 7. CLOSED
    await upsertWorkOrder(
      "Commercial HVAC Rooftop Economizer Damper Actuator Replacement",
      "Replace stuck Belimo economizer actuator on Unit 4. Verify outside air percentage CFM and calibrate CO2 demand control ventilation sensors.",
      skylineCustId,
      sarahTechId,
      "LOW",
      "CLOSED",
      closedTwoDaysAgo,
      closedTwoDaysAgo,
      "Belimo actuator installed and calibrated. CO2 sensor reporting 450ppm baseline. Energy efficiency verified.",
      [
        {
          changedById: dispatcherId,
          fromStatus: "OPEN",
          toStatus: "ASSIGNED",
          notes: "Assigned to Sarah Jenkins.",
          changedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
        },
        {
          changedById: dispatcherId,
          fromStatus: "ASSIGNED",
          toStatus: "ACCEPTED",
          notes: "Job accepted.",
          changedAt: new Date(now.getTime() - 65 * 60 * 60 * 1000),
        },
        {
          changedById: dispatcherId,
          fromStatus: "ACCEPTED",
          toStatus: "IN_PROGRESS",
          notes: "Work started on rooftop Unit 4.",
          changedAt: new Date(now.getTime() - 60 * 60 * 60 * 1000),
        },
        {
          changedById: dispatcherId,
          fromStatus: "IN_PROGRESS",
          toStatus: "COMPLETED",
          notes: "Belimo actuator installed and calibrated. CO2 sensor reporting 450ppm baseline. Energy efficiency verified.",
          changedAt: new Date(now.getTime() - 52 * 60 * 60 * 1000),
        },
        {
          changedById: dispatcherId,
          fromStatus: "COMPLETED",
          toStatus: "CLOSED",
          notes: "Dispatcher verified invoice, warranty documentation, and signed completion certificate. Work order closed.",
          changedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        },
      ]
    );

    await client.query("COMMIT");
    console.log("Database seeded successfully with all roles, customers, technicians, full lifecycle work orders, and status logs!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
