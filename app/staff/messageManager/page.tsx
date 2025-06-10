"use client"
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import AdminDashboard from "@/app/components/adminDashboard"

export default function MessageManager() {
    const [currentStaff, setCurrentStaff] = useState<string>("")
    const [currentEvent, setCurrentEvent] = useState<string>("")
    //const { openMemo, closeMemo, isMemoOpen, updateMemoCount, isClient } = useSupportMemo()
    const router = useRouter()

    useEffect(() => {
        const staff = sessionStorage.getItem("staff")
        const event = sessionStorage.getItem("event")
        const organization = sessionStorage.getItem("organization")
        if (staff && event && organization){
            const eventId = `${organization}_${event}`
            setCurrentStaff(staff)
            setCurrentEvent(eventId)

        } else {
            alert("スタッフまたはエベント名が登録されていません。もう一度ログインしてください。")
            router.push("/staffAuth")
        }
    }, [])

    return (
        <div>
            <AdminDashboard adminId={currentEvent} adminName={currentStaff} event={currentEvent} />
        </div>
    );
}
