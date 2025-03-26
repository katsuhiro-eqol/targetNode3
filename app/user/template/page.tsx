import React from "react";
import Link from "next/link"
import { Mic, Send, Eraser, Paperclip, X } from 'lucide-react';

export default function Template(){
    const externalUrl = "https://docs.google.com/spreadsheets/d/1FNfLlfy-bwSmuwqpQPZ84voiiD0noBmD5bGPfEjuu2c/edit?gid=76980423#gid=76980423"
    const documentUrl = "https://docs.google.com/document/d/1vxjadL7rg6gAaAgoDNg1IsCrO0cuQ28HQ3aYxmZqPf8/preview"

    return (
        <div>
        <div className="font-bold text-xl mb-6">Q&Aテンプレートと記入例</div>
        <Link className="flex items-center space-x-2 hover:text-blue-600 transition-color mb-5" href={externalUrl} target="_blank" >
            <Paperclip />
            <span>Google Spreadsheetのリンク</span>
        </Link>
        <Link className="flex items-center space-x-2 hover:text-blue-600 transition-color mb-5" href="/AIコンQAテンプレート.xlsx" target="_blank" >
            <Paperclip />
            <a>Excelファイルのダウンロード</a>
        </Link>
        <div className="w-full h-screen overflow-hidden">
        <iframe
            src={documentUrl}
            className="w-full h-full border-none"
            allowFullScreen
        />
        </div>

        </div>
    )
}

/*
        <div className="w-full h-screen overflow-hidden">
        <iframe
            src={templateUrl}
            className="w-full h-full border-none"
            allowFullScreen
        />
        </div>
*/