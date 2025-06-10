/*

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSupportMemoReturn {
  supportCount: number;
  openMemo: () => void;
  closeMemo: () => void;
  isMemoOpen: boolean;
  updateMemoCount: number;
  isClient: boolean; // クライアントサイドかどうかを判定
}

export const useSupportMemo = (): UseSupportMemoReturn => {
  const [supportCount, setSupportCount] = useState<number>(0);
  const [isMemoOpen, setIsMemoOpen] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const memoWindowRef = useRef<Window | null>(null);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  const openMemo = useCallback(() => {
    // クライアントサイドでない場合は何もしない
    if (!isClient || typeof window === 'undefined') return;

    if (memoWindowRef.current && !memoWindowRef.current.closed) {
      memoWindowRef.current.focus();
      return;
    }

    try {
      const memoWindow = window.open(
        '/support-memo',
        'supportMemo',
        'width=320,height=180,resizable=yes,scrollbars=no,status=no,menubar=no,toolbar=no,location=no'
      );

      if (memoWindow) {
        memoWindowRef.current = memoWindow;
        setIsMemoOpen(true);

        const checkClosed = setInterval(() => {
          if (memoWindow.closed) {
            clearInterval(checkClosed);
            setIsMemoOpen(false);
            memoWindowRef.current = null;
          }
        }, 1000);

        // ウィンドウの読み込み完了を待つ
        const sendInitialData = () => {
          if (!memoWindow.closed) {
            memoWindow.postMessage({
              type: 'SUPPORT_COUNT_UPDATE',
              count: supportCount,
              timestamp: new Date().toISOString()
            }, window.location.origin);
          }
        };

        // 複数の方法で初期データ送信を試行
        setTimeout(sendInitialData, 500);
        setTimeout(sendInitialData, 1000);
        setTimeout(sendInitialData, 2000);
      }
    } catch (error) {
      console.error('Failed to open memo window:', error);
    }
  }, [isClient, supportCount]);

  const closeMemo = useCallback(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    if (memoWindowRef.current && !memoWindowRef.current.closed) {
      memoWindowRef.current.close();
      setIsMemoOpen(false);
      memoWindowRef.current = null;
    }
  }, [isClient]);

  const updateMemoCount = useCallback((count: number) => {
    setSupportCount(count);
    
    if (!isClient || typeof window === 'undefined') return;
    
    if (memoWindowRef.current && !memoWindowRef.current.closed) {
      memoWindowRef.current.postMessage({
        type: 'SUPPORT_COUNT_UPDATE',
        count: count,
        timestamp: new Date().toISOString()
      }, window.location.origin);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const handleBeforeUnload = () => {
      closeMemo();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      closeMemo();
    };
  }, [isClient, closeMemo]);

  return {
    supportCount,
    openMemo,
    closeMemo,
    isMemoOpen,
    isClient,
    updateMemoCount
  } as UseSupportMemoReturn & { updateMemoCount: (count: number) => void };
};
*/

/*
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSupportMemoReturn {
  supportCount: number;
  openMemo: () => void;
  closeMemo: () => void;
  isMemoOpen: boolean;
}

export const useSupportMemo = (): UseSupportMemoReturn => {
  const [supportCount, setSupportCount] = useState<number>(0);
  const [isMemoOpen, setIsMemoOpen] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false)
  const memoWindowRef = useRef<Window | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
        setIsClient(true);
        isInitialized.current = true;
      }
  }, []);

  const openMemo = useCallback(() => {
    if (!isClient) return;

    if (memoWindowRef.current && !memoWindowRef.current.closed) {
      // 既に開いている場合はフォーカスする
      memoWindowRef.current.focus();
      return;
    }

    // 子ウィンドウを開く
    try {
    const memoWindow = window.open(
      '/support-memo',
      'supportMemo',
      'width=320,height=180,resizable=yes,scrollbars=no,status=no,menubar=no,toolbar=no,location=no'
    );

    if (memoWindow) {
      memoWindowRef.current = memoWindow;
      setIsMemoOpen(true);

      // 子ウィンドウが閉じられたかを監視
      const checkClosed = setInterval(() => {
        if (memoWindow.closed) {
          clearInterval(checkClosed);
          setIsMemoOpen(false);
          memoWindowRef.current = null;
        }
      }, 1000);

      // 初期データを送信（ウィンドウが完全に読み込まれるまで少し待つ）
      setTimeout(() => {
        if (!memoWindow.closed) {
          memoWindow.postMessage({
            type: 'SUPPORT_COUNT_UPDATE',
            count: supportCount,
            timestamp: new Date().toISOString()
          }, window.location.origin);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Failed to open window:', error);
  }
}, [isClient, supportCount])

  const closeMemo = useCallback(() => {
    if (memoWindowRef.current && !memoWindowRef.current.closed) {
      memoWindowRef.current.close();
      setIsMemoOpen(false);
      memoWindowRef.current = null;
    }
  },[]);

  const updateMemoCount = useCallback((count: number) => {
    setSupportCount(count);
    
    // 子ウィンドウが開いている場合、データを送信
    if (memoWindowRef.current && !memoWindowRef.current.closed) {
      memoWindowRef.current.postMessage({
        type: 'SUPPORT_COUNT_UPDATE',
        count: count,
        timestamp: new Date().toISOString()
      }, window.location.origin);
    }
  }, []);

  // ページがアンロードされる時に子ウィンドウを閉じる
  useEffect(() => {
    if (!isClient) return
    const handleBeforeUnload = () => {
      closeMemo();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      closeMemo();
    };
  }, [isClient, closeMemo]);

    // サーバーサイドレンダリング時の初期状態
    if (!isClient) {
        return {
          supportCount: 0,
          openMemo: () => {},
          closeMemo: () => {},
          isMemoOpen: false,
        };
      }

  return {
    supportCount,
    openMemo,
    closeMemo,
    isMemoOpen,
    updateMemoCount
  } as UseSupportMemoReturn & { updateMemoCount: (count: number) => void };
};
*/