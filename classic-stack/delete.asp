<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<%
Option Explicit
Response.CodePage = 65001
Response.Charset  = "utf-8"


'# Bloco de Conexão

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


Dim cn, id, sql, cmd

' Pega o ID da URL 
id = Trim(Request.QueryString("id"))

' Validação
If IsNumeric(id) And Not IsEmpty(id) Then
    
    Set cn = AbreConexao()
    
    sql = "DELETE FROM tarefas WHERE id = ?"
    
    Set cmd = Server.CreateObject("ADODB.Command")
    With cmd
        .ActiveConnection = cn
        .CommandText = sql
        ' Adiciona o ID como um parâmetro seguro
        .Parameters.Append .CreateParameter("pID", 3, 1, , CInt(id)) ' adInteger
        .Execute() ' Executa o DELETE
    End With
    
    ' Limpa e fecha a conexão
    Set cmd = Nothing
    If Not cn Is Nothing Then
        If cn.State <> 0 Then cn.Close
    End If
    Set cn = Nothing
    
End If

Response.Redirect "Default.asp"
%>