import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* ================= Navbar ================= */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-blue-700">
            FieldFlow
          </h1>

          <nav className="hidden gap-8 md:flex">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <a href="#features" className="hover:text-blue-600">
              Features
            </a>
            <a href="#about" className="hover:text-blue-600">
              About
            </a>
            <a href="#contact" className="hover:text-blue-600">
              Contact
            </a>
          </nav>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-blue-600 px-5 py-2 text-blue-600 transition hover:bg-blue-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= Hero ================= */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-gray-900">
          Smart Field Service
          <br />
          Management Made Easy
        </h1>

        <p className="max-w-3xl text-lg leading-8 text-gray-600">
          FieldFlow helps businesses manage service requests,
          assign technicians, track work progress,
          and keep customers updated from one powerful platform.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Request a Service
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold hover:bg-gray-100"
          >
            Login
          </Link>
        </div>
      </section>

      {/* ================= Features ================= */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">

          <h2 className="mb-12 text-center text-4xl font-bold">
            Why Choose FieldFlow?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">

            <div className="rounded-xl bg-gray-50 p-8 shadow">
              <div className="mb-4 text-4xl">📋</div>
              <h3 className="mb-3 text-xl font-semibold">
                Create Service Jobs
              </h3>

              <p className="text-gray-600">
                Submit and manage service requests quickly from one place.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-8 shadow">
              <div className="mb-4 text-4xl">👨‍🔧</div>

              <h3 className="mb-3 text-xl font-semibold">
                Assign Technicians
              </h3>

              <p className="text-gray-600">
                Easily assign jobs to available technicians and monitor progress.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-8 shadow">
              <div className="mb-4 text-4xl">📍</div>

              <h3 className="mb-3 text-xl font-semibold">
                Live Status Tracking
              </h3>

              <p className="text-gray-600">
                Stay informed with real-time job updates from start to completion.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-8 shadow">
              <div className="mb-4 text-4xl">👥</div>

              <h3 className="mb-3 text-xl font-semibold">
                Customer Management
              </h3>

              <p className="text-gray-600">
                Maintain customer information and complete service history.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-8 shadow">
              <div className="mb-4 text-4xl">📊</div>

              <h3 className="mb-3 text-xl font-semibold">
                Dashboard Analytics
              </h3>

              <p className="text-gray-600">
                View work orders, technician performance and business insights.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-8 shadow">
              <div className="mb-4 text-4xl">🔍</div>

              <h3 className="mb-3 text-xl font-semibold">
                Powerful Search
              </h3>

              <p className="text-gray-600">
                Quickly find customers, technicians and service jobs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= How It Works ================= */}
      <section className="bg-blue-50 py-20">

        <div className="mx-auto max-w-6xl px-6">

          <h2 className="mb-12 text-center text-4xl font-bold">
            How It Works
          </h2>

          <div className="grid gap-10 md:grid-cols-4">

            <div className="text-center">
              <div className="mb-4 text-5xl">1️⃣</div>
              <h3 className="font-semibold">Request Service</h3>
              <p className="mt-2 text-gray-600">
                Customer submits a service request.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 text-5xl">2️⃣</div>
              <h3 className="font-semibold">Assign Technician</h3>
              <p className="mt-2 text-gray-600">
                Manager assigns the best technician.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 text-5xl">3️⃣</div>
              <h3 className="font-semibold">Track Progress</h3>
              <p className="mt-2 text-gray-600">
                Receive live updates throughout the job.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 text-5xl">4️⃣</div>
              <h3 className="font-semibold">Job Completed</h3>
              <p className="mt-2 text-gray-600">
                Customer receives confirmation and service history.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 text-center">

        <h2 className="mb-6 text-4xl font-bold">
          Ready to Simplify Your Field Operations?
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-gray-600">
          Join FieldFlow today and manage your customers,
          technicians and service requests with ease.
        </p>

        <Link
          href="/register"
          className="rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
        >
          Get Started Today
        </Link>

      </section>

      {/* ================= Footer ================= */}
      <footer
        id="contact"
        className="bg-gray-900 py-8 text-center text-gray-400"
      >
        <h3 className="mb-2 text-xl font-bold text-white">
          FieldFlow
        </h3>

        <p>
          © {new Date().getFullYear()} FieldFlow. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}