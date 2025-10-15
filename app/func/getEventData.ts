import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { EventData } from "@/types"

export default async function getEventData(eventId:string):Promise<EventData|null>{
    try {
        const docRef = doc(db, "Events", eventId)
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data()
            const eventData:EventData = {
                image:data.image,
                languages:data.languages,
                voice: data.voice,
                embedding:data.embedding,
                qaData:data.qaData,
                code: data.code,
                pronunciations:data.pronunciation,
                isSuspended:data.isSuspended
            }
            return eventData
            
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}
