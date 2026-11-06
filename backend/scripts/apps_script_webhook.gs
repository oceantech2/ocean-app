/* WEBHOOK DO SITE (30/10/2026; leads em 06/11/2026)
 * Recebe do site (backend no Render) as candidaturas, gravadas nas abas Pessoas e Candidaturas,
 * e os contatos do formulário da landing ("tipo": "lead"), gravados nas abas Pessoas e Leads.
 * Contrato: specs/102-vagas-candidaturas/contracts/planilha-webhook.md (repo ocean-app).
 * Cópia versionada: backend/scripts/apps_script_webhook.gs (repo ocean-app).
 * Configuração: Configurações do projeto > Propriedades do script > WEBHOOK_SECRET
 *   (mesmo valor de SHEETS_WEBHOOK_SECRET no Render).
 * Implantação: Implantar > Nova implantação > App da Web, executar como "Eu", acesso "Qualquer pessoa".
 * Nunca sobrescreve dado existente de Pessoa: só preenche campos vazios.
 */
var WH_ORIGEM = 'Formulário de candidatura';
var WH_ATUALIZADO_POR = 'Site (candidatura)';
var WH_ORIGEM_LEAD = 'Site (contato)';
var WH_ETAPA_LEAD = 'Prospecção';
var WH_PAPEL_LEAD = { empresa: 'Contato comercial', profissional: 'Candidato' };

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!secret || d.secret !== secret) return whResp_({ ok: false, error: 'secret inválido' });
    if (d.tipo === 'lead') {
      if (!d.nome || !d.email || !d.empresa) return whResp_({ ok: false, error: 'nome, email e empresa são obrigatórios' });
      lock.waitLock(25000);
      return whResp_(registrarLead_(d));
    }
    if (!d.nome || !d.email) return whResp_({ ok: false, error: 'nome e email são obrigatórios' });
    lock.waitLock(25000);
    return whResp_(registrarCandidatura_(d));
  } catch (err) {
    return whResp_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function registrarCandidatura_(d) {
  var ss = SpreadsheetApp.getActive();
  var shP = ss.getSheetByName('Pessoas');
  var shC = ss.getSheetByName('Candidaturas');
  var hC = whHeaders_(shC);
  var externo = d.externalId != null ? String(d.externalId) : '';

  // 1) Duplicado: mesmo ID Externo já gravado
  if (externo) {
    var dadosC = whDados_(shC);
    for (var i = 0; i < dadosC.length; i++) {
      if (String(dadosC[i][hC['ID Externo']]) === externo) {
        return { ok: true, idCandidatura: dadosC[i][hC['ID Candidatura']], idPessoa: dadosC[i][hC['ID Pessoa']], pessoaNova: false, duplicado: true };
      }
    }
  }

  // 2) Vaga
  var vaga = { id: d.vagaId || '', titulo: d.vaga || '', cliente: d.cliente || '', link: '' };
  if (vaga.id) {
    var shV = ss.getSheetByName('Vagas'), hV = whHeaders_(shV), dadosV = whDados_(shV);
    for (var v = 0; v < dadosV.length; v++) {
      if (String(dadosV[v][hV['ID Vaga']]) === String(vaga.id)) {
        vaga.titulo = vaga.titulo || dadosV[v][hV['Vaga']];
        vaga.cliente = vaga.cliente || dadosV[v][hV['Empresa']];
        vaga.link = dadosV[v][hV['Link da planilha da vaga']] || '';
        break;
      }
    }
  }

  // 3) Pessoa (por e-mail, depois LinkedIn)
  var campos = {
    'Nome': d.nome, 'Empresa': d.empresaAtual, 'Cargo': d.cargoAtual, 'E-mail': String(d.email).trim().toLowerCase(),
    'Telefone': d.telefone ? normalizarTelefone_(d.telefone) : '',
    'LinkedIn': d.linkedin ? normalizarLinkedin_(d.linkedin) : '', 'Localização': d.localizacao,
    'Mobilidade': d.mobilidade, 'Formação': d.formacao, 'Experiência': d.experiencia,
    'Inglês': d.ingles, 'Outros idiomas': d.outrosIdiomas,
    'Pret. salarial (mín)': d.pretensaoMin, 'Pret. salarial (máx)': d.pretensaoMax,
    'Disponibilidade': d.disponibilidade, 'Link do CV': d.linkCv
  };
  var pessoa = whRegistrarPessoa_(shP, campos, 'Candidato', WH_ORIGEM, WH_ATUALIZADO_POR);

  // 4) Candidatura
  var agora = new Date();
  var dadosC2 = whDados_(shC);
  var idCand = whProximoId_(dadosC2, hC['ID Candidatura'], 'C', 5);
  var nc = new Array(shC.getLastColumn()).fill('');
  nc[hC['ID Candidatura']] = idCand;
  nc[hC['ID Pessoa']] = pessoa.idPessoa;
  nc[hC['Vaga']] = vaga.titulo;
  nc[hC['Cliente']] = vaga.cliente;
  nc[hC['Data']] = agora;
  nc[hC['Origem']] = WH_ORIGEM;
  nc[hC['Etapa']] = 'Inscrito';
  nc[hC['Link da planilha da vaga']] = vaga.link;
  nc[hC['ID Vaga']] = vaga.id;
  nc[hC['ID Externo']] = externo;
  nc[hC['Recebido em']] = agora;
  shC.getRange(whUltimaLinha_(shC, hC['ID Candidatura']) + 1, 1, 1, nc.length).setValues([nc]);

  return { ok: true, idCandidatura: idCand, idPessoa: pessoa.idPessoa, pessoaNova: pessoa.pessoaNova, duplicado: false };
}

function registrarLead_(d) {
  var ss = SpreadsheetApp.getActive();
  var shL = ss.getSheetByName('Leads'), hL = whHeaders_(shL);

  // 1) Pessoa (por e-mail, depois LinkedIn)
  var campos = {
    'Nome': whSeguro_(d.nome), 'Empresa': whSeguro_(d.empresa), 'Cargo': whSeguro_(d.cargo),
    'E-mail': String(d.email).trim().toLowerCase(),
    'Telefone': d.telefone ? normalizarTelefone_(d.telefone) : '',
    'LinkedIn': d.linkedin ? normalizarLinkedin_(d.linkedin) : ''
  };
  var pessoa = whRegistrarPessoa_(ss.getSheetByName('Pessoas'), campos, WH_PAPEL_LEAD[d.tipoContato] || '', WH_ORIGEM_LEAD, WH_ORIGEM_LEAD);

  // 2) Empresa já cadastrada com o mesmo nome (coluna A = ID, B = nome)
  var idEmpresa = '', alvo = whChave_(d.empresa), dadosE = whDados_(ss.getSheetByName('Empresas'));
  for (var i = 0; i < dadosE.length; i++) {
    if (whChave_(dadosE[i][1]) === alvo) { idEmpresa = dadosE[i][0]; break; }
  }

  // 3) Lead
  var contexto = [d.mensagem || 'Contato pelo formulário do site', d.perfil ? 'Sou: ' + d.perfil : ''].filter(String).join('\n\n');
  var obs = ['Pessoa ' + pessoa.idPessoa + (pessoa.pessoaNova ? ' (nova)' : ''), 'E-mail: ' + campos['E-mail']];
  if (campos['Telefone']) obs.push('Telefone: ' + campos['Telefone']);
  if (campos['LinkedIn']) obs.push('LinkedIn: ' + campos['LinkedIn']);
  var idLead = whProximoId_(whDados_(shL), hL['ID Lead'], 'L', 4);
  var valores = {
    'ID Lead': idLead, 'Empresa': campos['Empresa'], 'Contexto do lead': whSeguro_(contexto), 'ID Empresa': idEmpresa,
    'Contato': campos['Nome'], 'Cargo do contato': campos['Cargo'], 'Origem': WH_ORIGEM_LEAD, 'Etapa': WH_ETAPA_LEAD,
    'Atualizado em': new Date(), 'Observações': whSeguro_(obs.join(' | '))
  };
  var nl = new Array(shL.getLastColumn()).fill('');
  for (var k in valores) if (hL[k] != null) nl[hL[k]] = valores[k];
  shL.getRange(whUltimaLinha_(shL, hL['ID Lead']) + 1, 1, 1, nl.length).setValues([nl]);

  return { ok: true, idLead: idLead, idPessoa: pessoa.idPessoa, pessoaNova: pessoa.pessoaNova };
}

/** Acha a pessoa por e-mail (principal ou 2) e depois LinkedIn; cria se não existir ou só preenche campos vazios. */
function whRegistrarPessoa_(shP, campos, papel, origem, atualizadoPor) {
  var hP = whHeaders_(shP);
  var email = campos['E-mail'], linkedin = campos['LinkedIn'];
  var dadosP = whDados_(shP), linhaP = -1;
  for (var p = 0; p < dadosP.length && linhaP < 0; p++) {
    var r = dadosP[p];
    var e1 = String(r[hP['E-mail']]).trim().toLowerCase(), e2 = String(r[hP['E-mail 2']]).trim().toLowerCase();
    if (e1 === email || e2 === email) linhaP = p;
  }
  if (linhaP < 0 && linkedin) {
    for (var q = 0; q < dadosP.length; q++) {
      if (normalizarLinkedin_(dadosP[q][hP['LinkedIn']]) === linkedin) { linhaP = q; break; }
    }
  }

  var agora = new Date(), idPessoa, pessoaNova = linhaP < 0;
  if (pessoaNova) {
    idPessoa = whProximoId_(dadosP, hP['ID Pessoa'], 'P', 5);
    var nova = new Array(shP.getLastColumn()).fill('');
    nova[hP['ID Pessoa']] = idPessoa;
    for (var k in campos) if (hP[k] != null && whTem_(campos[k])) nova[hP[k]] = campos[k];
    if (papel) nova[hP['Papéis']] = papel;
    nova[hP['Origem']] = origem;
    if (hP['Status do contato'] != null) nova[hP['Status do contato']] = 'Novo';
    if (hP['Informação atualizada em'] != null) nova[hP['Informação atualizada em']] = agora;
    if (hP['Atualizado por'] != null) nova[hP['Atualizado por']] = atualizadoPor;
    var rowP = whUltimaLinha_(shP, hP['ID Pessoa']) + 1;
    shP.getRange(rowP, hP['Telefone'] + 1).setNumberFormat('@');
    shP.getRange(rowP, 1, 1, nova.length).setValues([nova]);
  } else {
    var linha = dadosP[linhaP], rowE = linhaP + 2, mudou = false;
    idPessoa = linha[hP['ID Pessoa']];
    for (var c in campos) {
      var col = hP[c];
      if (col == null || !whTem_(campos[c]) || whTem_(linha[col])) continue;
      if (c === 'E-mail') continue;
      if (c === 'Telefone') shP.getRange(rowE, col + 1).setNumberFormat('@');
      shP.getRange(rowE, col + 1).setValue(campos[c]);
      mudou = true;
    }
    if (papel) mudou = whAcrescentar_(shP, rowE, hP['Papéis'], linha[hP['Papéis']], papel) || mudou;
    mudou = whAcrescentar_(shP, rowE, hP['Origem'], linha[hP['Origem']], origem) || mudou;
    if (mudou) {
      if (hP['Informação atualizada em'] != null) shP.getRange(rowE, hP['Informação atualizada em'] + 1).setValue(agora);
      if (hP['Atualizado por'] != null) shP.getRange(rowE, hP['Atualizado por'] + 1).setValue(atualizadoPor);
    }
  }
  return { idPessoa: idPessoa, pessoaNova: pessoaNova };
}

function whResp_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function whHeaders_(sh) {
  var h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], m = {};
  for (var i = 0; i < h.length; i++) if (h[i] !== '' && m[h[i]] == null) m[String(h[i]).trim()] = i;
  return m;
}

