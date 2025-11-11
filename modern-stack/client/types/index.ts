export interface Tarefa {
    id: number;
    titulo: string;
    descricao?: string; 
    dataVencimento?: string | null; 
    concluida: boolean;
  }