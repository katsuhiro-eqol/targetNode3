'use client';
import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { toPng, toJpeg } from 'html-to-image';
import {Sidebar} from "../../components/sideBar"
import {menuItems} from "../../components/menuData"

export default function DownloadableQRCode(){
  const qrCodeRef = useRef(null);
  const url:string = "https://example.com"
  const size:number = 256
  
  // PNG形式でダウンロード
  const downloadQRAsPNG = () => {
    if (qrCodeRef.current) {
      toPng(qrCodeRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'qrcode.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('QRコードの変換に失敗しました:', err);
        });
    }
  };
  
  // JPG形式でダウンロード
  const downloadQRAsJPG = () => {
    if (qrCodeRef.current) {
      toJpeg(qrCodeRef.current, { quality: 0.95 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'qrcode.jpg';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('QRコードの変換に失敗しました:', err);
        });
    }
  };
  
  return (
    <div className="flex">
    <div>
        <Sidebar menuItems={menuItems} />
    </div>
    <div className="ml-64 p-8 w-full">
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
    <div className="font-bold text-xl">QRコード生成</div>
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={qrCodeRef} 
        className="p-4 bg-white"
        style={{ display: 'inline-block' }}
      >
        <QRCode 
          value={url} 
          size={size}
          level="H"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={downloadQRAsPNG}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          PNG形式でダウンロード
        </button>
        <button
          onClick={downloadQRAsJPG}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          JPG形式でダウンロード
        </button>
      </div>
    </div>
    </div>
    </div>
    </div>
  );
};