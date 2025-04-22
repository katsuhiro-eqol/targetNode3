import { db } from "@/firebase"
import { getDocs, collection, query, where, deleteDoc, writeBatch } from "firebase/firestore"


export default async function DeleteFailedVoice(){
    const q = query(collection(db, "Voice"),where("frame", "<", 11));
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
        console.log('条件に一致するドキュメントはありません')
        return 0
    }
    const batch = writeBatch(db)

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    });
    await batch.commit()
    console.log(`${querySnapshot.size}件のドキュメントを削除しました`)
    return querySnapshot.size
}