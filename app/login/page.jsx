"use client"

import Logo from "@/components/Logo"
import { useState } from "react"

export default function Login() {
    
    const [loading, setLoading] =
        useState(false)

    const [data, setData] =
        useState({
            email: "",
            password: ""
        })

    async function login(e) {
        e.preventDefault()
        if (loading) return

        setLoading(true)
        try {
            const res =
                await fetch(
                    "/api/login",
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(
                                data
                            )
                    }
                )

            const json =
                await res.json()

            console.log(
                "LOGIN RESULT",
                json
            )
            if (
                json.success
            ) {

                console.log(
                    "REDIRECT"
                )
                window.location.assign(
                    "/dashboard"
                )
            } else {

console.log(
"LOGIN ERROR",
json
)
                alert(
                    json.error
                )
            }
        }
        catch (err) {
            alert(
                "Gagal login"
            )
            console.log(
                err
            )
        }

        finally {
            setLoading(false)
        }
    }
    const message =
typeof window !== "undefined"
?
new URLSearchParams(
window.location.search
).get("msg")
:
null
    return (
        <div className="min-h-screen flex justify-center items-center p-6">
            <div className="glass max-w-md w-full rounded-[32px] p-10">
                <Logo />
                {
message &&

<div
className="
mb-4
bg-red-500/20
p-4
rounded-xl
"
>

Middleware:
{message}

</div>

}
                <form onSubmit={login} className="mt-10 space-y-4">
                    <input className="input" type="email" placeholder="Email" value={data.email} onChange={
                        e =>
                            setData({
                                ...data,
                                email: e.target.value
                            })
                    }
                    />

                    <input className="input" type="password" placeholder="Password" value={data.password} onChange={
                        e =>
                            setData({
                                ...data,
                                password: e.target.value
                            })
                    }
                    />

                    <button type="submit" disabled={loading} className="primary">
                        {
                            loading
                                ?
                                "Memproses..."
                                :
                                "Masuk"
                        }
                    </button>

                    <div className="text-center text-slate-300">
                        Belum punya akun?
                        <a href="/register" className="text-cyan-400 ml-2">
                            Daftar
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}