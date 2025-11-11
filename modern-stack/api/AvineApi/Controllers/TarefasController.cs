using AvineApi.Data;
using AvineApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AvineApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class TarefasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TarefasController(AppDbContext context)
        {
            _context = context;
        }

        // --- Listar Todas as Tarefas ---
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tarefa>>> GetTarefas()
        {
            var tarefas = await _context.Tarefas.ToListAsync();
            return Ok(tarefas); 
        }

        // --- Buscar Tarefa por ID ---
        [HttpGet("{id}")]
        public async Task<ActionResult<Tarefa>> GetTarefa(int id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);

            if (tarefa == null)
            {
                return NotFound(); 
            }

            return Ok(tarefa); 
        }

        // --- Adicionar Nova Tarefa ---
        [HttpPost]
        public async Task<ActionResult<Tarefa>> PostTarefa(Tarefa tarefa)
        {
            if (string.IsNullOrEmpty(tarefa.Titulo))
            {
                return BadRequest("O título é obrigatório."); 
            }

            _context.Tarefas.Add(tarefa);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTarefa), new { id = tarefa.Id }, tarefa);
        }

        // --- Editar Tarefa Existente ---
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTarefa(int id, Tarefa tarefa)
        {
            if (id != tarefa.Id)
            {
                return BadRequest("O ID da rota não corresponde ao ID da tarefa."); 
            }
            _context.Entry(tarefa).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Tarefas.Any(e => e.Id == id))
                {
                    return NotFound(); 
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); 
        }

        // --- DELETE: Excluir Tarefa ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTarefa(int id)
        {
            var tarefa = await _context.Tarefas.FindAsync(id);
            if (tarefa == null)
            {
                return NotFound();
            }

            _context.Tarefas.Remove(tarefa);
            await _context.SaveChangesAsync();

            return NoContent(); 
        }
    }
}