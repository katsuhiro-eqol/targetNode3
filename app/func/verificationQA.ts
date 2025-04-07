import { db } from "@/firebase"
import { getDocs, collection } from "firebase/firestore"
import {registerVoice} from "./updateWav"
import createEmbedding from "./createEmbedding"
import createForeign from "./createForeign"
import { QaData } from "@/types"


export default async function validateCreatedQA(organization:string, event:string, voice:string, embeddingModel:string, languages:string[]){
    const eventId = organization + "" + event
    const qa = await loadQA(eventId)
    const errVoice = qa.filter((item) => !item.voiceUrl)
    try {
        if (Array.isArray(errVoice)){
            for (const err of errVoice){
                await registerVoice(organization, event, err.answer, err.read, voice, err.id)
            }
        }
        const errEmbedding = qa.filter((item) => !item.embedding)
        if (Array.isArray(errEmbedding)){
            for (const err of errEmbedding){
                await createEmbedding(err.question, embeddingModel)
            }
        }
        if (languages.length === 1){
            return "Q&Aデータの登録が完了しました"
        }else{
            const errForeign = qa.filter((item) => item.foreign.length !== languages.length-1)
            if (Array.isArray(errForeign)){
                for (const err of errForeign){
                    await createForeign(err.answer, languages)
                }
            }
        }
        return "Q&Aデータの登録が完了しました"
    } catch (error){
        console.log(error)
        return "Q&Aデータ登録に不備がある可能性があります。イベント情報一覧で内容を確認してください"
    }
}


async function loadQA(eventId:string){
    const querySnapshot = await getDocs(collection(db, "Events", eventId, "QADB"));
    const qa:QaData[] = []
    querySnapshot.forEach((doc) => {
        const data = doc.data()
        const vector = data.vector.substr(0,10) + "..."
        const qadata:QaData = {
            id: doc.id,
            code:data.code,
            question:data.question,
            answer:data.answer,
            modalFile:data.modalFile,
            modalUrl:data.modalUrl,
            voiceId:data.voiceId,
            voiceUrl:data.voiceUrl,
            foreignStr:"",
            foreign:data.foreign,
            vector:vector,
            read:data.read,
            pronunciations:data.pronunciations
        }
        qa.push(qadata)
      })
      qa.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id));
      return qa
}
