import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface CsvData {
  [key: string]: string;
}

export default function RegisterCSV() {
  const [jsonData, setJsonData] = useState<CsvData[]>([]);
  const [error, setError] = useState<string>('');

  const parseCsv = (csvText: string): CsvData[] => {
    try {
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      const result: CsvData[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(value => value.trim());
        const entry: CsvData = {};
        
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        
        result.push(entry);
      }

      return result;
    } catch (error) {
      throw new Error('CSVの解析に失敗しました');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setError('');
      const file = acceptedFiles[0];
      
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        throw new Error('CSVファイルのみ対応しています');
      }

      const text = await file.text();
      const data = parseCsv(text);
      console.log(data)
      setJsonData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      setJsonData([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div 
        {...getRootProps()} 
        className={`
          p-8 
          text-center 
          border-2 
          border-dashed 
          rounded-lg
          cursor-pointer 
          transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive 
            ? 'ファイルをドロップしてください' 
            : 'ここにCSVファイルをドラッグ&ドロップしてください'
          }
        </p>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

        {jsonData.length > 0 && (
            <div>
            <div>データ数：{jsonData.length}</div>
            <button>データベースに登録</button>
            </div>
      )}
    </div>
  );
}

/*
      {jsonData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">変換結果:</h3>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}

              <div className="mt-4">
          {jsonData.map((item, index) => {
            return (<div key={index}>{item.question}</div>)
          })}
        </div>
*/