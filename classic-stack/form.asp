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

Dim id, modo, titulo, descricao, venc_iso, sql, cmd, rs, pVencimento
id = Trim(Request("id"))
modo = "Nova"

' Valores padrão
titulo = ""
descricao = ""
venc_iso = ""

If Not IsBlank(id) Then
    modo = "Editar"
    sql = "SELECT titulo, descricao, DATE_FORMAT(data_vencimento, '%Y-%m-%d') AS venc_iso FROM tarefas WHERE id = ?"
    
    Set cmd = Server.CreateObject("ADODB.Command")
    With cmd
        .ActiveConnection = cn
        .CommandText = sql
        .Parameters.Append .CreateParameter("pID", 3, 1, , CInt(id)) ' adInteger
        Set rs = .Execute()
    End With
    
    If Not rs.EOF Then
        titulo = rs("titulo")
        descricao = rs("descricao")
        venc_iso = rs("venc_iso")
    Else
        Response.Write "Erro: Tarefa não encontrada."
        Response.End
    End If
    rs.Close : Set rs = Nothing
End If

' Salvar
If Request.ServerVariables("REQUEST_METHOD") = "POST" Then
    titulo = Trim(Request.Form("titulo"))
    descricao = Trim(Request.Form("descricao"))
    venc_iso = Trim(Request.Form("data_vencimento"))

    ' Validação
    If IsBlank(titulo) Then
        Response.Write "<script>alert('O Título é obrigatório!'); history.go(-1);</script>"
        Response.End
    End If
    
    ' Converte a data
    If IsBlank(venc_iso) Then
        pVencimento = Null
    Else
        pVencimento = ParseDate(venc_iso)
        If Not IsDate(pVencimento) Then pVencimento = Null
    End If

    Set cmd = Server.CreateObject("ADODB.Command")
    cmd.ActiveConnection = cn

    If modo = "Editar" Then
        ' Atualizar
        sql = "UPDATE tarefas SET titulo=?, descricao=?, data_vencimento=? WHERE id = ?"
        cmd.CommandText = sql
        cmd.Parameters.Append cmd.CreateParameter("p1", 200, 1, 255, titulo)
        cmd.Parameters.Append cmd.CreateParameter("p2", 201, 1, 65535, descricao) ' adLongVarChar
        cmd.Parameters.Append cmd.CreateParameter("p3", 133, 1, , pVencimento) ' adDate
        cmd.Parameters.Append cmd.CreateParameter("p4", 3, 1, , CInt(id)) ' adInteger
    Else
        ' Criar
        sql = "INSERT INTO tarefas (titulo, descricao, data_vencimento, concluida) VALUES (?, ?, ?, 0)"
        cmd.CommandText = sql
        cmd.Parameters.Append cmd.CreateParameter("p1", 200, 1, 255, titulo)
        cmd.Parameters.Append cmd.CreateParameter("p2", 201, 1, 65535, descricao)
        cmd.Parameters.Append cmd.CreateParameter("p3", 133, 1, , pVencimento)
    End If

    cmd.Execute() 
    
    Set cmd = Nothing
    Call FechaConexao(cn)
    
    Response.Redirect "Default.asp"
End If
%>
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<title><%=modo%> Tarefa • ASP Clássico</title>
<style>
  body{font-family:system-ui,Segoe UI,Arial,sans-serif;margin:24px;background:#fff;color:#222}
  h1{margin:0 0 16px}
  .form-container{max-width:500px;margin:auto;padding:20px;background:#fafafa;border:1px solid #eee;border-radius:8px}
  .form-group{margin-bottom:16px}
  .form-group label{display:block;font-weight:bold;margin-bottom:4px}
  input[type=text],input[type=date],textarea{
    width:95%;padding:10px;border:1px solid #ddd;border-radius:8px;font-family:inherit;font-size:16px;
  }
  textarea{height:80px}
  button,a.btn{padding:10px 15px;border:0;border-radius:8px;background:#006838;color:#fff;text-decoration:none;cursor:pointer;font-size:16px}
  button:hover,a.btn:hover{background:#fcc908;color:#333}
  a.btn.sec{background:#888}
  a.btn.sec:hover{background:#aaa}
</style>
</head>
<body>

  <div class="form-container">
    <h1><%=modo%> Tarefa</h1>
    
    <form method="post" action="form.asp?id=<%=H(id)%>">
      <div class="form-group">
        <label for="titulo">Título *</label>
        <input type="text" id="titulo" name="titulo" value="<%=H(titulo)%>">
      </div>
      
      <div class="form-group">
        <label for="descricao">Descrição</label>
        <textarea id="descricao" name="descricao"><%=H(descricao)%></textarea>
      </div>
      
      <div class="form-group">
        <label for="data_vencimento">Data de Vencimento</label>
        <input type="date" id="data_vencimento" name="data_vencimento" value="<%=H(venc_iso)%>">
      </div>
      
      <button type="submit">Salvar</button>
      <a href="Default.asp" class="btn sec">Cancelar</a>
    </form>
  </div>

</body>
</html>
<%
Call FechaConexao(cn)
%>