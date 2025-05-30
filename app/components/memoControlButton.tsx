'use client';

import { useEffect, useState } from 'react';

interface MemoControlButtonProps {
  isMemoOpen: boolean;
  openMemo: () => void;
  closeMemo: () => void;
  isClient: boolean;
}

export default function MemoControlButton({ 
  isMemoOpen, 
  openMemo, 
  closeMemo, 
  isClient 
}: MemoControlButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // マウントされていない、またはクライアントサイドでない場合
  if (!mounted || !isClient) {
    return <div className="w-24 h-8 bg-gray-300 animate-pulse rounded"></div>;
  }

  return (
    <button
      onClick={isMemoOpen ? closeMemo : openMemo}
      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
        isMemoOpen 
          ? 'bg-orange-500 hover:bg-orange-600' 
          : 'bg-green-500 hover:bg-green-600'
      }`}
      suppressHydrationWarning
    >
      {isMemoOpen ? 'メモを閉じる' : 'メモを開く'}
    </button>
  );
}