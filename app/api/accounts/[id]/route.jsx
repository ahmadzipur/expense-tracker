import db from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

async function user() {

    const token =
        (await cookies())
            .get("token")
            ?.value

    return verifyToken(
        token
    )

}

export async function PUT(req, { params }) {

    const body =
        await req.json()

    const me =
        await user()

    await db.query(
        `

UPDATE accounts

SET

name=$1,
icon=$2,
color=$3

WHERE

id=$4

AND user_id=$5

`,
        [
            body.name,
            body.icon,
            body.color,
            params.id,
            me.id
        ]
    )

    return NextResponse.json({
        success: true
    })

}

export async function DELETE(req, { params }) {

    const me =
        await user()

    await db.query(
        `
DELETE
FROM accounts

WHERE
id=$1

AND
user_id=$2
`,
        [
            params.id,
            me.id
        ]
    )

    return NextResponse.json({
        success: true
    })

}