import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
    verifyToken
}
    from "@/lib/auth"

import db from "@/lib/db"

export async function GET() {

    try {

        const token =
            (await cookies())
                .get(
                    "token"
                )?.value

        if (!token) {

            return NextResponse.json(
                null,
                {
                    status: 401
                }
            )

        }

        const user =
            verifyToken(
                token
            )

        if (
            !user
        ) {

            return NextResponse.json(
                null,
                {
                    status: 401
                }
            )

        }

        const result =
            await db.query(
                `
SELECT
id,
name,
email

FROM users

WHERE id=$1
`,
                [
                    user.id
                ]
            )

        return NextResponse.json(
            result.rows[0]
        )

    }

    catch {

        return NextResponse.json(
            null,
            {
                status: 401
            }
        )

    }

}