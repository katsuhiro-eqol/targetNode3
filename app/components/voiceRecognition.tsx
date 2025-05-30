'use client';

import { useState, useRef } from 'react';

export default function VoiceRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        await sendAudioToAPI(audioBlob);
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('録音開始エラー:', error);
      alert('マイクへのアクセスが拒否されました');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const sendAudioToAPI = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('音声認識APIエラー');
      }

      const data = await response.json();
      setTranscript(data.transcript || '音声を認識できませんでした');
    } catch (error) {
      console.error('音声認識エラー:', error);
      setTranscript('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>音声認識テスト</h1>
      
      <div style={{ marginBottom: '20px' }}>
        {!isRecording ? (
          <button 
            onClick={startRecording}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🎤 録音開始
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ⏹️ 録音停止
          </button>
        )}
      </div>

      {isLoading && (
        <div style={{ marginBottom: '20px', color: '#666' }}>
          音声を処理中...
        </div>
      )}

      {transcript && (
        <div 
          style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            minHeight: '100px'
          }}
        >
          <h3>認識結果:</h3>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}