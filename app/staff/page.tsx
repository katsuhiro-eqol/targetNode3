"use client"
import { useRouter } from 'next/navigation';

export default function StaffHome() {
    const router = useRouter()

    return (
        <div>
            <div className="text-lg text-center font-bold mb-10">スタッフページ</div>
            <div className="flex justify-center">
            <button className="bg-cyan-500 hover:bg-cyan-700 text-white mx-auto mt-24 px-4 py-2 rounded text-base font-bold" onClick={() => {router.push("/staff/messageManager")}}>チャットサポート</button>
            </div>
        </div>
    );
}
