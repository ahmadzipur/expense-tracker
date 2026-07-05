import {
    Wallet
}
    from "lucide-react"

export default function Logo() {

    return (

        <div className="flex items-center gap-3 justify-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                <Wallet
                    size={30}
                />
            </div>
            <div>
                <div className="text-2xl font-bold">
                    Smart Expense
                </div>
                <div className="text-sm text-slate-300">
                    Track • Budget • Grow
                </div>
            </div>
        </div>
    )
}