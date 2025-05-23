'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FileText, Image, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { ModalData, FILE } from "@/types"

interface FileUploadProps {
  modal: string[];
  setIsReady:(isReady:boolean) => void;
  setModalData:(modalData:ModalData[]) => void;
  organization:string;
  event:string;
  setErrors:(errors:string) => void;
}


export default function FileUploadPage2({modal, setIsReady, setModalData, organization, event, setErrors}:FileUploadProps) {
  const [files, setFiles] = useState<FILE[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); 

  // ファイルタイプに応じたアイコンを返す関数
  const getFileIcon = (fileType:string) => {
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes('text')) return <FileText className="h-8 w-8 text-blue-500" />;
    if (fileType.includes('image')) return <Image className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  // ファイルサイズをフォーマットする関数
  const formatFileSize = (size: number) => {
    if (size < 1024) return size + ' B';
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    else return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ドロップゾーンの設定
  const onDrop = useCallback((acceptedFiles:File[]) => {
    // 既存のファイルと新しいファイルを結合
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: file.type.startsWith('image/') 
          ? URL.createObjectURL(file) 
          : ""
      })
    );
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  // ファイルタイプの制限
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      //'application/pdf': ['.pdf'],
      //'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  // ファイルリストから特定のファイルを削除
  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      // プレビューURLがある場合はメモリリークを防ぐためにリボークする
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // ファイルをアップロードする処理
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadStatus(null);
    const err = []
    const modal = []
    try {
        for (const file of files){
                const storage = getStorage()
                const path = `modal/${organization}/${event}/${file.name}`
                const storageRef = ref(storage, path)
                const snapshot = await uploadBytes(storageRef, file)
                const downloadURL = await getDownloadURL(snapshot.ref)
                const data:ModalData = {
                    name:file.name,
                    path:path,
                    url:downloadURL
                }
                if (data){
                    modal.push(data)
                }
        }
        setModalData(modal)
        setUploading(false);
        setFiles([]);
        setIsReady(true)
    } catch {

    }
    
  };

  const uploadfiles = () => {
    if (files.length > modal.length){
        alert("アップロードが不要なファイルが含まれています")
    } else if (files.length < modal.length) {
        alert("必要なファイルを全て読み込んでください")
    } else {
        const filenames = files.map((item => item.name))
        const array = modal.filter((item => filenames.indexOf(item) == -1))
        if (array.length > 0){
            const missingFiles = array.toString()
            alert(missingFiles+"が読み込まれていません")
        } else {
            handleUpload()
        }
    }
  }

  return (
    <div>
      <div className="text-sm text-red-600">アップロードが必要なファイル（計{modal.length}ファイル）</div>
      <div className="text-sm">{modal.join("　　 ")}</div>
      {/* ドロップゾーン */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-3 mb-3 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-1">
          {isDragActive ? (
            <p className="text-blue-500 text-sm">ファイルをドロップしてください</p>
          ) : (
            <>
              <p className="text-gray-600 text-sm">ファイルをドラッグ＆ドロップしてください</p>
              <p className="text-xs text-gray-500">対応ファイル: JPG, PNG (最大 5MB)</p>
            </>
          )}
        </div>
      </div>
      
      {fileRejections.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-red-600 font-medium mb-2 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            アップロードできないファイル
          </h3>
          <ul className="text-sm text-red-500 list-disc pl-5">
            {fileRejections.map(({ file, errors }, index) => (
              <li key={index}>
                {file.name} ({formatFileSize(file.size)}): 
                {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {files.map((file, index) => {
            return (
            <div className="bg-green-100 p-1 rounded-lg text-center text-xs" key={index}>
              {file.name}
            </div>)
          })
        }
        </div>
      )}
      
      {files.length > 0 && (
        <div className="flex items-center mt-5">
          <button
            onClick={uploadfiles}
            disabled={uploading}
            className={`text-sm px-3 py-1 rounded-lg flex items-center space-x-2
              ${uploading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-400 hover:bg-blue-500 text-white'}`}
          >
            
            <span>{uploading ? '登録中...' : '登録'}</span>
          </button>
          <button className="ml-5 border-2 px-1 rounded-lg" onClick={()=>setFiles([])}>アップロードやり直し</button>
          
          {uploadStatus && (
            <div className={`ml-4 flex items-center
              ${uploadStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {uploadStatus === 'success' ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>アップロード完了</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>アップロード失敗。再試行してください。</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}