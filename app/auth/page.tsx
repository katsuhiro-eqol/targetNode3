"use client"
import React from "react";
import { useState, useEffect, useRef } from "react";
import REGISTER_CSV from "../components/registerCSV";
import {db} from "@/firebase"
import { collection, query, where, getDocs} from "firebase/firestore"
import Link from "next/link";


export default function AUTH() {
    const [organization, setOrganization] = useState<string>("")
    const [event, setEvent] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [auth, setAuth] = useState<boolean>(false)

    const login = async() => {
        console.log(organization, event, password)
        try {
            const q = query(collection(db,"Setting"), where("organization", "==", organization), where("event", "==", event), where("password", "==", password))
            const querySnapshot = await getDocs(q)
            if (querySnapshot.docs.length != 0){
                const data = querySnapshot.docs[0].data()
                console.log(data)
                setAuth(true)
            } else {
                alert("認証できませんでした")
            }
        } catch (error){
            alert("認証エラー")
        }
    }

    useEffect(() => {
        console.log(auth)
    }, [auth])

  return (
    <div className="flex justify-center">
    {auth ? (
        <div className="w-full">
            <REGISTER_CSV />
        </div>
    ):(
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="py-14 font-bold text-xl">ログイン画面</div>
        <label className="text-md" htmlFor="email">
        会社名（組織名）
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="organization"
        placeholder="会社名"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
        />
        <label className="text-md" htmlFor="email">
        イベント名
        </label>
        <input
        className="rounded-md px-4 py-2 bg-inherit border mb-6"
        name="event"
        placeholder="イベント名"
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        />
        <label className="text-md" htmlFor="password">
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
    )}   
    </div>
  );
}