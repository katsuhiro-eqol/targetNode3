'use client';
import React from "react";
import { useState, useEffect } from 'react';
import UploadUIImage from "./uploadUIImage"

export default function UiOption({uiOption, setUiOption, setImage, organization}){
    const [selectedIndex, setSelectedIndex] = useState<number>(0)
    const [isOriginal, setIsOriginal] = useState<boolean>(false)
    const [originalImages, setOriginalImages] = useState([])

    const selectUIImage = (n) => {
        setSelectedIndex(n)
        setImage(uiOption[n])
    }

    useEffect(() => {
        console.log(uiOption)
        console.log(uiOption[selectedIndex])
    }, [uiOption])

    useEffect(() => {
        const newImages = uiOption.concat(originalImages)
        setUiOption(newImages)
    }, [originalImages])

    return (
        <div>
            <div className="flex space-x-4 ml-3">
            {uiOption.map((image, index) => (
                <div key={index} className={`flex flex-col items-center cursor-pointer mt-2 pt-1 ${
                    selectedIndex === index ? "border-2 border-blue-500" : "border-2 border-transparent"
                  }`} onClick={() => selectUIImage(index)} >
                <img src={`${image.url}`} alt={"Image"} className="w-24" />
                <p className="mt-2 text-center text-xs">{image.name}</p>
                </div>
            ))}
            </div>
            <div className="text-xs text-red-600 mt-3">（AIコンのUI画像をオリジナルの静止画に変更することもできます）</div>
            {!isOriginal && (
                <button className="text-xs px-2 py-1 border-2 bg-slate-200 rounded" onClick={() => setIsOriginal(true)}>オリジナル画像を登録する</button>
            )}
            {isOriginal && (
                <UploadUIImage organization={organization} setIsOriginal={setIsOriginal} setOriginalImages={setOriginalImages} uiOption={uiOption} setUiOption={setUiOption} />
            )}
        </div>
    )
}