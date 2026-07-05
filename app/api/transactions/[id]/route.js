import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getUser() {
    try {
        const token = (await cookies()).get("token")?.value;
        if (!token) return null;
        const decoded = verifyToken(token);
        if (!decoded) return null;
        const id = parseInt(decoded.id || decoded.user_id, 10);
        if (isNaN(id)) return null;
        return { id };
    } catch {
        return null;
    }
}

export async function PUT(req, { params }) {
    const { id } = await params;

    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trxId = Number(id);
    const body = await req.json();

    if (isNaN(trxId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const newAmount = Number(body.amount);

    await db.query("BEGIN");

    try {
        const old = await db.query(
            `SELECT * FROM transactions WHERE id=$1 AND user_id=$2`,
            [trxId, user.id]
        );

        if (old.rows.length === 0) {
            await db.query("ROLLBACK");
            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        const trx = old.rows[0];

        // 🔥 rollback efek lama
        const oldEffect =
            trx.type === "income"
                ? trx.amount
                : -trx.amount;

        await db.query(
            `UPDATE accounts SET balance = balance - $1 WHERE id=$2`,
            [oldEffect, trx.account_id]
        );

        // cek saldo rekening baru
        const account = await db.query(
            `SELECT balance FROM accounts WHERE id=$1 AND user_id=$2`,
            [body.account, user.id]
        );

        if (account.rows.length === 0) {
            await db.query("ROLLBACK");
            return NextResponse.json({ error: "Rekening tidak ditemukan" }, { status: 404 });
        }

        const balance = Number(account.rows[0].balance);

        // 🔥 hitung efek baru
        const newEffect =
            body.type === "income"
                ? newAmount
                : -newAmount;

        // 🔥 VALIDASI FINAL BALANCE
        if (balance + newEffect < 0) {
            await db.query("ROLLBACK");
            return NextResponse.json(
                { error: "Saldo tidak mencukupi" },
                { status: 400 }
            );
        }

        // update transaksi
        await db.query(
            `
            UPDATE transactions
            SET account_id=$1, type=$2, amount=$3, description=$4
            WHERE id=$5
            `,
            [body.account, body.type, newAmount, body.description, trxId]
        );

        // apply transaksi baru
        await db.query(
            `UPDATE accounts SET balance = balance + $1 WHERE id=$2`,
            [newEffect, body.account]
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

export async function DELETE(req, { params }) {
    const { id } = await params;

    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trxId = Number(id);
    if (isNaN(trxId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await db.query("BEGIN");

    try {
        const old = await db.query(
            `SELECT * FROM transactions WHERE id=$1 AND user_id=$2`,
            [trxId, user.id]
        );

        if (old.rows.length === 0) {
            await db.query("ROLLBACK");
            return NextResponse.json(
                { error: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        const trx = old.rows[0];

        if (trx.type === "income") {
            await db.query(
                `UPDATE accounts SET balance = balance - $1 WHERE id=$2`,
                [trx.amount, trx.account_id]
            );
        } else {
            await db.query(
                `UPDATE accounts SET balance = balance + $1 WHERE id=$2`,
                [trx.amount, trx.account_id]
            );
        }

        await db.query(`DELETE FROM transactions WHERE id=$1`, [trxId]);

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