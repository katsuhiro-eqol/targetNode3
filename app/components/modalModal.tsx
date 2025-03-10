"use client"
import React from "react";

export default function ModalModal({setIsModal, modalUrl, modalFile}){

    const closeModal = () => {
        setIsModal(false)
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex flex-col w-96 h-2/3 bg-white p-6 rounded-lg shadow-lg relative mx-auto mt-auto mb-12">
                <div className="text-center text-lg font-bold mb-6">{modalFile}</div>
                <img src={modalUrl} alt="Image" />
                <button className="text-xs border-2 w-16 h-6 mt-auto mb-1 mx-auto bg-slate-100" onClick={() => closeModal()}>閉じる</button>
            </div>
        </div>
    )
}