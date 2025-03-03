'use client';
import React from "react";
import {useState, useEffect} from "react"
import ForeignModal from "./foreignModal"
import ModalModal from "./modalModal"

export default function QADataList({qaData}){
    const [isForeign, setIsForeign] = useState<boolean>(false)
    const [foreignData, setForeignData] = useState({})
    const [answer, setAnswer] = useState<string>("")
    const [isModal, setIsModal] = useState<boolean>(false)
    const [modalUrl, setModalUrl] = useState<string>("")
    const [modalFile, setModalFile] = useState<string>("")

    const columns = [
        { key: 'id', label: 'id' },
        { key: 'question', label: '質問' },
        { key: 'answer', label: '回答' },
        { key: 'foreign', label: '外国語回答' },
        { key: 'modalUrl', label: '添付書類' },
        { key: 'voiceId', label: 'AI音声' },
        { key: 'vector', label: 'Embedding' }
    ]

    const showModal = (id) => {
        const selectedData = qaData.filter((item) => item.id == id)
        const url = selectedData[0].modalUrl
        const file = selectedData[0].modalFile
        console.log(url)
        console.log(file)
        setIsModal(true)
        setModalUrl(url)
        setModalFile(file)
    }

    const showForeign = (id) => {
        console.log("foreign", id)
        const selectedData = qaData.filter((item) => item.id == id)
        const foreign = selectedData[0].foreign
        setIsForeign(true)
        setForeignData(foreign)
        setAnswer(selectedData[0].answer)
        console.log(foreign)
    }

    const listenVoice = (id) => {
        const selectedData = qaData.filter((item) => item.id == id)
        const voiceId = selectedData[0].voiceId     
    }

    useEffect(() => {
        console.log(isForeign)
    }, [isForeign])

    useEffect(() => {
        console.log(foreignData)
    }, [foreignData])

    return (
        <div>
            <div className="container mx-auto p-4">
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
                        if (column.key==="foreign"){
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
                            {row[column.key]}
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
            </div>
            </div>
        </div>
    )
}