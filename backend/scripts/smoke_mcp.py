"""Fumaça do conector do Claude (feature 103): OAuth completo + ferramentas MCP contra a API local.

Uso (dentro do contêiner): docker exec ocean_backend python scripts/smoke_mcp.py <login_autor> [<login_outro_nao_admin>]

O consentimento é feito com um token do Proposal gerado aqui (sem senha), como o painel faria após o login.
Cria uma proposta e uma vaga de teste em nome do autor.
"""
import base64
import hashlib
import json
import secrets
import sys
from datetime import date, timedelta
from urllib.parse import parse_qs, urlparse

import httpx

sys.path.insert(0, ".")

from app.api.routes.auth import APP_PROPOSAL, create_access_token  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models import UsuarioApp  # noqa: E402

API = "http://localhost:8000"
REDIRECT = "http://127.0.0.1:33418/callback"
falhas: list[str] = []


def checar(condicao: bool, rotulo: str, detalhe: object = "") -> None:
    print(("OK   " if condicao else "FALHA") + f" {rotulo}" + (f" — {detalhe}" if detalhe and not condicao else ""))
    if not condicao:
        falhas.append(rotulo)


def token_proposal(login: str) -> str:
    db = SessionLocal()
    try:
        u = db.query(UsuarioApp).filter(UsuarioApp.usuario == login).one()
        dados = {"sub": u.usuario, "uid": u.id, "papel": u.papel or "visualizador", "app": APP_PROPOSAL}
        return create_access_token(dados, timedelta(minutes=10))
    finally:
        db.close()


def conectar(c: httpx.Client, login: str) -> tuple[dict, dict]:
    reg = c.post("/api/mcp/oauth/register", json={"client_name": "Fumaça MCP", "redirect_uris": [REDIRECT]})
    checar(reg.status_code == 201, "registro dinâmico", reg.text)
    cliente = reg.json()
    verifier = secrets.token_urlsafe(48)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
    auth = c.get("/api/mcp/oauth/authorize", params={
        "response_type": "code", "client_id": cliente["client_id"], "redirect_uri": REDIRECT,
        "code_challenge": challenge, "code_challenge_method": "S256", "state": "xyz",
        "resource": f"{API}/api/mcp".replace("8000", "8001"),
    })
    checar(auth.status_code == 302 and "/conectar-claude?pedido=" in auth.headers.get("location", ""),
           "authorize redireciona ao painel", auth.headers.get("location"))
    pedido = parse_qs(urlparse(auth.headers["location"]).query)["pedido"][0]
    cab = {"Authorization": f"Bearer {token_proposal(login)}"}
    info = c.get("/api/mcp/oauth/pedido", params={"pedido": pedido}, headers=cab)
    checar(info.status_code == 200 and info.json()["cliente_nome"] == "Fumaça MCP", "pedido no painel", info.text)
    cons = c.post("/api/mcp/oauth/consentir", json={"pedido": pedido, "aprovar": True}, headers=cab)
    retorno = urlparse(cons.json()["redirect_url"])
    q = parse_qs(retorno.query)
    checar(q.get("state") == ["xyz"] and "code" in q, "consentimento devolve code + state", cons.text)
    tok = c.post("/api/mcp/oauth/token", data={
        "grant_type": "authorization_code", "code": q["code"][0], "redirect_uri": REDIRECT,
        "client_id": cliente["client_id"], "code_verifier": verifier,
    })
    checar(tok.status_code == 200 and tok.json().get("token_type") == "Bearer", "troca do código", tok.text)
    reuso = c.post("/api/mcp/oauth/token", data={
        "grant_type": "authorization_code", "code": q["code"][0], "redirect_uri": REDIRECT,
        "client_id": cliente["client_id"], "code_verifier": verifier,
    })
    checar(reuso.status_code == 400 and reuso.json()["error"] == "invalid_grant", "código é de uso único")
    return cliente, tok.json()


def rpc(c: httpx.Client, token: str, metodo: str, params: dict | None = None, id_: int = 1) -> httpx.Response:
    return c.post("/api/mcp", headers={"Authorization": f"Bearer {token}"},
                  json={"jsonrpc": "2.0", "id": id_, "method": metodo, "params": params or {}})


def ferramenta(c: httpx.Client, token: str, nome: str, args: dict) -> tuple[bool, object]:
    r = rpc(c, token, "tools/call", {"name": nome, "arguments": args}).json()["result"]
    texto = r["content"][0]["text"]
    try:
        return r["isError"], json.loads(texto)
    except ValueError:
        return r["isError"], texto


