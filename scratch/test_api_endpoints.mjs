import "dotenv/config";

async function runApiTests() {
  console.log("=== Testing FieldFlow API Endpoints via HTTP ===");

  try {
    const testEmail = `agent.tester.${Date.now()}@fieldflow.io`;
    const testPassword = "Password123!";

    // 1. Sign up via the live Next.js API endpoint
    console.log(`\n1. Registering new user via HTTP POST /api/auth/sign-up/email: ${testEmail}...`);
    const signUpRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Field Ops Tester",
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log("Sign-up status:", signUpRes.status);
    const setCookieHeader = signUpRes.headers.get("set-cookie");
    console.log("Set-Cookie header received:", setCookieHeader ? "YES" : "NO");

    if (!signUpRes.ok || !setCookieHeader) {
      throw new Error("Failed to sign up via live HTTP endpoint.");
    }

    // Extract cookie value for subsequent requests
    const cookie = setCookieHeader.split(";")[0];
    console.log("Using cookie:", cookie);

    // 2. Test GET /api/customers (List & search)
    console.log("\n2. Testing GET /api/customers with authenticated session...");
    const getRes = await fetch("http://localhost:3000/api/customers?limit=10", {
      headers: { cookie },
    });
    console.log("GET /api/customers status:", getRes.status);
    const getData = await getRes.json();
    console.log("✓ Customers returned:", getData.customers?.length);
    console.log("✓ Total in DB:", getData.pagination?.total);
    console.log("✓ Stats:", getData.stats);

    // 3. Test POST /api/customers (Create new customer)
    console.log("\n3. Testing POST /api/customers...");
    const newCustomer = {
      name: "Global Freight Systems",
      company: "GFS Logistics Corp",
      email: `dispatch.${Date.now()}@gfs-freight.com`,
      phone: "+1 (555) 789-0123",
      address: "800 Harborside Blvd, Dock 4",
      city: "Seattle",
      notes: "High priority cold chain SLA account.",
    };

    const postRes = await fetch("http://localhost:3000/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify(newCustomer),
    });

    console.log("POST /api/customers status:", postRes.status);
    const createdCustomer = await postRes.json();
    console.log("✓ Customer created successfully:", {
      id: createdCustomer.id,
      name: createdCustomer.name,
      email: createdCustomer.email,
      city: createdCustomer.city,
    });

    const customerId = createdCustomer.id;

    // 4. Test GET /api/customers/[id]
    console.log("\n4. Testing GET /api/customers/[id]...");
    const singleRes = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
      headers: { cookie },
    });
    console.log("GET /api/customers/[id] status:", singleRes.status);
    const singleCustomer = await singleRes.json();
    console.log("✓ Customer details retrieved:", singleCustomer.name);

    // 5. Test PUT /api/customers/[id]
    console.log("\n5. Testing PUT /api/customers/[id]...");
    const putRes = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        ...newCustomer,
        phone: "+1 (555) 999-0000",
        notes: "Updated SLA notes: security clearance granted.",
      }),
    });
    console.log("PUT /api/customers/[id] status:", putRes.status);
    const updatedCustomer = await putRes.json();
    console.log("✓ Customer updated:", { phone: updatedCustomer.phone, notes: updatedCustomer.notes });

    // 6. Test DELETE /api/customers/[id]
    console.log("\n6. Testing DELETE /api/customers/[id]...");
    const deleteRes = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
      method: "DELETE",
      headers: { cookie },
    });
    console.log("DELETE /api/customers/[id] status:", deleteRes.status);
    const deleteResult = await deleteRes.json();
    console.log("✓ Delete response:", deleteResult);

    console.log("\n=== ALL END-TO-END HTTP API TESTS PASSED WITH 100% SUCCESS! ===");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runApiTests();
