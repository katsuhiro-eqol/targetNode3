"use client"
import React from "react";
import { useState } from "react";
import {Sidebar} from "../../components/sideBar"

export default function UpdateFile(){
    return (
        <div className="flex">
        <div>
            <Sidebar />
        </div>
        <div className="ml-64 p-8 w-full">
            <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <div className="font-bold text-xl">添付ファイルの修正</div>

            </div>
        </div>
        </div>
    )
}