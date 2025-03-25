"use client"
import React from "react";
//import { useState } from "react";
import {Sidebar} from "../../components/sideBar"
import {menuItems} from "../../components/menuData"

export default function Manual(){
    return (
        <div>
            <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <div className="font-bold text-xl">管理者用マニュアル</div>
            </div>
        </div>
    )
}