export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Welcome Back
                </h1>

                <form className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter password"
                            className="w-full rounded-lg border p-3"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>
            </div>
        </main>
    );
}