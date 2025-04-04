import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"

export default async function getEventList(org:string):Promise<string[]|null>{
    try {
        const docRef = doc(db, "Users", org)
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.events){
                return data.events
            } else {
                return null
            }
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}

