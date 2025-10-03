import { NextResponse } from 'next/server';
import { createClient } from "@vercel/kv"
import type { NextRequest } from 'next/server';

// 環境変数が設定されている場合のみKVクライアントを作成
const kv = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN 
  ? createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

const COOKIE = "session_id";

// ミドルウェア関数
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const sid = request.cookies.get(COOKIE)?.value;
  if (kv === null || kv === undefined){
    console.log("kv:false")
  } else {
    console.log("kv:OK")
  }
  if (sid === null || sid === undefined){
    console.log("sid:false")
  } else {
    console.log("sid:OK")
  }

  // 基本的なパスチェック
  if (path.startsWith("/_next") || path.startsWith("/favicon.ico") || path.startsWith("/inboundSite")) {
    return NextResponse.next();
  }

  // ログインが必要なページのトークンの取得
  const token = request.cookies.get('authToken')?.value
  const staffToken = request.cookies.get('authStaffToken')?.value

  if (path.startsWith("/user")){
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  } else if (path.startsWith("/staff")){
    if (!staffToken) {
      return NextResponse.redirect(new URL('/staffAuth', request.url));
    } 
  } else if (path.startsWith("/aicon")){
    // KVセッション管理を追加

    if (!kv) {
      return NextResponse.next();
    }
    
    const sid = request.cookies.get(COOKIE)?.value;
    if (!sid) {
      return redirectExpired(request);
    }
    
    try {
      const data = await kv.get<{ expiresAt: number }>(`session:${sid}`);
      if (!data || Date.now() > Number(data.expiresAt)) {
        return redirectExpired(request);
      }
    } catch (error) {
      console.error('KV error:', error);
      return redirectExpired(request);
    }
  }
  
  return NextResponse.next();
}


const redirectExpired = (request: NextRequest) => {
  return NextResponse.redirect(new URL("/expired", request.url));
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/user/:path*', '/staff/:path*', '/aicon/:path*'
  ]
};


/*
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


  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/user/:path*', '/staff/:path*'
  ]
};
*/