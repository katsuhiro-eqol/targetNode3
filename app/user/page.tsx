"use client"
import React from "react";
import { useEffect } from "react";
//import { useSearchParams } from "next/navigation";
import {Sidebar} from "../components/sideBar"
import {menuItems} from "../components/menuData"

export default function User(){



    useEffect(() => {
        console.log("storage", sessionStorage.getItem("user"))
    }, [])


    return (
        <div className="flex">
            <Sidebar menuItems={menuItems} />
        <div className="ml-64 p-8 w-full">
            <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <div className="font-bold text-xl">管理者用ページ</div>
            </div>
        </div>
        </div>
    )
}