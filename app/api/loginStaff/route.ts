import { NextRequest, NextResponse } from 'next/server';
import {db} from "@/firebase"
import { doc, getDoc} from "firebase/firestore"
import { sign } from 'jsonwebtoken'

export async function POST(req: NextRequest): Promise<NextResponse>  {
    const params = await req.json()
    const organization = params.organization
    const event = params.event
    const staff = params.staff
    const password = params.password
    const eventId = `${organization}_${event}`
    console.log(eventId, password)

    try {
        const docRef = doc(db, "Events", eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data()
            const eventInfo = `${data.code}-${data.voice}`
            console.log(eventInfo)
            if (password == eventInfo){
                const token = sign(
                    { staff: staff, event: event, organization: organization },
                    process.env.JWT_SECRET!,
                    { expiresIn: '24h', algorithm: 'HS256' }
                );
    
                const response = NextResponse.json({ success: true, staff: staff, event:event, organization: organization },{ status: 200 })
                response.cookies.set('authStaffToken', token, {
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
            return NextResponse.json({ error: 'イベント登録されていません' }, { status: 401 });
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
    }
}