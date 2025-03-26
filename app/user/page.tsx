"use client"
import React from "react";
import { useEffect } from "react";
//import { useSearchParams } from "next/navigation";
import {Sidebar} from "../components/sideBar"
import {menuItems} from "../components/menuData"

export default function User(){



    useEffect(() => {
        console.log("storage", sessionStorage.getItem("user"))
    }, [])


    return (
        <div>
            <div className="font-bold text-xl my-3">「AIコンシェルジュ」管理者用ページ</div>
            <div className="text-sm">「AIコンシェルジュ」(AIコン)は、契約者自らが対話型AIのデータベースを構築し、WEBアプリケーションとしてユーザーに提供できるサービスです。この管理者用ページでデータベースを構築・管理していきます。</div>
            <div className="text-sm">データベースは「イベント」と「Q&Aデータ」からなります。複数のイベントを同時に運用することも可能です。</div>
            <img className="w-96" src="/AIコン_イベントQA.png" alt="Image" />
            <div className="mt-8 font-semibold">イベント登録</div>
            <div className="text-sm">データベースの１セットのことをAIコンシェルジュではイベントと呼びます。最初にイベントを登録してデータベースの枠組みを作ります。</div>
            <div className="text-sm">イベントで設定する項目は、「使用する言語」「AI音声キャラ」「読み辞書」「UI画像」「利用期間」です。</div>
            <div className="mt-8 font-semibold">Q&Aデータ登録</div>
            <div className="text-sm">イベント設定後にQ&Aデータを登録します。Q&Aデータはエクセルやグーグルスプレッドシートなどで作成しCSVファイルに変換して登録します。</div>
            <div className="text-sm">CSVファイルの作成手順・順守事項については、必ず手順書をご確認ください。</div>
            <div className="mt-8 font-semibold">登録情報一覧</div>
            <div className="text-sm">登録したイベントおよびQ&A情報は登録情報一覧で確認できます。自動生成した外国語翻訳文、AI音声、添付書類なども確認できます。</div>
            <div className="mt-8 font-semibold">QRコード発行</div>
            <div className="text-sm">ユーザーが使用するWEBアプリのURLをQRコードで発行することができます。</div>
        </div>
    )
}