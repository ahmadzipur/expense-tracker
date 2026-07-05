import {
    hashPassword
} from "@/lib/auth"
import db from "@/lib/db"

import {
    NextResponse
} from "next/server"

export async function POST(req) {

    try {

        const body =
            await req.json()

        const {
            name,
            email,
            password
        } = body

        if (
            !name ||
            !email ||
            !password
        ) {

            return NextResponse.json(
                {
                    error: "Lengkapi data"
                },
                {
                    status: 400
                }
            )

        }

        const check =
            await db.query(
                `
SELECT id
FROM users
WHERE email=$1
`,
                [email]
            )

        if (
            check.rows.length
        ) {

            return NextResponse.json(
                {
                    error:
                        "Email sudah digunakan"
                },
                {
                    status: 400
                }
            )

        }

        const hashed =
            await hashPassword(
                password
            )

        await db.query(
            `
INSERT INTO users
(
name,
email,
password
)
VALUES
(
$1,
$2,
$3
)
`,
            [
                name,
                email,
                hashed
            ]
        )

        return NextResponse.json(
            {
                success: true
            }
        )

    }

    catch (err) {

        return NextResponse.json(
            {
                error:
                    err.message
            },
            {
                status: 500
            }
        )

    }

}