
import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';

// Google Cloud Speech clientの初期化
const speechClient = new SpeechClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: '音声ファイルが見つかりません' },
        { status: 400 }
      );
    }

    //音声ファイルをバッファに変換
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer);

    // Google Speech-to-Text APIの設定
    const request = {
      audio: {
        content: audioBytes.toString('base64'),
      },
      config: {
        encoding: 'WEBM_OPUS' as const,
        sampleRateHertz: 48000,
        languageCode: 'ja-JP', // 日本語設定
        enableAutomaticPunctuation: true, // 句読点の自動挿入
        model: 'latest_long', // 長時間音声用モデル
      },
    };

    // 音声認識の実行
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(' ');

    return NextResponse.json({
      transcript: transcription || '',
      confidence: response.results?.[0]?.alternatives?.[0]?.confidence || 0
    });

  } catch (error) {
    console.error('Speech-to-Text API エラー:', error);
    return NextResponse.json(
      { 
        error: '音声認識処理でエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}