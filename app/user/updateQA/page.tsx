"use client"
import React from "react";
import { useState, useEffect } from "react";
import { storage } from "@/firebase"
import { ref, getDownloadURL } from "firebase/storage";
import {Sidebar} from "../../components/sideBar"
import {menuItems} from "../../components/menuData"

export default function UpdateEvent(){

    /*
    const getDownloadUrl = async() => {
        console.log("no_sound")
        const path = "aicon_audio/no_sound.wav"
        await getDownloadURL(ref(storage, path))
        .then((url) => {
            console.log(url)
            return url
        })
        .catch((error) => {
          return error
        });
    }

    const url =getDownloadUrl()
    console.log(url)
    */

    return (
        <div className="flex">
        <div>
            <Sidebar menuItems={menuItems} />
        </div>
        <div className="ml-64 p-8 w-full">
            <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <div className="font-bold text-xl">QA追加</div>

            </div>
        </div>
        </div>
    )
}