<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<%
Option Explicit
Response.CodePage = 65001
Response.Charset  = "utf-8"

'# Bloco de Conexão e Helpers

Function AbreConexao()
    Dim strConn
    strConn = "DRIVER={MySQL ODBC 9.5 ANSI Driver};" & _
              "SERVER=127.0.0.1;" & _
              "PORT=3306;" & _
              "DATABASE=avine_tarefas_db;" & _
              "USER=root;" & _
              "PASSWORD=Avine123!;" & _
              "OPTION=3;"
    Set AbreConexao = Server.CreateObject("ADODB.Connection")
    AbreConexao.Open strConn
End Function
Sub FechaConexao(ByRef objConn)
    On Error Resume Next
    If Not objConn Is Nothing Then
        If objConn.State <> 0 Then objConn.Close
    End If
    Set objConn = Nothing
End Sub
Function H(s)
    If IsNull(s) Then s = ""
    H = Server.HTMLEncode(CStr(s))
End Function
Function MyIIf(bCondition, sTrue, sFalse)
    If bCondition Then
        MyIIf = sTrue
    Else
        MyIIf = sFalse
    End If
End Function
Function IsBlank(s) : IsBlank = (Trim("" & s) = "") : End Function
Function ParseDate(q)
    On Error Resume Next
    Dim d, parts
    q = Trim(q)
    If q = "" Then ParseDate = Null : Exit Function
    parts = Split(q, "/")
    If UBound(parts) = 2 Then
        d = DateSerial(CInt(parts(2)), CInt(parts(1)), CInt(parts(0)))
        If Err.Number = 0 Then ParseDate = CDate(d) : Exit Function
        Err.Clear
    End If
    parts = Split(q, "-")
    If UBound(parts) = 2 Then
        d = DateSerial(CInt(parts(0)), CInt(parts(1)), CInt(parts(2)))
        If Err.Number = 0 Then ParseDate = CDate(d) : Exit Function
        Err.Clear
    End If
    ParseDate = Null
End Function


Dim cn : Set cn = AbreConexao()
If (cn Is Nothing) Then
  Response.Write "<h2 style='color:red'>Falha ao conectar no banco.</h2>"
  Response.End
End If

Dim q, status, whereSql, cmd, rs, sql, dsearch
q      = Trim(Request("q"))
status = LCase(Trim(Request("status")))
If status <> "pendentes" And status <> "concluidas" Then status = "todas"
whereSql = " WHERE 1=1 "
If status = "pendentes" Then
  whereSql = whereSql & " AND concluida=0 "
ElseIf status = "concluidas" Then
  whereSql = whereSql & " AND concluida=1 "
End If
dsearch = ParseDate(q)
If IsDate(dsearch) Then
  whereSql = whereSql & " AND DATE(data_vencimento) = ? "
ElseIf Not IsBlank(q) Then
  whereSql = whereSql & " AND (titulo LIKE ? OR descricao LIKE ?) "
End If
sql = "SELECT id, titulo, descricao, " & _
      "DATE_FORMAT(data_vencimento, '%Y-%m-%d') AS venc_iso, " & _
      "DATE_FORMAT(data_vencimento, '%d/%m/%Y') AS venc_br, concluida " & _
      "FROM tarefas " & whereSql & " " & _
      "ORDER BY concluida ASC, data_vencimento ASC, id DESC"
Set cmd = Server.CreateObject("ADODB.Command")
With cmd
  .ActiveConnection = cn
  .CommandType = 1 ' adCmdText
  .CommandText = sql
  If IsDate(dsearch) Then
    .Parameters.Append .CreateParameter("p1", 135, 1, , CDate(dsearch))
  ElseIf Not IsBlank(q) Then
    .Parameters.Append .CreateParameter("p1", 200, 1, 255, "%" & q & "%")
    .Parameters.Append .CreateParameter("p2", 200, 1, 255, "%" & q & "%")
  End If
