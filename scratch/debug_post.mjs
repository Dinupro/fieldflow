import "dotenv/config";

async function testPost() {
  const testEmail = `debug.${Date.now()}@fieldflow.io`;
  const testPassword = "Password123!";

  const signUpRes = await fetch("http://localhost:3000/api/auth/sign-up/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
    body: JSON.stringify({
      name: "Debug Dispatcher",
      email: testEmail,
      password: testPassword,
    }),
  });

  const cookie = signUpRes.headers.get("set-cookie")?.split(";")[0];
  console.log("Sign up status:", signUpRes.status, "Cookie:", cookie);

  // Get first customer
  const custRes = await fetch("http://localhost:3000/api/customers?limit=1", {
    headers: { cookie },
  });
  const custData = await custRes.json();
  const customerId = custData.customers[0]?.id;
  console.log("Customer ID:", customerId);

  const postRes = await fetch("http://localhost:3000/api/work-orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    body: JSON.stringify({
      title: "Debug Work Order Title",
      description: "Testing POST route debugging",
      customerId,
      priority: "MEDIUM",
      status: "OPEN",
    }),
  });

  console.log("POST status:", postRes.status);
  const postData = await postRes.json();
  console.log("POST response:", postData);
}

testPost();