function whDados_(sh) {
  var n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, sh.getLastColumn()).getValues() : [];
}

// Última linha com ID preenchido (evita pular para o fim por causa de fórmulas/validações)
function whUltimaLinha_(sh, colIdx) {
  var vals = sh.getRange(1, colIdx + 1, sh.getLastRow(), 1).getValues();
  for (var i = vals.length - 1; i >= 0; i--) if (vals[i][0] !== '') return i + 1;
  return 1;
}

function whProximoId_(dados, colIdx, prefixo, largura) {
  var max = 0;
  for (var i = 0; i < dados.length; i++) {
    var m = String(dados[i][colIdx]).match(/^[A-Z]+(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return prefixo + ('000000' + (max + 1)).slice(-largura);
}

function whTem_(v) { return v !== null && v !== undefined && String(v).trim() !== ''; }

function whChave_(v) { return String(v == null ? '' : v).trim().toLowerCase(); }

// Texto digitado no site não pode virar fórmula na planilha
function whSeguro_(v) {
  var t = String(v == null ? '' : v).trim();
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function whAcrescentar_(sh, row, colIdx, atual, valor) {
  if (colIdx == null) return false;
  var partes = String(atual || '').split(';').map(function (s) { return s.trim(); }).filter(String);
  if (partes.indexOf(valor) >= 0) return false;
  partes.push(valor);
  sh.getRange(row, colIdx + 1).setValue(partes.join('; '));
  return true;
}
