import db from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const token = (await cookies()).get("token")?.value

        if (!token) {
            return NextResponse.json([])
        }

        const user = verifyToken(token)

        if (!user) {
            return NextResponse.json([])
        }

        const result = await db.query(
            `
            SELECT id, name, balance, icon, color 
            FROM accounts 
            WHERE user_id = $1 
            ORDER BY id DESC
            `,
            [user.id]
        )

        return NextResponse.json(result.rows)
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const token = (await cookies()).get("token")?.value
        const user = verifyToken(token)

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()

        // VALIDASI: Cegah input kosong masuk ke database
        if (!body.name || body.name.trim() === "") {
            return NextResponse.json({ error: "Nama rekening wajib diisi" }, { status: 400 })
        }

        await db.query(
            `
            INSERT INTO accounts (user_id, name, balance, icon, color) 
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                user.id,
                body.name,
                Number(body.balance) || 0,
                body.icon || "💳",
                body.color || "from-cyan-500 to-blue-500"
            ]
        )

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}