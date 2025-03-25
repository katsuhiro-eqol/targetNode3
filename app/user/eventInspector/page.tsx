"use client"
import React from "react";
//import { useState } from "react";
import {Sidebar} from "../../components/sideBar"
import {menuItems} from "../../components/menuData"

export default function EventInspector(){
    return (
        <div>
            <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <div className="font-bold text-xl">イベント進捗状況</div>
            <div>分類できなかった質問のリスト</div>
            <div>QA総数・日別等</div>
            <div>質問ランキング</div>
            </div>
        </div>
    )
}