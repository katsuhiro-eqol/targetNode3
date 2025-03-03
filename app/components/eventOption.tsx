'use client';
import React from "react";
import { useState, useEffect } from 'react';
import { Circle, CircleDot } from 'lucide-react';

export default function EventOption(){

    return (
        <div>
            <div className="font-semibold mt-5 text-sm ml-3">トップ画面</div>
            <div className="text-xs text-red-600">（トップ画面の画像をオリジナルの静止画に変更することができます）</div>
            <div className="font-semibold mt-5 text-sm ml-3">イベント期間（ユーザーが利用する期間）</div>
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