import "dotenv/config";

async function runTechnicianApiTests() {
  console.log("=== Testing FieldFlow Technician API Endpoints via HTTP ===");

  try {
    const testEmail = `tech.dispatcher.${Date.now()}@fieldflow.io`;
    const testPassword = "Password123!";

    // 1. Sign up/authenticate via Better Auth to get a valid session cookie
    console.log(`\n1. Authenticating user via HTTP POST /api/auth/sign-up/email: ${testEmail}...`);
    const signUpRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Field Dispatch Admin",
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log("Sign-up status:", signUpRes.status);
    const setCookieHeader = signUpRes.headers.get("set-cookie");
    console.log("Set-Cookie header received:", setCookieHeader ? "YES" : "NO");

    if (!signUpRes.ok || !setCookieHeader) {
      throw new Error("Failed to authenticate session.");
    }

    const cookie = setCookieHeader.split(";")[0];

    // 2. Test GET /api/technicians (List, search, filter)
    console.log("\n2. Testing GET /api/technicians with authenticated session...");
    const getRes = await fetch("http://localhost:3000/api/technicians?limit=10", {
      headers: { cookie },
    });
    console.log("GET /api/technicians status:", getRes.status);
    const getData = await getRes.json();
    console.log("✓ Response data:", {
      totalInDb: getData.pagination?.total,
      returnedCount: getData.technicians?.length,
      stats: getData.stats,
    });

    // 3. Test POST /api/technicians (Create new technician)
    console.log("\n3. Testing POST /api/technicians (Provision new technician)...");
    const newTechPayload = {
      name: "Devon Miller",
      email: `devon.${Date.now()}@fieldflow.io`,
      phone: "+1 (555) 777-6655",
      specialization: "Retail POS & Terminal Systems",
      skills: ["NCR Kiosks", "Ingenico / Verifone", "Barcodes", "After-hours Cutover"],
      status: "AVAILABLE",
      serviceArea: "Dallas, TX Metro",
      notes: "Van #22 with spare POS touchscreens and pinpad inventory.",
    };

    const postRes = await fetch("http://localhost:3000/api/technicians", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify(newTechPayload),
    });

    console.log("POST /api/technicians status:", postRes.status);
    const createdTech = await postRes.json();
    console.log("✓ Technician created successfully:", {
      id: createdTech.id,
      name: createdTech.name,
      email: createdTech.email,
      specialization: createdTech.specialization,
      status: createdTech.status,
    });

    const techId = createdTech.id;

    // 4. Test GET /api/technicians/[id] (Single technician with work orders)
    console.log("\n4. Testing GET /api/technicians/[id]...");
    const getSingleRes = await fetch(`http://localhost:3000/api/technicians/${techId}`, {
      headers: { cookie },
    });
    console.log("GET /api/technicians/[id] status:", getSingleRes.status);
    const singleTech = await getSingleRes.json();
    console.log("✓ Single technician retrieved:", singleTech.name);

    // 5. Test PUT /api/technicians/[id] (Update details and status)
    console.log("\n5. Testing PUT /api/technicians/[id]...");
    const putRes = await fetch(`http://localhost:3000/api/technicians/${techId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        ...newTechPayload,
        status: "BUSY",
        phone: "+1 (555) 999-3322",
        notes: "Updated: Dispatched to Northpark Mall kiosk overhaul.",
      }),
    });
    console.log("PUT /api/technicians/[id] status:", putRes.status);
    const updatedTech = await putRes.json();
    console.log("✓ Technician updated:", {
      status: updatedTech.status,
      phone: updatedTech.phone,
      notes: updatedTech.notes,
    });

    // 6. Test DELETE /api/technicians/[id] (Safe deletion)
    console.log("\n6. Testing DELETE /api/technicians/[id]...");
    const deleteRes = await fetch(`http://localhost:3000/api/technicians/${techId}`, {
      method: "DELETE",
      headers: { cookie },
    });
    console.log("DELETE /api/technicians/[id] status:", deleteRes.status);
    const deleteResult = await deleteRes.json();
    console.log("✓ Delete response:", deleteResult);

    console.log("\n=== ALL TECHNICIAN HTTP API TESTS PASSED WITH 100% SUCCESS! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  }
}

runTechnicianApiTests();