def main() -> None:
    autor = sys.argv[1]
    outro = sys.argv[2] if len(sys.argv) > 2 else None
    with httpx.Client(base_url=API, follow_redirects=False, timeout=30) as c:
        cliente, tokens = conectar(c, autor)
        acesso = tokens["access_token"]

        ini = rpc(c, acesso, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {},
                                             "clientInfo": {"name": "fumaca", "version": "1"}}).json()
        checar(ini["result"]["protocolVersion"] == "2025-06-18", "initialize")
        notif = c.post("/api/mcp", headers={"Authorization": f"Bearer {acesso}"},
                       json={"jsonrpc": "2.0", "method": "notifications/initialized"})
        checar(notif.status_code == 202, "notificação → 202")
        nomes = [t["name"] for t in rpc(c, acesso, "tools/list").json()["result"]["tools"]]
        checar(len(nomes) == 11, "tools/list com 11 ferramentas", nomes)
        checar(rpc(c, acesso, "metodo/inexistente").json()["error"]["code"] == -32601, "método inexistente")
        checar(c.get("/api/mcp").status_code == 405, "GET /api/mcp → 405")

        erro, r = ferramenta(c, acesso, "listar_propostas", {"status": "aguardando"})
        checar(not erro and "items" in r, "listar_propostas", r)
        erro, r = ferramenta(c, acesso, "listar_modelos", {})
        checar(not erro and "items" in r, "listar_modelos", r)
        erro, r = ferramenta(c, acesso, "listar_vagas", {"status": "aberta"})
        checar(not erro and "items" in r, "listar_vagas", r)
        if not erro and r["items"]:
            erro, rc = ferramenta(c, acesso, "listar_candidaturas", {"vaga_id": r["items"][0]["id"]})
            checar(not erro and "vaga" in rc, "listar_candidaturas", rc)
        erro, r = ferramenta(c, acesso, "ver_proposta", {"id": 999999})
        checar(erro and r == "Proposta não encontrada", "ver_proposta inexistente", r)

        nova = {
            "modelo": "executive-search", "cliente_nome": "Empresa Fumaça MCP", "setor": "tecnologia",
            "validade_dias": 30, "data_proposta": date.today().isoformat(),
            "projeto_escopo": "Busca de executivos para a área financeira.",
            "projetos": [
                {"nome": "CFO", "investimentos": [{"tipo": "retainer", "taxa_tipo": "percentual", "taxa": 30}]},
                {"nome": "Controller", "investimentos": [
                    {"tipo": "sucesso", "taxa_tipo": "percentual", "taxa": 25, "entrada": 30}]},
            ],
        }
        erro, r = ferramenta(c, acesso, "criar_proposta", {**nova, "setor": "agro"})
        checar(erro and r == "Selecione o setor", "criar_proposta com setor inválido", r)
        erro, p = ferramenta(c, acesso, "criar_proposta", nova)
        checar(not erro and p.get("codigo") and p.get("consultor_nome"), "criar_proposta (consultor do perfil)", p)
        if not erro:
            checar(p["link_painel"].endswith(f"/propostas/{p['id']}") and "/p/" in p["link_cliente"], "links da proposta")
            erro, e = ferramenta(c, acesso, "editar_proposta", {"id": p["id"], "validade_dias": 45})
            checar(not erro and e["alterada"] and e["versao"] == 2 and e["validade_dias"] == 45
                   and len(e["projetos"]) == 2, "editar_proposta parcial", e)

        erro, v = ferramenta(c, acesso, "criar_vaga", {
            "titulo": "Vaga Fumaça MCP", "area": "financas", "nivel": "diretoria", "localidade": "São Paulo / SP",
            "resumo": "Teste do conector", "requisitos": "Requisito 1\nRequisito 2", "cliente": "Cliente teste",
        })
        checar(not erro and v["status"] == "aberta", "criar_vaga", v)
        if not erro:
            erro, ve = ferramenta(c, acesso, "editar_vaga", {"id": v["id"], "localidade": "Remoto · Brasil"})
            checar(not erro and ve["localidade"] == "Remoto · Brasil" and ve["titulo"] == "Vaga Fumaça MCP",
                   "editar_vaga parcial", ve)

        if outro and not erro:
            _, tokens_outro = conectar(c, outro)
            erro, r = ferramenta(c, tokens_outro["access_token"], "editar_proposta", {"id": p["id"], "validade_dias": 60})
            checar(erro and "Apenas quem criou" in str(r), "outro consultor não edita proposta alheia", r)

        isolado = c.get("/api/proposal/auth/me", headers={"Authorization": f"Bearer {acesso}"})
        checar(isolado.status_code in (401, 403), "token do conector recusado no Proposal", isolado.status_code)
        isolado = c.get("/api/auth/me", headers={"Authorization": f"Bearer {acesso}"})
        checar(isolado.status_code in (401, 403), "token do conector recusado no ERP", isolado.status_code)
        r = rpc(c, token_proposal(autor), "ping")
        checar(r.status_code == 401, "token do Proposal recusado no MCP", r.status_code)

        ren = c.post("/api/mcp/oauth/token", data={
            "grant_type": "refresh_token", "refresh_token": tokens["refresh_token"], "client_id": cliente["client_id"],
        })
        checar(ren.status_code == 200, "refresh com rotação", ren.text)
        novo = ren.json()
        conexoes = c.get("/api/mcp/conexoes", headers={"Authorization": f"Bearer {token_proposal(autor)}"}).json()
        checar(any(x["cliente_nome"] == "Fumaça MCP" for x in conexoes["items"]), "conexão listada no perfil")

        reuso = c.post("/api/mcp/oauth/token", data={
            "grant_type": "refresh_token", "refresh_token": tokens["refresh_token"], "client_id": cliente["client_id"],
        })
        checar(reuso.status_code == 400, "reuso de refresh recusado")
        r = rpc(c, novo["access_token"], "ping")
        checar(r.status_code == 401, "reuso de refresh revoga a conexão", r.status_code)

    print(f"\n{'Tudo certo' if not falhas else f'{len(falhas)} falha(s): ' + ', '.join(falhas)}")
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
