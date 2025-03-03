"use client"
import React from "react";

export default function ForeignModal({setIsForeign, foreignData, answer}){

    const closeModal = () => {
        setIsForeign(false)
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-2/3 bg-white p-6 rounded-lg shadow-lg relative ml-auto mr-24 mt-auto mb-24">
                <div className="text-center text-lg font-bold mb-6">外国語の回答</div>
                <div className="mb-4">日本語: {answer}</div>
                {Array.isArray(foreignData) && foreignData.map((row, index) => {
                    return (<div className="mb-4" key={index}>{Object.keys(row)[0]}: {row[Object.keys(row)[0]]}</div>)
                } )}


                <button className="text-xs border-2 w-16 h-6 mt-auto mb-1 mx-auto bg-slate-100" onClick={() => closeModal()}>閉じる</button>
            </div>
        </div>
    )
}