import { db } from "@/lib/db";

export default async function TestDBPage() {
  let dbStatus = "❌ Error";
  let userCount = 0;
  let errorMessage = "";

  try {
    // Test database connection
    await db.$connect();
    dbStatus = "✅ Connected";
    
    // Try a simple query
    userCount = await db.user.count();
  } catch (error: any) {
    dbStatus = "❌ Error";
    errorMessage = error.message || "Unknown error";
    console.error("Database error:", error);
  } finally {
    try {
      await db.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {dbStatus}
        </div>
        <div>
          <strong>DATABASE_URL:</strong> {process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}
        </div>
        {dbStatus === "✅ Connected" && (
          <div>
            <strong>User count:</strong> {userCount}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 p-4 rounded">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
