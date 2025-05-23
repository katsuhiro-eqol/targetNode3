import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/firebase"
import { doc, getDocs, collection, setDoc, query, where } from "firebase/firestore"

export const registerVoice = async (organization:string, event:string, answer:string, read:string, voice:string, voiceId:string, qaId:string) => {
    const maxRetries = 5
    let retries = 0
    try {
        const response = await fetch("/api/createAudioData", {
            method: "POST",
            timeout: 60000,
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ answer: read, voice: voice, voiceId: voiceId}),
        });
        const audio = await response.json();
        
        if (audio.status == "0"){
            await updateVoiceDataToQADB(audio.voiceId, audio.frame, audio.url, read, organization, event, qaId)
        } else {
            const frame = frameCount(audio.audioContent)
            if (frame < 11){
                throw new Error('no good audioContent');
            } else {
                await saveVoiceData(audio.voiceId, answer, read, audio.audioContent, organization, event, qaId)
            }
        }
    } catch (error) {
        retries++
        console.log(`${voiceId}のエラーは${retries}回目`)
        if (retries > maxRetries) {
            console.log(`${voiceId}のエラーはmaxRetry${maxRetries}を超えました`)
            throw error;
        }
        await registerVoice(organization, event, answer, read, voice, voiceId, qaId)
        /*
        const delay = 1000 * Math.pow(2, retries - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        */
    }
}

//音声合成し、Voiceに登録


const saveVoiceData = async(voiceId:string, text:string, read:string, audioContent:string, organization:string, event:string, qaId:string) => {
    const blob = base64toBlob(audioContent)
    const frame = frameCount(audioContent)
    if (!blob) {
        return
    }

    const fileName = voiceId + ".wav"
    const storage = getStorage()
    const path = "aicon_audio/" + fileName
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, blob)
    await getDownloadURL(ref(storage, path))
    .then((url) => {
        registrationVoiceData(voiceId, frame, url, text, read, organization, event, qaId)
    })
    .catch((error) => {
      console.log(error)
    });
}

const registrationVoiceData = async(voiceId:string, frame:number, url:string, text:string, read:string, organization:string, event:string, qaId:string) => {
    const fileName = voiceId + ".wav"
    const data = {
        answer: text,
        read: read,
        filename: fileName,
        url: url,
        frame:frame
    }
    const voiceRef = doc(db, "Voice", voiceId);
    await setDoc(voiceRef, data, {merge:true}) 

    await updateVoiceDataToQADB(voiceId, frame, url, read, organization, event, qaId)
}

const updateVoiceDataToQADB = async (voiceId:string, frame:number, url:string, read:string, organization:string, event:string, qaId:string) => {
    const eventId = organization + "_" + event
    const data2 = {
        voiceId:voiceId,
        voiceUrl: url,
        frame: frame,
        read: read
    }
    if (qaId !==""){
        console.log("update Voice")
        const docRef = doc(db,"Events",eventId, "QADB",qaId)
        await setDoc(docRef, data2, {merge:true})
    } else {
        //createQAでは音声合成の前にqaDataが生成されていてvoiceIdも設定していることが前提
        const qaRef = collection(db, "Events", eventId, "QADB")
        const q = query(qaRef, where("read", "==", read))
        const querySnapshot = await getDocs(q)
        for (const document of querySnapshot.docs) {
            const docRef = doc(db, "Events",eventId,"QADB", document.id);
            await setDoc(docRef, data2, {merge:true});
          }
    }

}

const base64toBlob = (base64Data: string) => {
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

const frameCount = (base64Data:string) => {
    const audioString = base64Data.replace(/-/g, '+').replace(/_/g, '/')
    const byteCharacters = atob(audioString)
    const bytesLength = byteCharacters.length
    const frameCount = bytesLength/2
    return frameCount
}