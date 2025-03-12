import { NextRequest, NextResponse } from 'next/server';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/firebase'; // あなたのFirebase設定ファイルからインポート

// 許可するファイルタイプ
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png'
];

// 最大ファイルサイズ (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // マルチパートフォームデータを処理
    const formData = await request.formData();
    const files = formData.getAll('files');
    const jsonString = formData.get('json') as string;
    const jsonData = JSON.parse(jsonString);
    console.log("user: ", jsonData.user)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    console.log(files)
    const uploadResults = [];
    const errors = [];

    // 各ファイルを処理
    for (const file of files) {
      if (!(file instanceof File)) {
        errors.push({ name: 'Unknown', error: 'ファイルオブジェクトではありません' });
        continue;
      }

      // ファイルタイプのバリデーション
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push({ name: file.name, error: '許可されていないファイル形式です' });
        continue;
      }

      // ファイルサイズのバリデーション
      if (file.size > MAX_FILE_SIZE) {
        errors.push({ name: file.name, error: 'ファイルサイズが大きすぎます' });
        continue;
      }

      try {
        // Firebase Storageにアップロード
        //const uniqueFileName = generateUniqueFileName(file.name);
        const filePath = jsonData.user + "/"  + file.name
        const fileRef = ref(storage, `images/${filePath}`);
        
        // バッファを取得
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        // Storageにアップロード
        const snapshot = await uploadBytes(fileRef, buffer, {
          contentType: file.type,
          customMetadata: {
            originalName: file.name,
            uploadDate: new Date().toISOString()
          }
        });
        
        // ダウンロードURLを取得
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        uploadResults.push({
          name: file.name,
          type: file.type,
          size: file.size,
          path: snapshot.ref.fullPath,
          url: downloadURL
        });

      } catch (error) {
        console.error(`アップロードエラー (${file.name}):`, error);
        errors.push({ name: file.name, error: 'アップロード中にエラーが発生しました' });
      }
    }
    // 結果を返す
    return NextResponse.json({
      success: true,
      uploads: uploadResults,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('アップロード処理エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
