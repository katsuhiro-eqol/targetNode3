import React from "react";

export default function Manual(){
    const procedureUrl = "https://docs.google.com/document/d/1dPqa500R7lRYAI2TtkalqJx304g-oktvnsMbVy17gPA/preview"
    return (
        <div>
        <div className="font-bold text-xl">管理者用マニュアル</div>
        <div className="w-full h-screen overflow-hidden">
        <iframe
            src={procedureUrl}
            className="w-full h-full border-none"
            allowFullScreen
        />
        </div>
        </div>
    )
}