End With
Set rs = cmd.Execute()
%>
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<title>ASP Clássico • Tarefas</title>
<style>
  body{font-family:system-ui,Segoe UI,Arial,sans-serif;margin:24px;background:#fff;color:#222}
  h1{margin:0 0 16px}
  .filtro-container{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:16px}
  .filtro-botoes{display:flex;gap:8px}
  .filtro-busca{display:flex;gap:8px}
  input[type=text],select{padding:8px 10px;border:1px solid #ddd;border-radius:8px}
  button,a.btn{padding:8px 12px;border:0;border-radius:8px;background:#006838;color:#fff;text-decoration:none;cursor:pointer}
  button:hover,a.btn:hover{background:#fcc908;color:#333}
  a.btn.sec{background:#888}
  a.btn.sec:hover{background:#aaa}
  a.btn.danger{background:#d9534f}
  a.btn.danger:hover{background:#c9302c}
  a.btn-filtro{
    background: #eee;
    color: #555;
    padding: 8px 12px;
    border-radius: 8px;
    text-decoration: none;
  }
  a.btn-filtro.active, a.btn-filtro:hover{
    background: #fcc908;
    color: #333;
  }
  table{border-collapse:collapse;width:100%;background:#fafafa}
  th,td{border:1px solid #eee;padding:10px;vertical-align:top;text-align:left}
  td.done{background:#f0fff0;text-decoration:line-through;color:#777}
  .actions a{margin-right:8px}
  .muted{color:#666;font-size:12px}
</style>
</head>
<body>
  <h1>Lista de Tarefas</h1>

  <div class="filtro-container">
    <div class="filtro-botoes">
      <a href="Default.asp?status=todas&q=<%=H(q)%>" 
         class="btn-filtro <%=MyIIf(status="todas","active","")%>">Todas</a>
      <a href="Default.asp?status=pendentes&q=<%=H(q)%>" 
         class="btn-filtro <%=MyIIf(status="pendentes","active","")%>">Pendentes</a>
      <a href="Default.asp?status=concluidas&q=<%=H(q)%>" 
         class="btn-filtro <%=MyIIf(status="concluidas","active","")%>">Concluídas</a>
    </div>
    
    <form class="filtro-busca" method="get" action="Default.asp">
      <input type="text" name="q" value="<%=H(q)%>" placeholder="Buscar por título, descrição..." />
      <input type="hidden" name="status" value="<%=H(status)%>" />
      <button type="submit">Buscar</button>
      <a class="btn sec" href="Default.asp">Limpar</a>
    </form>
  </div>
  
  <p><a class="btn" href="form.asp">+ Nova tarefa</a></p>

  <table>
    <tr>
      <th>#</th>
      <th>Título</th>
      <th>Vencimento</th>
      <th>Status</th>
      <th>Ações</th>
    </tr>
<%
  Do Until rs.EOF
    Dim rid, rtitulo, rvencbr, rconcluida, sDoneClass
    rid        = rs("id")
    rtitulo    = rs("titulo")
    rvencbr    = rs("venc_br")
    rconcluida = rs("concluida")
    sDoneClass = MyIIf(CInt(rconcluida)=1,"done","")
%>
    <tr>
      <td class="<%=sDoneClass%>"><%=rid%></td>
      <td class="<%=sDoneClass%>">
        <strong><%=H(rtitulo)%></strong><br />
        <span class="muted"><%=H(Left("" & rs("descricao"), 140))%></span>
      </td>
      <td class="<%=sDoneClass%>"><%=H(rvencbr)%></td>
      <td class="<%=sDoneClass%>"><%=MyIIf(CInt(rconcluida)=1, "Concluída", "Pendente")%></td>
      <td class="actions">
        <a href="toggle.asp?id=<%=rid%>" class="btn sec"><%=MyIIf(CInt(rconcluida)=1,"Desfazer","Concluir")%></a>
        <% If CInt(rconcluida) = 0 Then %>
          <a href="form.asp?id=<%=rid%>" class="btn sec">Editar</a>
        <% End If %>
        <a href="delete.asp?id=<%=rid%>" class="btn danger" onclick="return confirm('Excluir esta tarefa?');">Excluir</a>
      </td>
    </tr>
<%
    rs.MoveNext
  Loop
  rs.Close : Set rs = Nothing
  Call FechaConexao(cn)
%>
  </table>
</body>
</html>