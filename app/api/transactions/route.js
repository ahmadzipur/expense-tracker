import db from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

async function getUser() {
    try {
        const token = (await cookies()).get("token")?.value
        if (!token) return null

        const decoded = verifyToken(token)
        if (!decoded) return null

        const userId = parseInt(decoded.id || decoded.user_id, 10)
        if (isNaN(userId)) return null

        return { id: userId }
    } catch (err) {
        return null
    }
}

export async function GET() {
    try {
        const user = await getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Disesuaikan dengan kolom asli database kamu: account_id dan description
        const result = await db.query(
            `
            SELECT
                t.id,
                t.account_id,
                t.type,
                t.amount,
                t.description,
                a.name AS account
            FROM transactions t
            LEFT JOIN accounts a
                ON a.id = t.account_id
            WHERE t.user_id = $1
            ORDER BY t.transaction_date DESC
            `,
            [user.id]
        )

        return NextResponse.json(result.rows)
    } catch (err) {
        console.error("ERROR PADA GET TRANSACTIONS:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(req) {
    const user = await getUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();

    const accountId = parseInt(body.account, 10);
    const amount = Number(body.amount);

    if (!accountId) {
        return NextResponse.json(
            { error: "Pilih rekening terlebih dahulu" },
            { status: 400 }
        );
    }

    if (!amount || amount <= 0) {
        return NextResponse.json(
            { error: "Jumlah transaksi tidak valid" },
            { status: 400 }
        );
    }

    await db.query("BEGIN");

    try {
        // 🔥 ambil saldo rekening
        const account = await db.query(
            `SELECT balance FROM accounts WHERE id=$1 AND user_id=$2`,
            [accountId, user.id]
        );

        if (account.rows.length === 0) {
            await db.query("ROLLBACK");
            return NextResponse.json(
                { error: "Rekening tidak ditemukan" },
                { status: 404 }
            );
        }

        const balance = Number(account.rows[0].balance);

        // 🔥 VALIDASI SALDO
        if (body.type === "expense" && amount > balance) {
            await db.query("ROLLBACK");
            return NextResponse.json(
                { error: "Saldo tidak mencukupi" },
                { status: 400 }
            );
        }

        // 🔥 INSERT TRANSAKSI
        await db.query(
            `
            INSERT INTO transactions 
            (user_id, account_id, type, amount, description, transaction_date)
            VALUES ($1, $2, $3, $4, $5, NOW())
            `,
            [
                user.id,
                accountId,
                body.type,
                amount,
                body.description || ""
            ]
        );

        // 🔥 UPDATE SALDO
        const operator = body.type === "income" ? "+" : "-";

        await db.query(
            `
            UPDATE accounts
            SET balance = balance ${operator} $1
            WHERE id = $2 AND user_id = $3
            `,
            [amount, accountId, user.id]
        );

        await db.query("COMMIT");

        return NextResponse.json({ success: true });

    } catch (err) {
        await db.query("ROLLBACK");

        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}