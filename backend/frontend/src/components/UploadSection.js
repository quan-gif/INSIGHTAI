import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadSection = ({ onFileAccepted, isAnalyzing }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxFiles: 1,
    disabled: isAnalyzing,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? 'border-primary bg-blue-50'
          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
      } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-3">
        <div className="text-5xl">📤</div>
        <p className="text-lg font-medium text-gray-700">
          {isDragActive
            ? 'Thả file vào đây...'
            : 'Kéo thả file CSV hoặc Excel vào đây'}
        </p>
        <p className="text-sm text-gray-500">
          hoặc bấm để chọn file từ máy tính
        </p>
        <p className="text-xs text-gray-400">
          Hỗ trợ: .csv, .xlsx (có cột "review")
        </p>
      </div>
    </div>
  );
};

export default UploadSection;