"use client";

import ExpenseChart from "@/components/ExpenseChart";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/dashboard");

      // 1. Validasi status respons HTTP terlebih dahulu
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        
        // Cek apakah server mengirimkan error dalam format JSON
        if (contentType && contentType.includes("application/json")) {
          const errorJson = await res.json();
          console.error("API Error (JSON):", errorJson.error);
        } else {
          // Jika server mengirimkan HTML (Error 500/Mundur ke halaman error Next.js)
          console.error(`API Error HTTP ${res.status}: Server tidak mengembalikan JSON yang valid.`);
        }

        // Otomatis tendang ke halaman login jika tidak terotorisasi (401)
        if (res.status === 401) {
          window.location.href = "/login";
        }
        return;
      }

      // 2. Jika res.ok bernilai true, baru aman untuk parsing JSON
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Gagal mengambil data (Network/Syntax Error):", err);
    }
  }

  // State Loading ketika data masih null
  if (!data) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Memuat...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div>
        <div className="text-slate-400">Selamat Datang</div>
        <h1 className="text-3xl lg:text-5xl font-bold">
          {data.user?.name}
        </h1>
      </div>

      {/* Grid Card Ringkasan Saldo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Total Saldo" value={data.total} />
        <Card title="Pemasukan" value={data.income} />
        <Card title="Pengeluaran" value={data.expense} />
      </div>

      {/* Grid Grafik dan Daftar Rekening */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Rekening */}
        <div className="lg:col-span-3 glass rounded-[30px] p-8">
          <h2 className="text-2xl font-bold mb-5">Rekening</h2>
          <div className="space-y-3">
            {(data.accounts || []).length === 0 ? (
              <div className="text-slate-400 italic">Belum ada rekening</div>
            ) : (
              data.accounts.map((x) => (
                <div key={x.id} className="bg-white/5 rounded-2xl p-4">
                  <div className="font-medium text-white">{x.name}</div>
                  <div className="text-cyan-300 mt-1">
                    Rp {Number(x.balance || 0).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Card reusable
function Card({ title, value }) {
  return (
    <div className="glass rounded-[30px] p-8">
      <div className="text-slate-400">{title}</div>
      <div className="mt-4 text-3xl font-bold">
        Rp {Number(value || 0).toLocaleString("id-ID")}
      </div>
    </div>
  );
}