import re
from typing import Optional

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def so_digitos(valor: Optional[str]) -> str:
    return re.sub(r"\D", "", valor or "")


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
    c = so_digitos(cnpj)
    if len(c) != 14 or c == c[0] * 14:
        return False
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    d1 = 11 - (sum(int(c[i]) * pesos1[i] for i in range(12)) % 11)
    d1 = 0 if d1 >= 10 else d1
    d2 = 11 - (sum(int(c[i]) * pesos2[i] for i in range(13)) % 11)
    d2 = 0 if d2 >= 10 else d2
    return d1 == int(c[12]) and d2 == int(c[13])


def formatar_cpf(cpf: str) -> str:
    c = so_digitos(cpf)[:11]
    if len(c) != 11:
        return c
    return f"{c[:3]}.{c[3:6]}.{c[6:9]}-{c[9:]}"


def formatar_cnpj(cnpj: str) -> str:
    c = so_digitos(cnpj)[:14]
    if len(c) != 14:
        return c
    return f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:12]}-{c[12:]}"


def formatar_documento(tipo_documento: str, documento: str) -> str:
    if tipo_documento == "cnpj":
        return formatar_cnpj(documento)
    return formatar_cpf(documento)


def validar_email(email: Optional[str]) -> bool:
    if not email or not email.strip():
        return True
    return bool(EMAIL_RE.match(email.strip()))
