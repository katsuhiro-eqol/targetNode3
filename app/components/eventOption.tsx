'use client';
import React from "react";
import { useState, useEffect } from 'react';
import UIOption from "./uiOption"
import { Circle, CircleDot } from 'lucide-react';

export default function EventOption({organization, image, setImage, setStartTime, setEndTime}){
    const [uiOption, setUiOption] = useState<string[]>([])
    //将来的にはfirebaseから読みこむ
    const imageList = {"DigitalSystem":[{name:"AI-con_man2_01.png",url:"/AI-con_man2_01.png"} , {name:"AI-con_woman2_01.png", url:"/AI-con_woman2_01.png"}, {name:"AI-con_man_01.png", url:"/AI-con_man_01.png"}, {name:"AI-con_woman_01.png",url:"/AI-con_woman_01.png"}], "default":[{name:"AI-con_man_01.png", url:"/AI-con_man_01.png"}, {name:"AI-con_woman_01.png",url:"/AI-con_woman_01.png"}]}

    useEffect(() => {
        if (organization == "DigitalSystem"){
            const uList = imageList.DigitalSystem
            setUiOption(uList)
        } else {
            const uList = imageList.default
            setUiOption(uList)
        }
    }, [])


    return (
        <div>
            <div className="font-semibold mt-3 text-sm ml-3">AIコントップ画面</div>
            <UIOption uiOption={uiOption} setImage={setImage} organization={organization} setUiOption={setUiOption} />
            <div className="font-semibold mt-5 text-sm ml-3">イベント期間（ユーザーが利用できる期間）</div>
            <div className="flex flex-row gap-x-4">
                <div className="ml-3 mt-3 text-xs">利用開始日時: </div>
                <CircleDot className="mt-3 w-4 h-4 text-blue-500" />
                <div className="mt-3 text-xs">指定なし</div>
            </div>
            <div className="flex flex-row gap-x-4">
                <div className="ml-3 mt-2 text-xs">利用終了日時: </div>
                <CircleDot className="mt-2 w-4 h-4 text-blue-500" />
                <div className="mt-2 text-xs">指定なし</div>
            </div>
        </div>
    )
}