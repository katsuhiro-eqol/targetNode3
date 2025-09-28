"use client"
import React from "react";

interface UsersManualProps {
    setIsManual: (setIsManual: boolean ) => void;
    language:string;
}

export default function UsersManual({setIsManual, language}:UsersManualProps){

    return (
        <div className="flex justify-center">
            {language === "日本語" && (
                <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
                <div className="mt-10 font-bold text-xl text-center">AIコンシェルジュの利用に当たって</div>
                <div className="mt-6"><div className="font-bold text-blue-700">はじめに：</div>このアプリはユーザーの質問に出来るだけ正しく回答するように設計されていますが、学習していない内容については回答が不十分であったり、回答ができない場合があることをご了承ください。</div>
                <div className="mt-6"><div className="font-bold text-blue-700">操作手順：</div>最初に使用言語(language)のプルダウンメニューにて言語を選択してください。その後、「AIコンシェルジュ」ボタンをタップするとアプリが開始します。AIコンシェルジュへの質問は選択した言語でお願いします。</div>
                <button onClick={()=>setIsManual(false)} className="mt-40 text-blue-500 hover:text-blue-700 text-sm">戻る(back)</button>
                </div>
            )}
            {language === "英語" && (
                <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
                <div className="mt-10 font-bold text-xl text-center">Regarding the use of the AI concierge service</div>
                <div className="mt-6"><div className="font-bold text-blue-700">Introduction:</div>This app is designed to provide accurate answers to user questions as much as possible, but please note that it may not be able to provide complete or accurate answers for topics it has not learned about.</div>
                <div className="mt-6"><div className="font-bold text-blue-700">Operating instructions</div>First, please select your preferred language from the dropdown menu. Then, tap the AI Concierge button to start the app. Please ask your questions to the AI concierge in the language you selected.</div>
                <button onClick={()=>setIsManual(false)} className="mt-40 text-blue-500 hover:text-blue-700 text-sm">戻る(back)</button>
                </div>
            )}
            {language === "中国語（簡体）" && (
                <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
                <div className="mt-10 font-bold text-xl text-center">使用AI礼宾服务时</div>
                <div className="mt-6"><div className="font-bold text-blue-700">介绍:</div>此应用程序旨在尽可能准确地回答用户的问题，但请注意，对于尚未研究的内容，答案可能不够或无法给出</div>
                <div className="mt-6"><div className="font-bold text-blue-700">操作程序</div>首先，从下拉菜单中选择您的语言。然后点击AI Concierge按钮启动应用程序。请使用您选择的语言向AI Concierge提问</div>
                <button onClick={()=>setIsManual(false)} className="mt-40 text-blue-500 hover:text-blue-700 text-sm">返回(back)</button>
                </div>
            )}
            {language === "中国語（繁体）" && (
                <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
                <div className="mt-10 font-bold text-xl text-center">使用AI禮賓服務時</div>
                <div className="mt-6"><div className="font-bold text-blue-700">介紹:</div>此應用程式旨在盡可能準確地回答用戶的問題，但請注意，對於尚未研究的內容，答案可能不夠或無法給出</div>
                <div className="mt-6"><div className="font-bold text-blue-700">操作程式</div>首先，從下拉式選單中選擇您的語言。然後點擊AI Concierge按鈕啟動應用程式。請使用您選擇的語言向AI Concierge提問</div>
                <button onClick={()=>setIsManual(false)} className="mt-40 text-blue-500 hover:text-blue-700 text-sm">返回(back)</button>
                </div>
            )}
             {language === "韓国語" && (
                <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
                <div className="mt-10 font-bold text-xl text-center">AI 컨시어지 이용에 있어서</div>
                <div className="mt-6"><div className="font-bold text-blue-700">소개:</div>이 앱은 사용자의 질문에 가능한 한 정확하게 답변하도록 설계되었지만 학습하지 않은 내용에 대해서는 답변이 충분하지 않거나 답변을 못할 수 있습니다.</div>
                <div className="mt-6"><div className="font-bold text-blue-700">작동 절차</div>먼저 사용 언어(language)의 풀다운 메뉴에서 언어를 선택하십시오. 그런 다음 AI 컨시어지 버튼을 탭하면 앱이 시작됩니다. AI 컨시어지에 대한 질문은 선택한 언어로 부탁드립니다.</div>
                <button onClick={()=>setIsManual(false)} className="mt-40 text-blue-500 hover:text-blue-700 text-sm">뒤로(back)</button>
                </div>
            )}           
        </div>
    )
}