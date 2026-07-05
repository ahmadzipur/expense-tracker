"use client"

import { useEffect, useState } from "react"

export default function Rekening() {
    const [list, setList] = useState([])
    const [form, setForm] = useState({
        name: "",
        balance: ""
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        load()
    }, [])

    // Ubah fungsi load() di page.jsx
    async function load() {
        try {
            // PERBAIKAN: Ubah /api/rekening menjadi /api/accounts
            const res = await fetch("/api/accounts");

            const text = await res.text();

            if (!text) {
                console.warn("Server mengirim respon kosong");
                setList([]);
                return;
            }

            const data = JSON.parse(text);

            if (res.ok && Array.isArray(data)) {
                setList(data);
            } else {
                console.error("Gagal memuat:", data.error || "Format salah");
                setList([]);
            }
        } catch (err) {
            console.error("Gagal membaca JSON:", err);
            setList([]);
        } finally {
            setLoading(false);
        }
    }

    // Ubah juga fungsi save() di page.jsx
    async function save() {
        if (!form.name.trim()) {
            alert("Nama rekening tidak boleh kosong!")
            return
        }

        try {
            // PERBAIKAN: Ubah /api/rekening menjadi /api/accounts
            const res = await fetch("/api/accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            })

            if (res.ok) {
                setForm({ name: "", balance: "" })
                load() 
            } else {
                const errData = await res.json()
                alert("Gagal menyimpan: " + errData.error)
            }
        } catch (err) {
            alert("Gagal terhubung ke server.")
        }
    }

    return (
        <div className="min-h-screen p-8">
            <div className="grid lg:grid-cols-2 gap-8">

                {/* FORM TAMBAH */}
                <div className="glass p-6 rounded-3xl">
                    <h1 className="text-3xl font-bold mb-5">Tambah Rekening</h1>
                    <input
                        className="input mb-4 w-full p-2 border rounded"
                        placeholder="Contoh: BCA, Mandiri"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                    <input
                        className="input w-full p-2 border rounded"
                        type="number"
                        placeholder="Saldo Awal"
                        value={form.balance}
                        onChange={e => setForm({ ...form, balance: e.target.value })}
                    />
                    <button className="primary mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={save}>
                        Simpan
                    </button>
                </div>

                {/* DAFTAR REKENING */}
                <div className="glass rounded-3xl p-6">
                    <h1 className="text-3xl mb-5 font-bold">Daftar Rekening</h1>

                    {loading ? (
                        <div>Memuat rekening...</div>
                    ) : list.length === 0 ? (
                        <div className="text-gray-400">Belum ada rekening terdaftar.</div>
                    ) : (
                        list.map(r => (
                            <div key={r.id} className="bg-white/5 p-4 rounded-xl mb-3 border border-white/10">
                                <div className="font-semibold text-lg">{r.name}</div>
                                <div className="text-cyan-400">
                                    Rp {Number(r.balance).toLocaleString("id-ID")}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}