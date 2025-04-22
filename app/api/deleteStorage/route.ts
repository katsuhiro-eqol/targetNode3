import { NextRequest, NextResponse } from 'next/server';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase';

export async function POST(request: NextRequest) {
    const params = await request.json()
    const path = params.folderPath
    console.log("post")
    console.log(path)
    if (!path){
        return NextResponse.json({ error: "削除するパスが指定されていません" });
    }
    
    try {
        const listRef = ref(storage, path)
        const { items, prefixes } = await listAll(listRef);
        console.log(items)
        items.map(async (itemRef) => {
            await deleteObject(itemRef);
        });
        return NextResponse.json({ success:true });

    } catch (error) {
        return NextResponse.json({ error: error });
    }
}