using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AvineApi.Models
{
    // Mapeia esta classe para a tabela "tarefas" no banco SQL
    [Table("tarefas")]
    public class Tarefa
    {
        [Key] 
        [Column("id")] 
        public int Id { get; set; }

        [Required] 
        [Column("titulo")] 
        public string Titulo { get; set; } = string.Empty;

        [Column("descricao")]
        public string? Descricao { get; set; } 

        [Column("data_vencimento")]
        public DateTime? DataVencimento { get; set; } 

        [Column("concluida")]
        public bool Concluida { get; set; }
    }
}