"use client"; 
import React, { useState, useEffect } from 'react';
import type { Tarefa } from '../types';
import TaskForm from '../components/TaskForm';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = "http://localhost:5167/api/tarefas";

export default function HomePage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Tarefa | null>(null); 

  // Busca inicial de tarefas (GET)
  useEffect(() => {
    async function fetchTarefas() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        const data: Tarefa[] = await response.json();
        setTarefas(data); 
      } catch (err) {
        setError(err instanceof Error ? err.message : "Um erro desconhecido ocorreu");
      } finally {
        setLoading(false);
      }
    }
    fetchTarefas();
  }, []);

  // --- FUNÇÃO ON-SAVE (Lida com POST e PUT) ---
  const handleSaveTask = async (tarefaFormData: Omit<Tarefa, 'id' | 'concluida'>, id?: number) => {
    
    if (id) {
      try {
        const tarefaExistente = tarefas.find(t => t.id === id);
        const tarefaCompleta = { 
          ...tarefaFormData, 
          id, 
          concluida: tarefaExistente?.concluida || false 
        };

        const response = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tarefaCompleta), 
        });

        if (!response.ok) throw new Error('Falha ao atualizar a tarefa');

        setTarefas(listaAnterior => 
          listaAnterior.map(t => t.id === id ? tarefaCompleta : t)
        );
        setTaskToEdit(null); 

      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao atualizar tarefa");
      }
    
    } else {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...tarefaFormData, concluida: false }),
        });
        if (!response.ok) throw new Error('Falha ao salvar a tarefa');
        const tarefaSalva: Tarefa = await response.json();
        setTarefas(listaAnterior => [...listaAnterior, tarefaSalva]);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao salvar tarefa");
      }
    }
  };

  // --- FUNÇÃO PARA COMEÇAR A EDITAR ---
  const handleEditClick = (tarefa: Tarefa) => {
    setTaskToEdit(tarefa); 
    window.scrollTo(0, 0); 
  };

  // --- FUNÇÃO PARA CANCELAR A EDIÇÃO ---
  const handleCancelEdit = () => {
    setTaskToEdit(null); 
  };

  // Funções do Modal de Exclusão (sem mudanças)
  const handleDeleteTask = async () => {
    if (taskToDeleteId === null) return;
    try {
      const response = await fetch(`${API_URL}/${taskToDeleteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao excluir a tarefa');
      setTarefas(listaAnterior => listaAnterior.filter(tarefa => tarefa.id !== taskToDeleteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir tarefa");
    } finally {
      closeDeleteModal();
    }
  };
  const openDeleteModal = (id: number) => {
    setTaskToDeleteId(id);
    setIsModalOpen(true);
  };
  const closeDeleteModal = () => {
    setTaskToDeleteId(null);
    setIsModalOpen(false);
  };

  // --- RENDERIZAÇÃO ---
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
        Lista de Tarefas
      </h1>

      <div className="max-w-2xl mx-auto">
        
        <TaskForm 
          onSave={handleSaveTask}
          tarefaParaEditar={taskToEdit}
          onCancelEdit={handleCancelEdit}
        />

        {loading && <p className="text-center">Carregando tarefas...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <ul className="space-y-4">
            {tarefas.length > 0 ? (
              tarefas.map(tarefa => (
                <li 
                  key={tarefa.id} 
                  className="bg-gray-800 p-4 rounded-lg shadow-lg flex justify-between items-center"
                >
                  <div>
                    <span className="text-xl font-medium">{tarefa.titulo}</span>
                    {tarefa.descricao && (
                      <p className="text-sm text-gray-400">{tarefa.descricao}</p>
                    )}
                    {tarefa.dataVencimento && (
                      <p className="text-sm text-yellow-500 mt-1">
                        Vencimento: {new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </p>
                    )}
                  </div>
                  
                  {/* --- BOTÕES DE AÇÃO (EDITAR E EXCLUIR) --- */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleEditClick(tarefa)}
                      className="bg-blue-600 text-white font-bold py-1 px-3 rounded hover:bg-blue-500 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => openDeleteModal(tarefa.id)}
                      className="bg-red-600 text-white font-bold py-1 px-3 rounded hover:bg-red-500 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-400">Nenhuma tarefa encontrada.</p>
            )}
          </ul>
        )}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteTask}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />
    </main>
  );
}