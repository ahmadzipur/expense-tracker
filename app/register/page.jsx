"use client"

import Logo from "@/components/Logo"
import { useState } from "react"

export default function Register() {
    const [loading, setLoading] = useState(false)

    const [data, setData] = useState({
            name: "",
            email: "",
            password: ""
        })

    async function submit(e) {
        e.preventDefault()
        if (loading) return

        setLoading(true)
        try {
            const res =
                await fetch(
                    "/api/register",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(data)

                    }
                )

            const json =
                await res.json()
            if ( json.success ) {
                location.href =
                    "/login"
            } else {
                alert(
                    json.error
                )
            }
        }

        finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="glass max-w-md w-full rounded-[32px] p-10">
                <Logo />
                <form onSubmit={submit} className="mt-10 space-y-4">
                    <input className="input" placeholder="Nama" value={data.name} onChange={
                        e =>
                            setData({
                                ...data,
                                name: e.target.value
                            })
                        }
                    />

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
                                "Buat Akun"
                        }
                    </button>
                    <div className="text-center text-slate-300">
                        Sudah punya akun?
                        <a href="/login" className="text-cyan-400 ml-2">
                            Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}