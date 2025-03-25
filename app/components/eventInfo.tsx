'use client';
import React from "react";
import { useState, useEffect } from 'react';
import { Circle, CircleDot } from 'lucide-react';
import { Event } from "@/types"

interface EventInfoProps {
    eventData: Event;
}

export default function EventInfo({eventData}:EventInfoProps){
    const [comment, setComment] = useState<string>("")

    const columns = [
        { key: 'name', label: 'イベント' },
        { key: 'code', label: 'コード' },
        { key: 'voice', label: 'Voice' },
        { key: 'langString', label: '対応外国語' },
        { key: 'pronunceStr', label: '読み辞書' },
        { key: 'image', label: 'UI画像' },
        { key: 'period', label: '利用期間' }
    ]

    return (
        <div>
            <div className="container mx-auto p-4">
            <table className="min-w-full border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    {columns.map((column) => (
                    <th 
                        key={column.key}
                        className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700 text-xs"
                    >
                        {column.label}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                    <tr 
                    key={eventData.id} 
                    className=""
                    >
                    {columns.map((column) => {
                        // 選択カラムの場合はアイコンを表示
                        if (column.key === 'selection') {
                        return (
                            <td 
                            key={`${eventData.id}-${column.key}`}
                            className="border border-gray-300 px-4 py-2 cursor-pointer"
                            
                            >
                            </td>
                        );
                        }
                        // その他のカラムは通常通り表示
                        return (
                        <td 
                            key={`${eventData.id}-${column.key}`}
                            className="border border-gray-300 px-4 py-2 text-xs"
                        >
                            {eventData[column.key]}
                        </td>
                        );
                    })}
                    </tr>
                </tbody>
            </table>
            </div>
        </div>
    )
}