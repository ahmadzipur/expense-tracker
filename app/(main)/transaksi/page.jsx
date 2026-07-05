"use client"

import { useEffect, useState } from "react"

export default function Transaksi() {
    const [accounts, setAccounts] = useState([])
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(false)
    const [editId, setEditId] = useState(null)
    const [form, setForm] = useState({
        account: "",
        type: "expense",
        amount: "",
        description: ""
    })

    useEffect(() => {
        load()
    }, [])

    async function load() {
        try {
            // 1. Ambil Data Dashboard (Rekening)
            const dashboard = await fetch("/api/dashboard")
            
            if (dashboard.ok) {
                const contentType = dashboard.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const dashboardJson = await dashboard.json()
                    
                    // DEBUG: Buka inspect/console di browser untuk melihat struktur ini
                    console.log("Data dari /api/dashboard:", dashboardJson)
                    
                    // Pastikan mengambil properti yang tepat (dashboardJson.accounts atau dashboardJson jika berupa array langsung)
                    if (dashboardJson && dashboardJson.accounts) {
                        setAccounts(dashboardJson.accounts)
                    } else if (Array.isArray(dashboardJson)) {
                        setAccounts(dashboardJson)
                    } else {
                        setAccounts([])
                    }
                } else {
                    console.error("API /api/dashboard tidak mengembalikan JSON melainkan HTML/Text")
                }
            } else {
                console.error(`Gagal memuat dashboard: Status ${dashboard.status}`)
            }

            // 2. Ambil Data Transaksi
            const trx = await fetch("/api/transactions")
            if (trx.ok) {
                const contentType = trx.headers.get("content-type")
                if (contentType && contentType.includes("application/json")) {
                    const trxJson = await trx.json()
                    setList(Array.isArray(trxJson) ? trxJson : [])
                }
            } else {
                console.error(`Gagal memuat transaksi: Status ${trx.status}`)
            }
        } catch (err) {
            console.error("Error saat memuat data di frontend:", err)
        }
    }

    async function save() {
        if (!form.account) {
            alert("Pilih rekening")
            return
        }
        if (!form.amount) {
            alert("Masukkan jumlah")
            return
        }

        setLoading(true)
        try {
            const url = editId
                ? `/api/transactions/${editId}`
                : "/api/transactions";

            const method = editId
                ? "PUT"
                : "POST";

            const res = await fetch(url,{
                method,
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    account:Number(form.account),
                    type:form.type,
                    amount:Number(form.amount),
                    description:form.description
                })
            });

            const json = await res.json()
            if (!res.ok) {
                alert(json.error || "Gagal menyimpan transaksi");
                return;
            }

            if (json.error) {
                alert(json.error)
                return
            }

            setEditId(null);

            setForm({
                account: "",
                type: "expense",
                amount: "",
                description: ""
            })
            await load()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function update() {
        if (!form.account) {
            alert("Pilih rekening");
            return;
        }

        if (!form.amount) {
            alert("Masukkan jumlah");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/transactions/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    account: Number(form.account),
                    type: form.type,
                    amount: Number(form.amount),
                    description: form.description
                })
            });

            const json = await res.json();

            if (!res.ok) {
                alert(json.error);
                return;
            }

            setForm({
                account: "",
                type: "expense",
                amount: "",
                description: ""
            });
            setEditId(null);
            load();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 lg:p-10 space-y-8">
            <h1 className="text-4xl font-bold">Transaksi</h1>
            <div className="glass rounded-3xl p-6 space-y-4">
                {/* Dropdown Rekening */}
                <select
                    className="input bg-transparent text-white w-full p-2 rounded-xl border border-white/20"
                    value={form.account}
                    onChange={e => setForm({ ...form, account: e.target.value })}
                >
                    {/* bg-slate-900 ditambahkan agar teks putih terlihat saat opsi terbuka */}
                    <option value="" className="bg-slate-900 text-white">
                        Pilih Rekening
                    </option>
                    {accounts.map(a => (
                        <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                            {a.name}
                        </option>
                    ))}
                </select>

                {/* Dropdown Tipe */}
                <select
                    className="input bg-transparent text-white w-full p-2 rounded-xl border border-white/20"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                >
                    <option value="expense" className="bg-slate-900 text-white">
                        Pengeluaran
                    </option>
                    <option value="income" className="bg-slate-900 text-white">
                        Pemasukan
                    </option>
                </select>

                <input
                    className="input"
                    type="number"
                    placeholder="Jumlah"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                />

                <input
                    className="input"
                    placeholder="Deskripsi"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                />

                <button
                    className="primary"
                    disabled={loading}
                    onClick={() => {
                        if (editId) {
                            update();
                        } else {
                            save();
                        }
                    }}
                >
                    {loading
                        ? "Menyimpan..."
                        : editId
                            ? "Update"
                            : "Simpan"}
                </button>
            </div>

            {/* List Transaksi */}
            <div className="space-y-4">
                {list.length === 0 ? (
                    <div className="glass rounded-3xl p-10 text-center text-slate-400">
                        Belum ada transaksi
                    </div>
                ) : (
                    list.map(t => (
                        <div key={t.id} className="glass rounded-3xl p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold">
                                        {t.description || "Tanpa deskripsi"}
                                    </div>

                                    <div className="text-slate-400">
                                        {t.account}
                                    </div>

                                    <div
                                        className={
                                            t.type === "income"
                                                ? "text-green-400 mt-1"
                                                : "text-red-400 mt-1"
                                        }
                                    >
                                        {t.type === "income" ? "+ " : "- "}
                                        Rp {Number(t.amount).toLocaleString("id-ID")}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 transition"
                                        onClick={() => {
                                            setEditId(t.id);

                                            setForm({
                                                account: t.account_id,
                                                type: t.type,
                                                amount: t.amount,
                                                description: t.description
                                            });
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 transition"
                                        onClick={async () => {
                                            if (!confirm("Hapus transaksi?")) return;
                                            const res = await fetch(`/api/transactions/${t.id}`, {
                                                method: "DELETE",
                                            });
                                            const json = await res.json();
                                            console.log(res.status);
                                            console.log(json);
                                            if (!res.ok) {
                                                alert(json.error);
                                                return;
                                            }

                                            alert("Berhasil dihapus");
                                            load();
                                        }}>Hapus</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}