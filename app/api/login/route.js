import db from "@/lib/db"
import {
    comparePassword,
    createToken
} from "@/lib/auth"

import { NextResponse } from "next/server"

export async function POST(req) {

    try {

        const {
            email,
            password
        } =
            await req.json()

        const result =
            await db.query(
                `
SELECT *
FROM users
WHERE email=$1
`,
                [email]
            )

        if (
            result.rows.length === 0
        ) {

            return NextResponse.json(
                {
                    error:
                        "User tidak ditemukan"
                },
                {
                    status: 400
                }
            )

        }

        const user =
            result.rows[0]

        const valid =
            await comparePassword(
                password,
                user.password
            )

        if (!valid) {

            return NextResponse.json(
                {
                    error:
                        "Password salah"
                },
                {
                    status: 400
                }
            )

        }
        console.log(
            process.env.JWT_SECRET
        )
        const token =
            createToken(user)

        const response =
            NextResponse.json({
                success: true
            })

        response.cookies.set({
            name: "token",
            value: token,

            httpOnly: true,

            secure: false,

            sameSite: "lax",

            path: "/",

            maxAge:
                60 *
                60 *
                24 *
                7
        })

        return response

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