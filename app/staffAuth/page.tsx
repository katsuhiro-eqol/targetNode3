"use client"
import React from "react";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function StaffAuth() {
    const [organization, setOrganization] = useState<string>("")
    const [event, setEvent] = useState<string>("")
    const [staff, setStaff] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const router = useRouter()

    const login = async() => {
        if (organization && event && staff && password){
            try {
                sessionStorage.setItem("staff", "")
                sessionStorage.setItem("event", "")
                sessionStorage.setItem("organization", "")
                const response = await fetch("/api/loginStaff", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    //body: JSON.stringify({ input: userInput, character: character, fewShot: fewShot, previousData: previousData, sca: scaList[character] }),
                    body: JSON.stringify({ organization: organization, event: event, staff: staff, password: password}),
                  });
                  const data = await response.json()
                  console.log(data)
                  if (data.success){
                    sessionStorage.setItem("staff", data.staff)
                    sessionStorage.setItem("event", data.event)
                    sessionStorage.setItem("organization", data.organization)
                    router.push("/staff/messageManager")
                  } else {
                    alert('認証に失敗しました');
                  }
            } catch (error){
                console.log(error)
                alert("認証エラー")
            }
        } else {
            alert("未入力項目があります")
        }
    }

  return (
    <div className="flex justify-center">
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="py-14 font-bold text-xl">スタッフログイン画面</div>
        <label className="text-md">
        組織名（会社名)
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="organization"
        placeholder="組織名（アルファベット）"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
        />
        <label className="text-md">
        イベント名
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="event"
        placeholder="イベント名"
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        />
        <label className="text-md">
        ログインするスタッフ
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="staff"
        placeholder="イベント名"
        value={staff}
        onChange={(e) => setStaff(e.target.value)}
        />
        <label className="text-md">
        Password
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        type="password"
        name="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <button className="border-2" onClick={() => login()}>login</button>
        <br />
        </div>
    </div>
  );
}