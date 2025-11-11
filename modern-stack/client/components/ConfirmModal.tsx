"use client";

import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string;
  message: string;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: ConfirmModalProps) {
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      {/* O card do modal */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        
        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose} 
            className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm} 
            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-500 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}