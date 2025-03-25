"use client"
import React from "react";
import {Sidebar} from "../components/sideBar"
import {menuItems} from "../components/menuData"

export default function Rayout({children}:{children:React.ReactNode}){
    return (
        <div className="flex">
        <div>
            <Sidebar menuItems={menuItems} />
        </div>
        <div className="ml-64 p-8 w-full">
            {children}
        </div>
        </div>
    )
}