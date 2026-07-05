import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Konversi ID ke Integer
    const userId = parseInt(decoded.id || decoded.user_id, 10);

    if (isNaN(userId)) {
      console.error("ID User di dalam token dashboard tidak valid");
      return NextResponse.json({ error: "Invalid User ID dalam token" }, { status: 400 });
    }

    // 1. Ambil data user
    const userResult = await db.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // 2. Ambil data rekening
    const accountResult = await db.query(
      "SELECT id, name, balance, icon, color FROM accounts WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    // 3. Hitung total saldo secara aman
    const total = accountResult.rows.reduce(
      (sum, row) => sum + Number(row.balance || 0),
      0
    );

    const summaryResult = await db.query(
      `
  SELECT
    COALESCE(
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END),
      0
    ) AS income,

    COALESCE(
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
      0
    ) AS expense

  FROM transactions

  WHERE user_id = $1
  `,
      [userId]
    );

    const income = Number(summaryResult.rows[0].income || 0);
    const expense = Number(summaryResult.rows[0].expense || 0);

    return NextResponse.json({
      user: userResult.rows[0],
      accounts: accountResult.rows,
      total,
      income,
      expense,
    });
  } catch (err) {
    // Memastikan log error asli terlihat di terminal VS Code Anda
    console.error("Dashboard API Error lengkap:", err);

    // Selalu kembalikan JSON, jangan biarkan melempar HTML
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}