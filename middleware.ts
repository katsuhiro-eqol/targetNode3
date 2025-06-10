import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'
import { verify } from 'jsonwebtoken';

// ミドルウェア関数
export async function middleware(request: NextRequest) {
  // トークンの取得
  const token = request.cookies.get('authToken')?.value
  const staffToken = request.cookies.get('authStaffToken')?.value

  const path = request.nextUrl.pathname

  if (path.startsWith("/user")){
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  } else if (path.startsWith("/staff")){
    if (!staffToken) {
      return NextResponse.redirect(new URL('/staffAuth', request.url));
    }
  }

  /*
  const isProtectedPath = request.nextUrl.pathname.startsWith('/user');

  if (isProtectedPath) {
    // トークンが存在しない場合
    if (!token) {
        console.log("no token")
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    // トークンの検証
    const { payload } = await jwtVerify(token, secret);
    
    return NextResponse.next();
  }
*/
  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/user/:path*', '/staff/:path*'
  ]
};