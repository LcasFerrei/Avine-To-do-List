"use client";

import React, { useState, useEffect } from 'react';
import type { Tarefa } from '../types';

type TarefaFormData = Omit<Tarefa, 'id' | 'concluida'>;

interface TaskFormProps {
  onSave: (tarefa: TarefaFormData, id?: number) => void;
  tarefaParaEditar: Tarefa | null;
  onCancelEdit: () => void;
}

export default function TaskForm({ onSave, tarefaParaEditar, onCancelEdit }: TaskFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');

  useEffect(() => {
    if (tarefaParaEditar) {
      setTitulo(tarefaParaEditar.titulo);
      setDescricao(tarefaParaEditar.descricao || '');
      setDataVencimento(
        tarefaParaEditar.dataVencimento 
          ? new Date(tarefaParaEditar.dataVencimento).toISOString().split('T')[0] 
          : ''
      );
    } else {
      setTitulo('');
      setDescricao('');
      setDataVencimento('');
    }
  }, [tarefaParaEditar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo) {
      alert('O título é obrigatório.');
      return;
    }

    onSave(
      {
        titulo,
        descricao: descricao || undefined,
        dataVencimento: dataVencimento || null,
      },
      tarefaParaEditar ? tarefaParaEditar.id : undefined
    );
  };

  const handleCancel = () => {
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">
        {tarefaParaEditar ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
      </h2>

      {/* Campo Título */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-300">Título *</label>
        <input
          type="text" id="titulo" value={titulo}
          
          onChange={(e) => setTitulo(e.target.value)} 

          className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>

      {/* Campo Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-300">Descrição</label>
        <textarea
          id="descricao" value={descricao}
          onChange={(e) => setDescricao(e.target.value)} rows={3}
          className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>

      {/* Campo Data */}
      <div>
        <label htmlFor="dataVencimento" className="block text-sm font-medium text-gray-300">Data de Vencimento</label>
        <input
          type="date" id="dataVencimento" value={dataVencimento}
          onChange={(e) => setDataVencimento(e.target.value)}
          className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>

      {/* Botões */}
      <div className="flex space-x-4">
        <button
          type="submit"
          className="flex-1 bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
        >
          {tarefaParaEditar ? 'Salvar Alterações' : 'Salvar Tarefa'}
        </button>
        
        {tarefaParaEditar && (
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}