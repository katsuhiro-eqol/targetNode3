"use client"
import React from "react";

export default function Rayout({children}:{children:React.ReactNode}){
    return (
        <div className="flex">
        <div className="p-8 w-full">
            {children}
        </div>
        </div>
    )
}