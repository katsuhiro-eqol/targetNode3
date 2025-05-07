"use client"
import React from "react";
import { useState, useEffect } from "react";
import { db } from "@/firebase"
import { doc, getDoc, setDoc, getDocs, collection, writeBatch, updateDoc, arrayUnion, query, where } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL, getBlob } from "firebase/storage";


export default function CopyEvent(){
    const [events, setEvents] = useState<string[]>([]) //firestoreから読み込む
    const [eventList, setEventList] = useState<string[]>([""])
    const [event, setEvent] = useState<string>("")
    const [organization, setOrganization] = useState<string>("")
    const [newEvent, setNewEvent] = useState<string>("")
    const [status, setStatus] = useState<string>("")

    const loadEvents = async (org:string) => {
        try {
            const docRef = doc(db, "Users", org)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                setEvents(data.events)
                const array1 = [""]
                const array2 = array1.concat(data.events)
                setEventList(array2)
                if (!data.events){
                    alert("イベントが登録されていません")
                }
            } else {
                alert("ログインから始めてください")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const cancelButton = () => {
        setEvent("")
        setNewEvent("")
    }

    const copyEvent = async() => {
        if (event !== "" && newEvent !== ""){
            setStatus("イベントの複製を開始しました")
            const sourceId = `${organization}_${event}`
            const destId = `${organization}_${newEvent}`
            console.log(destId)
            try {
                await copyMainDocument(sourceId, destId)
                await copySubdocuments(sourceId, destId)
                const usersRef = collection(db, "Users")
                await updateDoc(doc(usersRef, organization), {events: arrayUnion(newEvent)})
                const destUrl = await copyStorageFiles(event, newEvent)
                if (destUrl !== "error"){
                    updateDownloadUrl(destUrl,destId)
                }
                setStatus("イベントの複製が完了しました")
            } catch (error) {
                setStatus("イベントの複製に失敗しました")
            }
        } else {
            setStatus("複製元and/or複製先のイベントが指定されていません")
        }
    }

    const copyMainDocument = async (sourceId:string,destId:string) => {

        const sourceDoc = await getDoc(doc(db, "Events",sourceId))
        if (!sourceDoc.exists()) {
            throw new Error("元のドキュメントが存在しません");
        }
        await setDoc(doc(db,"Events",destId), sourceDoc.data())        
    }

    const copySubdocuments = async (sourceId:string, destId:string) => {
        const subcollectionRef = collection(db, "Events", sourceId, "QADB");
        const querySnapshot = await getDocs(subcollectionRef);
 
        let batch = writeBatch(db);
        let operationCount = 0
        const MAX_BATCH_SIZE = 500
        
        for (const docSnapshot of querySnapshot.docs) {
          const sourceData = docSnapshot.data();
          const sourceDocId = docSnapshot.id;
          const destDocRef = doc(db, "Events", destId, "QADB", sourceDocId);
          
          batch.set(destDocRef, sourceData);
          operationCount++;

          if (operationCount >= MAX_BATCH_SIZE) {
            await batch.commit();
            batch = writeBatch(db);
            operationCount = 0;
          }
        }
        if (operationCount > 0) {
          await batch.commit();
        }
    }

    const copyStorageFiles = async(event:string, newEvent:string) => {
        try {
            const sourcePath = `modal/${organization}/${event}/`
            const destPath = `modal/${organization}/${newEvent}/`
            //modal_file一覧をQADBから取得（Storageからは一覧取得できない）
            const querySnapshot = await getDocs(collection(db, "Events", `${organization}_${event}`, "QADB"));
            const modal_files:string[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.modalFile !== ""){
                    modal_files.push(data.modalFile)
                }
            })
            const modalSet = new Set(modal_files)
            const destUrl = []
            for (const file of modalSet) {
                const sourceFullPath = `${sourcePath}${file}`;
                const destFullPath = `${destPath}${file}`;
                const storage = getStorage()
                
                const sourceFileRef = ref(storage, sourceFullPath);
                const destFileRef = ref(storage, destFullPath);
                const fileBlob = await getBlob(sourceFileRef);
                await uploadBytes(destFileRef, fileBlob);
                const newUrl = await getDownloadURL(destFileRef)
                const data = {
                    modalFile: file,
                    url: newUrl
                }
                destUrl.push(data)
            }
            return destUrl
        } catch (error) {
          console.error(`Storageファイルのコピーに失敗:`, error);
          return "error"
        }
    }

    const updateDownloadUrl = async (destUrl:{modalFile:string, url:string}[], destId:string) => {
        for (const item of destUrl){
            const qaRef = collection(db, "Events", destId, "QADB")
            const q = query(qaRef, where("modalFile", "==", item.modalFile))
            const querySnapshot = await getDocs(q)
            for (const document of querySnapshot.docs) {
                const docRef = doc(db, "Events",destId,"QADB", document.id);
                await setDoc(docRef, {modalUrl:item.url,modalPath:`modal/${organization}/${newEvent}/${item.modalFile}`}, {merge:true});
              }
        }

    }

    const selectEvent = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEvent(e.target.value)
        setStatus("")
    }

    useEffect(() => {
        const org = sessionStorage.getItem("user")
        if (org){
            setOrganization(org)
            loadEvents(org)
        }
    },[])

    return (
        <div>
        <div className="font-bold text-xl mt-3">イベント複製</div>
        <div className="text-sm mb-7">登録済みのQ&Aデータを含めてイベントを複製します</div>
        <div className="text-base font-bold">複製元のイベントを選択 </div>
        
        {events && (
        <select className="mt-3 ml-3 w-48 h-8 text-center border-2 border-lime-600" value={event} onChange={selectEvent}>
        {eventList.map((name) => {
        return <option key={name} value={name}>{name}</option>;
        })}
        </select>
        )}

        <div className="mt-5 text-base font-semibold text-gray-700">複製先のイベント名</div>
        <input className="w-1/2 ml-3 rounded-md px-4 py-1 bg-inherit border mt-2 border-lime-600"
            name="event"
            placeholder="複製先イベント名"
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
        /> 
        <div className="flex flex-row gap-x-4 mt-10">
        <button className="h-10 my-5 px-2 border-2 rounded" onClick={cancelButton}>キャンセル</button>
        <button className="h-10 my-5 ml-3 px-2 border-2 bg-amber-200 rounded hover:bg-amber-300" onClick={() => copyEvent()}>イベントを複製</button>
        </div>               

        <div className="text-green-500 font-semibold mt-20">{status}</div>
        </div>
    )
}