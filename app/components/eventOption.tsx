'use client';
import React from "react";
import { useState, useEffect } from 'react';
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import UIOption from "./uiOption"
import { Circle, CircleDot } from 'lucide-react';
import { Image } from "@/types"
const yearOption = ["2025", "2026", "2027", "2028"]
const monthOption = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const dayOption = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]
const hourOption =["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]

interface EventOptionProps {
    organization: string;
    setImage: (image: Image) => void;
    setStartTime: (strtTime: string) => void;
    setEndTime: (endTime: string) => void;
    isHumanStaff: boolean;
    setIsHumanStaff: (isHumanStaff: boolean) => void;
}
/*
interface Image {
    [key: string]: string;
}
    */

export default function EventOption({organization, setImage, setStartTime, setEndTime, isHumanStaff, setIsHumanStaff}: EventOptionProps){
    const [uiOption, setUiOption] = useState<Image[]>([])
    const [noLimitStart, setNoLimitStart] = useState<boolean>(true)
    const [noLimitEnd, setNoLimitEnd] = useState<boolean>(true)
    const [startYear, setStartYear] = useState<string>(yearOption[0])
    const [startMonth, setStartMonth] = useState<string>(monthOption[0])
    const [startDay, setStartDay] = useState<string>(dayOption[0])
    const [startHour, setStartHour] = useState<string>(hourOption[0])
    const [endYear, setEndYear] = useState<string>(yearOption[0])
    const [endMonth, setEndMonth] = useState<string>(monthOption[0])
    const [endDay, setEndDay] = useState<string>(dayOption[0])
    const [endHour, setEndHour] = useState<string>(hourOption[0])


    const loadUiOption = async () => {
        try {           
            console.log(organization)
            const docRef = doc(db, "Users", organization)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                setUiOption(data.uiImages)
            } else {
                alert("ログインから始めてください")
            }
        } catch (error) {
            console.log(error)
        }        
    }
    const selectStartYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStartYear(e.target.value)
        const start = `${e.target.value}-${startMonth}-${startDay}T${startHour}:00`
        setStartTime(start)
    }
    const selectEndYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEndYear(e.target.value)
        const end = `${e.target.value}-${endMonth}-${endDay}T${endHour}:00`
        setEndTime(end)
    }
    const selectStartMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStartMonth(e.target.value)
        const start = `${startYear}-${e.target.value}-${startDay}T${startHour}:00`
        setStartTime(start)
    }
    const selectEndMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEndMonth(e.target.value)
        const end = `${endYear}-${e.target.value}-${endDay}T${endHour}:00`
        setEndTime(end)        
    }
    const selectStartDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStartDay(e.target.value)
        const start = `${startYear}-${startMonth}-${e.target.value}T${startHour}:00`
        setStartTime(start)
    }
    const selectEndDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEndDay(e.target.value)
        const end = `${endYear}-${endMonth}-${e.target.value}T${endHour}:00`
        setEndTime(end)        
    }
    const selectStartHour = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStartHour(e.target.value)
        const start = `${startYear}-${startMonth}-${startDay}T${e.target.value}:00`
        setStartTime(start)
    }
    const selectEndHour = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEndHour(e.target.value)
        const end = `${endYear}-${endMonth}-${endDay}T${e.target.value}:00`
        setEndTime(end)        
    }

    useEffect(() => {
        loadUiOption()
    }, [])


    return (
        <div>
            <div className="font-semibold mt-3 text-sm ml-3 underline">UI画面</div>
            <UIOption uiOption={uiOption} setImage={setImage} organization={organization} setUiOption={setUiOption} />
            <div className="font-semibold mt-6 text-sm ml-3 underline">人間スタッフとのチャット有無</div>
            {!isHumanStaff ? (
            <div className="flex flex-row gap-x-4 h-5 ml-3">
                <CircleDot className="mt-3 w-4 h-4 text-blue-500" onClick={()=>setIsHumanStaff(false)} />
                <div className="mt-3 text-xs">スタッフチャットなし</div>
                <Circle className="mt-3 w-4 h-4 text-gray-400" onClick={()=>setIsHumanStaff(true)} />
                <div className="mt-3 text-xs">スタッフチャットあり</div>
            </div>                    
            ):(
            <div className="flex flex-row gap-x-4 h-5 ml-3">
                <Circle className="mt-3 w-4 h-4 text-gray-400" onClick={()=>setIsHumanStaff(false)} />
                <div className="mt-3 text-xs">スタッフチャットなし</div>
                <CircleDot className="mt-3 w-4 h-4 text-blue-500" onClick={()=>setIsHumanStaff(true)}/>
                <div className="mt-3 text-xs">スタッフチャットあり</div>
            </div>         
            )}
            <div className="font-semibold mt-8 text-sm ml-3 underline">利用期間（ユーザーが利用できる期間）</div>
            <div className="flex flex-row gap-x-4">
                <div className="ml-3 mt-3 text-xs">利用開始日時: </div>
                {noLimitStart ? (
                <div className="flex flex-row gap-x-4 h-5">
                    <CircleDot className="mt-3 w-4 h-4 text-blue-500" />
                    <div className="mt-3 text-xs">指定なし</div>
                    <Circle className="mt-3 w-4 h-4 text-gray-400" onClick={()=>setNoLimitStart(false)} />
                    <div className="mt-3 text-xs">設定</div>
                </div>
                ):(
                    <div className="flex flex-row gap-x-4 h-5">
                    <Circle className="mt-3 w-4 h-4 text-gray-400" onClick={()=>setNoLimitStart(true)} />
                    <div className="mt-3 text-xs">指定なし</div>
                    <CircleDot className="mt-3 w-4 h-4 text-blue-500" />
                    <div className="mt-3 text-xs">設定</div>
                    <select className="ml-8 my-3 w-20 h-5 text-xs text-center border-2" value={startYear} onChange={selectStartYear}>
                    {yearOption.map((year) => {
                    return <option key={year} value={year}>{year}</option>;
                    })}
                    </select>
                    <select className="my-3 w-20 h-5 text-xs text-center border-2" value={startMonth} onChange={selectStartMonth}>
                    {monthOption.map((month) => {
                    return <option key={month} value={month}>{month}</option>;
                    })}
                    </select>
                    <select className="my-3 w-20 h-5 text-xs text-center border-2" value={startDay} onChange={selectStartDay}>
                    {dayOption.map((day) => {
                    return <option key={day} value={day}>{day}</option>;
                    })}
                    </select>
                    <select className="my-3 w-20 h-5 text-xs text-center border-2" value={startHour} onChange={selectStartHour}>
                    {hourOption.map((hour) => {
                    return <option key={hour} value={hour}>{hour}</option>;
                    })}
                    </select>
                    </div>
                )}
                </div>
                <div className="flex flex-row gap-x-4">
                <div className="ml-3 mt-3 text-xs">利用終了日時: </div>
                {noLimitEnd ? (
                <div className="flex flex-row gap-x-4 h-5">
                    <CircleDot className="mt-3 w-4 h-4 text-blue-500" />
                    <div className="mt-3 text-xs">指定なし</div>
                    <Circle className="mt-3 w-4 h-4 text-gray-400" onClick={()=>setNoLimitEnd(false)} />
                    <div className="mt-3 text-xs">設定</div>
                </div>
                ):(
                    <div className="flex flex-row gap-x-4 h-5">
                    <Circle className="mt-3 w-4 h-4 text-gray-400" onClick={()=>setNoLimitEnd(true)} />
                    <div className="mt-3 text-xs">指定なし</div>
                    <CircleDot className="mt-3 w-4 h-4 text-blue-500" />
                    <div className="mt-3 text-xs">設定</div>
                    <select className="ml-8 my-3 w-20 h-5 text-xs text-center border-2" value={endYear} onChange={selectEndYear}>
                    {yearOption.map((year) => {
                    return <option key={year} value={year}>{year}</option>;
                    })}
                    </select>
                    <select className="my-3 w-20 h-5 text-xs text-center border-2" value={endMonth} onChange={selectEndMonth}>
                    {monthOption.map((month) => {
                    return <option key={month} value={month}>{month}</option>;
                    })}
                    </select>
                    <select className="my-3 w-20 h-5 text-xs text-center border-2" value={endDay} onChange={selectEndDay}>
                    {dayOption.map((day) => {
                    return <option key={day} value={day}>{day}</option>;
                    })}
                    </select>
                    <select className="my-3 w-20 h-5 text-xs text-center border-2" value={endHour} onChange={selectEndHour}>
                    {hourOption.map((hour) => {
                    return <option key={hour} value={hour}>{hour}</option>;
                    })}
                    </select>
                </div>
                )}
            </div>
        </div>
    )
}

/*
<div className="font-semibold mt-6 text-sm ml-3 underline">人間スタッフとのチャット有無</div>
    {!isHumanStaff ? (
    <div className="flex flex-row gap-x-4 h-5 ml-3">
        <CircleDot className="mt-3 w-4 h-4 text-blue-500" onClick={()=>setIsHumanStaff(false)} />
        <div className="mt-3 text-xs">スタッフチャットなし</div>
        <Circle className="mt-3 w-4 h-4 text-gray-400" onClick={()=>setIsHumanStaff(true)} />
        <div className="mt-3 text-xs">スタッフチャットあり</div>
    </div>                    
    ):(
    <div className="flex flex-row gap-x-4 h-5 ml-3">
        <Circle className="mt-3 w-4 h-4 text-blue-500" onClick={()=>setIsHumanStaff(false)} />
        <div className="mt-3 text-xs">スタッフチャットなし</div>
        <CircleDot className="mt-3 w-4 h-4 text-gray-400" onClick={()=>setIsHumanStaff(true)}/>
        <div className="mt-3 text-xs">スタッフチャットあり</div>
    </div>         
    )}
    */

/*
            <div className="font-semibold mt-5 text-sm ml-3 underline">スタート時のメッセージ</div>
            <SetStartText />
*/