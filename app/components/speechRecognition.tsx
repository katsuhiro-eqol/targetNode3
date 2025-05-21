'use client';

import { useState, useEffect, useCallback } from 'react';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

interface SpeechRecognitionProps {
  onTranscriptionChange?: (text: string) => void;
  onFinalTranscription?: (text: string) => void;
}

export default function SpeechRecognition({ 
  onTranscriptionChange, 
  onFinalTranscription 
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [recognizer, setRecognizer] = useState<speechsdk.SpeechRecognizer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Speech Recognizerの初期化
  const initializeRecognizer = useCallback(() => {
    try {
      const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
      const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

      if (!speechKey || !speechRegion) {
        throw new Error('Azure Speech Service credentials are not configured.');
      }

      // SpeechConfigの設定
      const speechConfig = speechsdk.SpeechConfig.fromSubscription(
        speechKey,
        speechRegion
      );
      speechConfig.speechRecognitionLanguage = 'ja-JP';

      // AudioConfigの設定（デフォルトのマイク入力を使用）
      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();

      // Recognizerの作成
      const speechRecognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

      return speechRecognizer;
    } catch (err) {
      setError(`認識エンジンの初期化に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, []);

  // イベントハンドラの設定
  const setupRecognizerCallbacks = useCallback((recognizer: speechsdk.SpeechRecognizer) => {
    if (!recognizer) return;

    // 認識中（中間結果）のイベント
    recognizer.recognizing = (_, event) => {
      const intermediateTranscript = event.result.text;
      setTranscription(intermediateTranscript);
      onTranscriptionChange?.(intermediateTranscript);
    };

    // 認識完了（確定結果）のイベント
    recognizer.recognized = (_, event) => {
      if (event.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
        const finalTranscript = event.result.text;
        setTranscription(finalTranscript);
        onFinalTranscription?.(finalTranscript);
      }
    };

    // キャンセルされた場合のイベント
    recognizer.canceled = (_, event) => {
      if (event.reason === speechsdk.CancellationReason.Error) {
        setError(`エラーが発生しました: ${event.errorDetails}`);
      }
      setIsListening(false);
    };

    // セッションが停止した場合のイベント
    recognizer.sessionStopped = () => {
      setIsListening(false);
    };
  }, [onTranscriptionChange, onFinalTranscription]);

  // 音声認識の開始
  const startListening = useCallback(() => {
    if (!recognizer) {
      const newRecognizer = initializeRecognizer();
      if (newRecognizer) {
        setRecognizer(newRecognizer);
        setupRecognizerCallbacks(newRecognizer);
        newRecognizer.startContinuousRecognitionAsync(
          () => {
            setIsListening(true);
            setError(null);
          },
          (err) => {
            setError(`認識の開始に失敗しました: ${err}`);
            setIsListening(false);
          }
        );
      }
    } else {
      setupRecognizerCallbacks(recognizer);
      recognizer.startContinuousRecognitionAsync(
        () => {
          setIsListening(true);
          setError(null);
        },
        (err) => {
          setError(`認識の開始に失敗しました: ${err}`);
          setIsListening(false);
        }
      );
    }
  }, [recognizer, initializeRecognizer, setupRecognizerCallbacks]);

  // 音声認識の停止
  const stopListening = useCallback(() => {
    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          setIsListening(false);
        },
        (err) => {
          setError(`認識の停止に失敗しました: ${err}`);
        }
      );
    }
  }, [recognizer]);

  // コンポーネントのアンマウント時にリソースを解放
  useEffect(() => {
    return () => {
      if (recognizer) {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            recognizer.close();
          },
          (err) => {
            console.error('Recognizerのクローズに失敗しました:', err);
          }
        );
      }
    };
  }, [recognizer]);

  return (
    <div className="speech-recognition bg-gray-50 rounded-lg p-4 my-5 shadow">
      <div className="controls">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-5 py-2.5 rounded font-medium text-white ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300' 
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
          } focus:outline-none focus:ring-4 transition-colors`}
        >
          {isListening ? '停止' : '音声認識を開始'}
        </button>
      </div>

      <div className="mt-4">
        {isListening && (
          <div className="text-blue-600 font-semibold mb-2 flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            聞いています...
          </div>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">認識結果:</h3>
        <div className="bg-white border border-gray-200 rounded-md p-3 min-h-24">
          {transcription || <span className="text-gray-400">（音声認識を開始してください）</span>}
        </div>
      </div>
    </div>
  );
}