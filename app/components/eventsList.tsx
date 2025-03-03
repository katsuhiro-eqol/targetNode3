'use client';
import React from "react";
import { useState, useEffect } from 'react';
import { Circle, CircleDot } from 'lucide-react';

export default function EventsList({eventsData, setEventId}){
    const [selectedRowId, setSelectedRowId] = useState(null)

    const columns = [
        { key: 'selection', label: '' },
        { key: 'name', label: 'イベント名' },
        { key: 'image', label: 'UI画像' },
        { key: 'voice', label: 'Voice' },
        { key: 'languages', label: '対応外国語' },
        { key: 'period', label: '利用期間' }
    ]

    const toggleRowSelection = (rowId) => {
        if (selectedRowId === rowId) {
          setSelectedRowId(null); // 選択解除
        } else {
          setSelectedRowId(rowId); 
        }
    }

    useEffect(() => {
        console.log(selectedRowId)
    }, [selectedRowId])

    return (
        <div>
            <div className="container mx-auto p-4">
            <table className="min-w-full border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    {columns.map((column) => (
                    <th 
                        key={column.key}
                        className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 text-sm"
                    >
                        {column.label}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {Array.isArray(eventsData) && eventsData.map((row) => (
                    <tr 
                    key={row.id} 
                    className={`hover:bg-gray-50 ${selectedRowId === row.id ? 'bg-blue-50' : ''}`}
                    >
                    {columns.map((column) => {
                        // 選択カラムの場合はアイコンを表示
                        if (column.key === 'selection') {
                        return (
                            <td 
                            key={`${row.id}-${column.key}`}
                            className="border border-gray-300 px-4 py-2 cursor-pointer"
                            onClick={() => toggleRowSelection(row.id)}
                            >
                            {selectedRowId === row.id ? (
                                <CircleDot size={20} className="text-blue-500 font-bold" />
                            ) : (
                                <Circle size={20} className="text-gray-400 font-bold" />
                            )}
                            </td>
                        );
                        }
                        // その他のカラムは通常通り表示
                        return (
                        <td 
                            key={`${row.id}-${column.key}`}
                            className="border border-gray-300 px-4 py-2 text-sm"
                        >
                            {row[column.key]}
                        </td>
                        );
                    })}
                    </tr>
                ))}
                </tbody>
            </table>
            <div>
                <button className="bg-cyan-500 hover:bg-cyan-700 text-white ml-3 mt-3 px-2 py-1 rounded text-xs" onClick={() => setEventId(selectedRowId)}>Q&Aデータ表示</button>
            </div>
            </div>
        </div>
    )
}