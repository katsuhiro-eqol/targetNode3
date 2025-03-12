import { NextRequest, NextResponse } from 'next/server';
import {db} from "@/firebase"
import { doc, getDoc} from "firebase/firestore"
import { sign } from 'jsonwebtoken'

export async function POST(req: NextRequest): Promise<NextResponse>  {
    const params = await req.json()
    const organization = params.organization
    const password = params.password
    console.log(organization, password)

    try {
        const docRef = doc(db, "Users", organization);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data()
            if (password == data.password){
                const token = sign(
                    { user: organization },
                    process.env.JWT_SECRET!,
                    { expiresIn: '24h', algorithm: 'HS256' }
                );
    
                const response = NextResponse.json({ success: true, user: organization },{ status: 200 })
                response.cookies.set('authToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24, // 24時間
                    path: '/'
                });
    
                return response
            } else {
                return NextResponse.json({ error: '認証失敗' }, { status: 401 });
            }
        } else {
            return NextResponse.json({ error: 'ユーザー登録されていません' }, { status: 401 });
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
    }
}

/*
        const q = query(collection(db,"Users"), where("organization", "==", organization), where("password", "==", password))
        const querySnapshot = await getDocs(q)
        if (querySnapshot.docs.length != 0){
            const data = querySnapshot.docs[0].data()
            const token = sign(
                { user: organization },
                process.env.JWT_SECRET!,
                { expiresIn: '24h', algorithm: 'HS256' }
            );

            const response = NextResponse.json({ success: true, user: organization },{ status: 200 })
            response.cookies.set('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24時間
                path: '/'
            });

            return response
        } else {
            return NextResponse.json({ error: '認証失敗' }, { status: 401 });
        }
        */