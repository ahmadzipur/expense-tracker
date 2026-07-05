import Sidebar from "@/components/Sidebar"

export default function Layout({
    children
}) {

    return (

        <div>
            <Sidebar />
            <main className="lg:ml-[280px] min-h-screen">
                {children}
            </main>
        </div>
    )
}