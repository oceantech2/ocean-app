import re
from typing import Optional

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def so_digitos(valor: Optional[str]) -> str:
    return re.sub(r"\D", "", valor or "")


def normalizar_cnpj(valor: Optional[str]) -> str:
    """14 posições: A–Z e 0–9, maiúsculas, sem pontuação (RFB/Serpro)."""
    return re.sub(r"[^0-9A-Z]", "", (valor or "").upper())[:14]


def _valor_cnpj(caractere: str) -> int:
    # RFB: valor = ASCII - 48 ('0'=0 … '9'=9, 'A'=17 …)
    return ord(caractere) - 48


def _dv_cnpj(corpo: str, pesos: list[int]) -> int:
    soma = sum(_valor_cnpj(corpo[i]) * pesos[i] for i in range(len(pesos)))
    d = 11 - (soma % 11)
    return 0 if d >= 10 else d


def validar_cpf(cpf: str) -> bool:
    c = so_digitos(cpf)
    if len(c) != 11 or c == c[0] * 11:
        return False
    soma = sum(int(c[i]) * (10 - i) for i in range(9))
    r = (soma * 10) % 11
    if r in (10, 11):
        r = 0
    if r != int(c[9]):
        return False
    soma = sum(int(c[i]) * (11 - i) for i in range(10))
    r = (soma * 10) % 11
    if r in (10, 11):
        r = 0
    return r == int(c[10])


def validar_cnpj(cnpj: str) -> bool:
    c = normalizar_cnpj(cnpj)
    if len(c) != 14 or c == c[0] * 14:
        return False
    if not c[12:].isdigit():
        return False
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    d1 = _dv_cnpj(c[:12], pesos1)
    d2 = _dv_cnpj(c[:13], pesos2)
    return d1 == int(c[12]) and d2 == int(c[13])


def formatar_cpf(cpf: str) -> str:
    c = so_digitos(cpf)[:11]
    if len(c) != 11:
        return c
    return f"{c[:3]}.{c[3:6]}.{c[6:9]}-{c[9:]}"


def formatar_cnpj(cnpj: str) -> str:
    c = normalizar_cnpj(cnpj)
    if len(c) <= 2:
        return c
    if len(c) <= 5:
        return f"{c[:2]}.{c[2:]}"
    if len(c) <= 8:
        return f"{c[:2]}.{c[2:5]}.{c[5:]}"
    if len(c) <= 12:
        return f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:]}"
    return f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:12]}-{c[12:14]}"


def formatar_documento(tipo_documento: str, documento: str) -> str:
    if tipo_documento == "cnpj":
        return formatar_cnpj(documento)
    return formatar_cpf(documento)


def validar_email(email: Optional[str]) -> bool:
    if not email or not email.strip():
        return True
    return bool(EMAIL_RE.match(email.strip()))
