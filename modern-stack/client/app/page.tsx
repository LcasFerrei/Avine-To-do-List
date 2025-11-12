"use client"; 

import React, { useState, useEffect } from 'react';
import type { Tarefa } from '../types';
import TaskForm from '../components/TaskForm';
import ConfirmModal from '../components/ConfirmModal';
import ErrorModal from '../components/ErrorModal';

const API_URL = "http://localhost:5167/api/tarefas";

type FiltroStatus = 'todas' | 'pendentes' | 'concluidas';

export default function HomePage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Tarefa | null>(null);

  const [filtro, setFiltro] = useState<FiltroStatus>('todas');
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    async function fetchTarefas() {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        const data: Tarefa[] = await response.json();
        setTarefas(data); 
      } catch (err) {
        setErrorModal({ isOpen: true, message: err instanceof Error ? err.message : "Um erro desconhecido ocorreu" });
      } finally {
        setLoading(false);
      }
    }
    fetchTarefas();
  }, []);

  // --- Funções de Handler---
  const handleSaveTask = async (tarefaFormData: Omit<Tarefa, 'id' | 'concluida'>, id?: number) => {
    if (id) {
      try {
        const tarefaExistente = tarefas.find(t => t.id === id);
        const tarefaCompleta = { ...tarefaFormData, id, concluida: tarefaExistente?.concluida || false };
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tarefaCompleta),
        });
        if (!response.ok) throw new Error('Falha ao atualizar a tarefa');
        setTarefas(listaAnterior => listaAnterior.map(t => t.id === id ? tarefaCompleta : t));
        setTaskToEdit(null); 
      } catch (err) {
        setErrorModal({ isOpen: true, message: err instanceof Error ? err.message : "Falha ao atualizar tarefa" });
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
        setErrorModal({ isOpen: true, message: err instanceof Error ? err.message : "Falha ao salvar tarefa" });
      }
    }
  };
  const handleEditClick = (tarefa: Tarefa) => { setTaskToEdit(tarefa); window.scrollTo(0, 0); };
  const handleCancelEdit = () => { setTaskToEdit(null); };
  const handleToggleConcluida = async (id: number) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;
    const updatedTask = { ...tarefa, concluida: !tarefa.concluida };
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) throw new Error('Falha ao atualizar o status da tarefa');
      setTarefas(listaAnterior =>
        listaAnterior.map(t => (t.id === id ? updatedTask : t))
      );
    } catch (err) {
      setErrorModal({ isOpen: true, message: err instanceof Error ? err.message : "Falha ao atualizar status" });
    }
  };
  const handleDeleteTask = async () => {
    if (taskToDeleteId === null) return;
    try {
      const response = await fetch(`${API_URL}/${taskToDeleteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao excluir a tarefa');
      setTarefas(listaAnterior => listaAnterior.filter(tarefa => tarefa.id !== taskToDeleteId));
    } catch (err) {
      setErrorModal({ isOpen: true, message: err instanceof Error ? err.message : "Falha ao excluir tarefa" });
    } finally {
      closeDeleteModal();
    }
  };
  const openDeleteModal = (id: number) => { setTaskToDeleteId(id); setIsModalOpen(true); };
  const closeDeleteModal = () => { setTaskToDeleteId(null); setIsModalOpen(false); };
  const closeErrorModal = () => { setErrorModal({ isOpen: false, message: '' }); };
  const handleValidationError = (message: string) => { setErrorModal({ isOpen: true, message: message }); };

  // --- LÓGICA DE FILTRO E ORDENAÇÃO ---
  const tarefasFiltradasOrdenadas = [...tarefas]
    .filter(tarefa => {
      // Filtro de Status
      if (filtro === 'pendentes') return !tarefa.concluida;
      if (filtro === 'concluidas') return tarefa.concluida;
      return true; 
    })
    .filter(tarefa => {
      // Filtro de Busca (Título, Descrição E DATA)
      if (!termoBusca) return true;

      const busca = termoBusca.toLowerCase();
      
      const titulo = tarefa.titulo.toLowerCase();
      if (titulo.includes(busca)) return true;

      const descricao = tarefa.descricao?.toLowerCase() || '';
      if (descricao.includes(busca)) return true;

      if (tarefa.dataVencimento) {
        if (tarefa.dataVencimento.includes(busca)) return true;
        const dataFormatada = new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        if (dataFormatada.includes(busca)) return true;
      }
      
      return false; 
    })
    .sort((a, b) => {
      // Ordenação
      return a.concluida === b.concluida ? 0 : a.concluida ? 1 : -1;
    });

  return (
    <main className="min-h-screen bg-green-700 text-white p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4 text-yellow-400">
            Lista de Tarefas
          </h1>
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setFiltro('todas')}
              className={`py-2 px-4 rounded font-medium ${
                filtro === 'todas' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro('pendentes')}
              className={`py-2 px-4 rounded font-medium ${
                filtro === 'pendentes' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFiltro('concluidas')}
              className={`py-2 px-4 rounded font-medium ${
                filtro === 'concluidas' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              Concluídas
            </button>
          </div>

          {loading && <p className="text-center">Carregando tarefas...</p>}

          {!loading && (
            <ul className="space-y-4">
              {tarefasFiltradasOrdenadas.length > 0 ? (
                tarefasFiltradasOrdenadas.map(tarefa => (
                  <li 
                    key={tarefa.id} 
                    className={`
                      bg-gray-800 p-4 rounded-lg shadow-lg flex justify-between items-center 
                      transition-all
                      ${tarefa.concluida ? 'opacity-75' : 'opacity-100'}
                    `}
                  >
                    <div className={`${tarefa.concluida ? 'line-through' : ''}`}>
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
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleToggleConcluida(tarefa.id)}
                        className={`font-bold py-1 px-3 rounded transition-colors ${
                          tarefa.concluida 
                            ? "bg-gray-500 hover:bg-gray-400"
                            : "bg-green-600 hover:bg-green-500"
                        } text-white`}
                      >
                        {tarefa.concluida ? 'Desfazer' : 'Concluir'}
                      </button>
                      {!tarefa.concluida && (
                        <button
                          onClick={() => handleEditClick(tarefa)}
                          className="bg-blue-600 text-white font-bold py-1 px-3 rounded hover:bg-blue-500 transition-colors"
                        >
                          Editar
                        </button>
                      )}
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
                <div className="text-center text-white py-12">
                  <svg 
                    className="mx-auto h-16 w-16 text-yellow-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M19.5 14.25c0 1.32-1.007 2.488-2.37 2.898-1.408.42-2.936.42-4.344 0-1.363-.41-2.37-1.578-2.37-2.898s1.007-2.488 2.37-2.898c1.408-.42 2.936-.42 4.344 0 1.363.41 2.37 1.578 2.37 2.898zM17.13 11.352c1.363.41 2.37 1.578 2.37 2.898s-1.007 2.488-2.37 2.898c-1.408.42-2.936.42-4.344 0-1.363-.41-2.37-1.578-2.37-2.898 0-1.32 1.007-2.488 2.37-2.898 1.408-.42 2.936-.42 4.344 0zM12 3c-3.17 0-5.75 2.58-5.75 5.75 0 2.112.803 4.02 2.121 5.488C9.54 15.68 10.74 16.5 12 16.5s2.46-.82 3.629-2.262C16.947 12.77 17.75 10.862 17.75 8.75 17.75 5.58 15.17 3 12 3z" 
                    />
                  </svg>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {termoBusca ? 'Nenhum resultado encontrado' : 'Nenhuma tarefa encontrada'}
                  </h3>
                  <p className="mt-1 text-base text-gray-200">
                    {termoBusca ? 'Tente uma busca diferente.' : 'Adicione uma nova tarefa para começar!'}
                  </p>
                </div>
              )}
            </ul>
          )}
        </div>

        <div className="md:col-span-1 space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Pesquisar</h2>
            <input
              type="text"
              placeholder="Buscar por título, descrição, data..."
              className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>

          <TaskForm 
            onSave={handleSaveTask}
            tarefaParaEditar={taskToEdit}
            onCancelEdit={handleCancelEdit}
            onError={handleValidationError}
          />
        </div>

      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteTask}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeErrorModal}
        title="Atenção"
        message={errorModal.message}
      />
    </main>
  );
}