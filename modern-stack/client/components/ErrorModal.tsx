"use client";

import React from 'react';

interface ErrorModalProps {
  isOpen: boolean;    
  onClose: () => void; 
  title: string;
  message: string;
}

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  title, 
  message 
}: ErrorModalProps) {
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      {/* O card do modal */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold text-red-500 mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        
        {/* Botão de Ação */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose} 
            className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}