"use client"
import React from "react";

export default function ExpiredPage(){
 

    return (
        <div className="flex flex-col w-full overflow-hidden" style={{ height: "100dvh" }}>
        <div className="fixed inset-0 flex flex-col items-center h-full bg-stone-200">
               <div className="mt-32 text-center font-bold text-xl">アクセス権限がないか、アクセス期間が終了しています</div>
               <div className="mt-12 text-center ext-lg">再度QRコードを読み込んでください</div>
            </div>
        </div>
    )
}
