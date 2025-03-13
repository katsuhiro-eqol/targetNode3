'use client';
import React from "react";
import {useState, useEffect} from "react"
import ForeignModal from "./foreignModal"
import ModalModal from "./modalModal"
import ListenVoice from "./listenVoice"
import { QaData, Foreign } from "@/types"

interface QADataProps {
    qaData:QaData[];
}

export default function QADataList({qaData}: QADataProps){
    const [isForeign, setIsForeign] = useState<boolean>(false)
    const [foreignData, setForeignData] = useState<Foreign[]>([])
    const [answer, setAnswer] = useState<string>("")
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string>("")
    const [modalFile, setModalFile] = useState<string>("")
    const [isAudio, setIsAudio] = useState<boolean>(false)
    const [voiceUrl, setVoiceUrl] = useState<string>("")

    const columns = [
        { key: 'id', label: 'id' },
        { key: 'question', label: '質問' },
        { key: 'answer', label: '回答' },
        { key: 'foreignStr', label: '外国語回答' },
        { key: 'modalUrl', label: '添付書類' },
        { key: 'voiceId', label: 'AI音声' },
        { key: 'vector', label: 'Embedding' }
    ]

    const showModal = (id:string) => {
        const selectedData = qaData.filter((item) => item.id == id)
        const url = selectedData[0].modalUrl
        const file = selectedData[0].modalFile
        console.log(url)
        console.log(file)
        setIsModal(true)
        setModalUrl(url)
        setModalFile(file)
    }

    const showForeign = (id:string) => {
        console.log("foreign", id)
        const selectedData = qaData.filter((item) => item.id == id)
        if (selectedData[0].foreign){
            const foreign = selectedData[0].foreign
            setForeignData(foreign)
        } else {
            setForeignData([])
        }
        
        setIsForeign(true)
        
        setAnswer(selectedData[0].answer)
    }

    const listenVoice = (id:string) => {
        const selectedData = qaData.filter((item) => item.id == id)
        const vUrl = selectedData[0].voiceUrl
        setIsAudio(true)
        setVoiceUrl(vUrl)
        setAnswer(selectedData[0].answer)
    }

/*
    useEffect(() => {
        console.log(isForeign)
    }, [isForeign])

    useEffect(() => {
        console.log(foreignData)
    }, [foreignData])

    useEffect(() => {
        console.log(voiceUrl)
    }, [voiceUrl])
*/
    return (
        <div>
            <div className="container mx-auto p-4">
            {}
            <table className="min-w-full border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    {columns.map((column) => (
                    <th 
                        key={column.key}
                        className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700 text-sm"
                    >
                        {column.label}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {Array.isArray(qaData) && qaData.map((row) => (
                    <tr key={row.id} >
                    {columns.map((column) => {
                        if (column.key==="foreignStr"){
                            return (
                                <td 
                                key={`${row.id}-${column.key}`}
                                className="border border-gray-300 px-4 py-2"
                              >
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => showForeign(row.id)}
                                    className="bg-slate-400 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    外国語回答を表示
                                  </button>
                                  </div>
                                  </td>
                            )
                        }
                        if (column.key==="modalUrl" && row["modalUrl"] != ""){
                            return (
                                <td 
                                key={`${row.id}-${column.key}`}
                                className="border border-gray-300 px-4 py-2"
                              >
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => showModal(row.id)}
                                    className="bg-slate-400 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    添付書類を表示
                                  </button>
                                  </div>
                                  </td>
                            )
                        }
                        if (column.key==="voiceId"){
                            return (
                                <td 
                                key={`${row.id}-${column.key}`}
                                className="border border-gray-300 px-4 py-2"
                              >
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => listenVoice(row.id)}
                                    className="bg-slate-400 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs"
                                  >
                                    AIボイスを聞く
                                  </button>
                                  </div>
                                  </td>
                            )
                        }           
                        return (
                        <td 
                            key={`${row.id}-${column.key}`}
                            className="border border-gray-300 px-2 py-2 text-xs"
                        >
                            {row[column.key] as React.ReactNode}
                        </td>
                        );
                    })}
                    </tr>
                ))}
                </tbody>
            </table>
            <div>
                {isForeign && (
                    <ForeignModal setIsForeign={setIsForeign} foreignData={foreignData} answer={answer}/>
                )}
                {isModal && (
                    <ModalModal setIsModal={setIsModal} modalUrl={modalUrl} modalFile={modalFile} />
                )}  
                {isAudio && (
                    <ListenVoice setIsAudio={setIsAudio} voiceUrl={voiceUrl} answer={answer} />
                )}                       
            </div>
            </div>
        </div>
    )
}