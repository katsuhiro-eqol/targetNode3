/*
import { db } from "@/firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"

export default async function CreateWav(voiceId:string){
    const loadVoiceData = async (voiceId:string) => {
        try {
            const docRef = doc(db, "Voice", voiceId)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                return data.audio
            }
        } catch (error) {
            return "error"
        }
    }

    const base64toBlob = (base64Data) => {
        if (base64Data){
        const sliceSize = 1024
        const cleanedBase64 = base64Data.trim().replace(/\s/g, '')//追加
        const byteCharacters = atob(cleanedBase64)
        const bytesLength = byteCharacters.length
    
        const slicesCount = Math.ceil(bytesLength/sliceSize)
        const byteArrays = new Array(slicesCount)
        console.log("bytesLength", bytesLength)
        for (let sliceIndex=0; sliceIndex<slicesCount; ++sliceIndex){
            const begin = sliceIndex * sliceSize
            const end = Math.min(begin + sliceSize, bytesLength)
            const bytes = new Array(end - begin)
            for (let offset = begin, i=0; offset<end; ++i, ++offset){
                bytes[i] = byteCharacters[offset].charCodeAt(0)
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes)
        }
        return new Blob(byteArrays, {type:'audio/wav'})
        } else {
            console.log("base64エラー")
            return null
        }
    }

    const audioData = await loadVoiceData(voiceId)
    const blob = base64toBlob(audioData)
    const audioUrl = URL.createObjectURL(blob)
    return audioUrl
}
    */