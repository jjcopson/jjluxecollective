import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const expectedPassword = (process.env.ADMIN_PASSWORD || "").trim();
    const secret = process.env.ADMIN_SESSION_SECRET || "jj-luxe-admin-development-secret";

    if (!expectedEmail || !expectedPassword) {
      return NextResponse.json(
        { message: "Admin login is not configured. Add ADMIN_EMAIL and ADMIN_PASSWORD to .env.local, then restart npm run dev." },
        { status: 500 }
      );
    }

    if (String(email || "").trim().toLowerCase() !== expectedEmail || String(password || "").trim() !== expectedPassword) {
      return NextResponse.json({ message: "Invalid admin email or password" }, { status: 401 });
    }

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("admin_session", secret, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Login failed", error: String(error) }, { status: 500 });
  }
}
