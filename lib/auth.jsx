import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export async function hashPassword(password) {
    return await bcrypt.hash(
        password,
        10
    )
}

export async function comparePassword(
    password,
    hash
) {

    return await bcrypt.compare(
        password,
        hash
    )
}

export function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )
}

export function verifyToken(token) {

    try {
        return jwt.verify(
            token,
            process.env.JWT_SECRET
        )
    }
    catch {
        return null
    }
}