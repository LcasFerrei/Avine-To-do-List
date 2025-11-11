using AvineApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AvineApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        
        public DbSet<Tarefa> Tarefas { get; set; }
    }
}