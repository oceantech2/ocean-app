/* WEBHOOK DO SITE (30/10/2026; leads em 06/11/2026; Job post e fim da aba Candidaturas em 13/11/2026)
 * Recebe do site (backend no Render) as candidaturas, gravadas só na aba Pessoas (Data de cadastro, Última candidatura)
 * e, se a vaga tem planilha (layout novo), numa linha "Job post" do Mapeamento; os contatos da landing ("tipo": "lead") vão para Pessoas e Leads.
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

var WH_STATUS_JOB_POST = 'Job post';

/**
 * Candidatura do site (a partir de 13/11/2026 não existe mais a aba Candidaturas; ela fica oculta, só como histórico):
 * 1) Pessoa: por e-mail e depois LinkedIn; só preenche campo vazio; pessoa nova recebe Data de cadastro.
 * 2) A linha da pessoa ganha "Última candidatura em" e "Última vaga candidatada".
 * 3) Se a vaga tem planilha no layout novo, entra uma linha com Status "Job post" no Mapeamento.
 * Pode ser repetida sem duplicar (o painel reenvia candidatura pendente).
 */
function registrarCandidatura_(d) {
  var ss = SpreadsheetApp.getActive();
  var shP = ss.getSheetByName('Pessoas');
  var hP = whHeaders_(shP);
  if (hP['Última candidatura em'] == null || hP['Última vaga candidatada'] == null) {
    throw new Error('A aba Pessoas está sem as colunas "Última candidatura em" e "Última vaga candidatada"');
  }

  // 1) Vaga (ID Vaga em Vagas: título, cliente e link da planilha)
  var vaga = { id: d.vagaId || '', titulo: d.vaga || '', cliente: d.cliente || '', link: '', achou: false };
  if (vaga.id) {
    var shV = ss.getSheetByName('Vagas'), hV = whHeaders_(shV), dadosV = whDados_(shV);
    for (var v = 0; v < dadosV.length; v++) {
      if (String(dadosV[v][hV['ID Vaga']]) === String(vaga.id)) {
        vaga.titulo = dadosV[v][hV['Vaga']] || vaga.titulo;
        vaga.cliente = dadosV[v][hV['Empresa']] || vaga.cliente;
        vaga.link = dadosV[v][hV['Link da planilha da vaga']] || '';
        vaga.achou = true;
        break;
      }
    }
  }

  // 2) Pessoa (por e-mail, depois LinkedIn)
  var anteriores = [[d.cargo2, d.empresa2], [d.cargo3, d.empresa3]]
    .filter(function (p) { return whTem_(p[0]); })
    .map(function (p) { return p[0] + ' - ' + p[1]; }).join('; ');
  var campos = {
    'Nome': d.nome, 'Empresa': d.empresaAtual, 'Cargo': d.cargoAtual, 'E-mail': String(d.email).trim().toLowerCase(),
    'Cargos anteriores': whSeguro_(anteriores), 'Idade': d.idade, 'Nacionalidade': whSeguro_(d.nacionalidade),
    'Telefone': d.telefone ? normalizarTelefone_(d.telefone) : '',
    'LinkedIn': d.linkedin ? normalizarLinkedin_(d.linkedin) : '', 'Localização': d.localizacao,
    'Mobilidade': d.mobilidade, 'Formação': d.formacao, 'Experiência': d.experiencia,
    'Inglês': d.ingles, 'Outros idiomas': d.outrosIdiomas,
    'Pret. salarial (mín)': whNumero_(d.pretensaoMin), 'Pret. salarial (máx)': whNumero_(d.pretensaoMax),
    'Disponibilidade': d.disponibilidade, 'Link do CV': d.linkCv
  };
  var pessoa = whRegistrarPessoa_(shP, campos, 'Candidato', WH_ORIGEM, WH_ATUALIZADO_POR);

  // 3) Última candidatura (data e vaga) na linha da pessoa
  var agora = new Date();
  var rotulo = (vaga.id ? vaga.id + ' - ' : '') + (vaga.titulo || 'vaga sem título');
  shP.getRange(pessoa.linha, hP['Última candidatura em'] + 1).setValue(agora);
  shP.getRange(pessoa.linha, hP['Última vaga candidatada'] + 1).setValue(rotulo);

  // 4) Linha "Job post" na planilha da vaga
  var jp = whJobPost_(vaga, pessoa, campos, agora, shP, hP, rotulo);

  return {
    ok: true,
    idCandidatura: '',
    idPessoa: pessoa.idPessoa,
    pessoaNova: pessoa.pessoaNova,
    duplicado: jp.duplicado === true,
    planilhaVaga: jp.gravado ? 'gravado' : jp.motivo,
    linhaPlanilhaVaga: jp.linha || null
  };
}

/** Acrescenta a linha do candidato (Status "Job post") ao Mapeamento da planilha da vaga (só layout novo). */
function whJobPost_(vaga, pessoa, campos, agora, shP, hP, rotulo) {
  var dataTxt = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  var chave = 'pelo site em ' + dataTxt;
  if (!vaga.id) return { gravado: false, motivo: 'vaga sem ID Vaga (sem planilha)' };
  if (!vaga.achou) return { gravado: false, motivo: 'ID Vaga ' + vaga.id + ' não encontrado na aba Vagas' };
  var idPlan = whIdPlanilha_(vaga.link);
  if (!idPlan) return { gravado: false, motivo: 'vaga sem link da planilha' };

  // Opt-out = Sim nunca entra em lista: fica só em Pessoas, com aviso nas Observações
  var optout = String(shP.getRange(pessoa.linha, hP['Opt-out'] + 1).getValue()).trim().toLowerCase();
  if (optout === 'sim') {
    if (hP['Observações'] != null) {
      whAnotar_(shP.getRange(pessoa.linha, hP['Observações'] + 1), chave,
        'Candidatou-se ' + chave + ' à vaga ' + rotulo + ' (Opt-out = Sim: não entrou na planilha da vaga)');
    }
    return { gravado: false, motivo: 'opt-out: pessoa fica só em Pessoas' };
  }

  var plan, sh;
  try {
    plan = SpreadsheetApp.openById(idPlan);
  } catch (err) {
    throw new Error('Pessoa gravada na Base, mas não consegui abrir a planilha da vaga: ' + (err && err.message || err));
  }
  sh = plan.getSheetByName('Mapeamento');
  if (!sh) return { gravado: false, motivo: 'planilha da vaga sem aba Mapeamento' };
  if (String(sh.getRange(1, 1).getValue()).trim() !== 'Consultor') {
    return { gravado: false, motivo: 'planilha da vaga no layout antigo: Job post só no layout novo' };
  }
  var hM = whHeaders_(sh), obrig = ['Status', 'Nome', 'Observações', 'ID Pessoa'];
  for (var o = 0; o < obrig.length; o++) {
    if (hM[obrig[o]] == null) return { gravado: false, motivo: 'Mapeamento sem a coluna ' + obrig[o] };
  }

  // Já está na vaga? (mesmo ID Pessoa, e-mail ou LinkedIn): não duplica, só anota
  var nLin = sh.getLastRow() - 1;
  var vals = nLin > 0 ? sh.getRange(2, 1, nLin, sh.getLastColumn()).getValues() : [];
  var email = campos['E-mail'], linkedin = campos['LinkedIn'] ? normalizarLinkedin_(campos['LinkedIn']) : '';
  for (var r = 0; r < vals.length; r++) {
    var lm = vals[r];
    var mesmoId = String(lm[hM['ID Pessoa']]).trim() === String(pessoa.idPessoa);
    var mesmoEmail = hM['Email'] != null && email && String(lm[hM['Email']]).trim().toLowerCase() === email;
    var mesmoLi = hM['LinkedIn (URL)'] != null && linkedin && normalizarLinkedin_(lm[hM['LinkedIn (URL)']]) === linkedin;
    if (mesmoId || mesmoEmail || mesmoLi) {
      whAnotar_(sh.getRange(r + 2, hM['Observações'] + 1), chave, 'Candidatou-se também ' + chave);
      return { gravado: false, duplicado: true, linha: r + 2, motivo: 'pessoa já estava na planilha da vaga' };
    }
  }

  // Linha nova no fim das linhas preenchidas (Job post é o último Status, então já nasce na ordem certa)
  var linhaNova = whUltimaLinha_(sh, hM['Nome']) + 1;
  var cel = function (nome) { return hM[nome] == null ? null : sh.getRange(linhaNova, hM[nome] + 1); };
  var por = function (nome, v) { var c = cel(nome); if (c && whTem_(v)) c.setValue(v); };
  por('Nome', campos['Nome']);
  por('ID Pessoa', pessoa.idPessoa);
  por('Status', WH_STATUS_JOB_POST);
  por('Observações', 'Job post: candidatou-se ' + chave);
  var cTel = cel('Telefone');
  if (cTel && whTem_(campos['Telefone'])) { cTel.setNumberFormat('@'); cTel.setValue(campos['Telefone']); }
  por('Email', campos['E-mail']);
  por('Cargo', campos['Cargo']);
  por('Empresa', campos['Empresa']);
  por('Experiência', campos['Experiência']);
  por('Pretensão salarial (mínima)', whNumero_(campos['Pret. salarial (mín)']));
  por('Pretensão salarial', whNumero_(campos['Pret. salarial (máx)']));
  por('Localização', campos['Localização']);
  por('Inglês', campos['Inglês']);
  por('Outros idiomas', campos['Outros idiomas']);
  por('Idade', campos['Idade']);
  por('Formação', campos['Formação']);
  por('Mobilidade', campos['Mobilidade']);
  por('Disponibilidade de início', campos['Disponibilidade']);
  whLink_(cel('LinkedIn (URL)'), campos['LinkedIn']);
  whLink_(cel('CV (Link)'), campos['Link do CV']);
  return { gravado: true, linha: linhaNova };
}

function whIdPlanilha_(link) {
  var m = String(link || '').match(/\/d\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : '';
}

/** Acrescenta a nota ao fim da célula, uma vez só (chave evita repetir no reenvio). */
function whAnotar_(cel, chave, nota) {
  var atual = String(cel.getValue() || '');
  if (atual.indexOf(chave) >= 0) return false;
  cel.setValue(atual ? atual + ' | ' + nota : nota);
  return true;
}

function whNumero_(v) {
  if (typeof v === 'string' && /^\d+([.,]\d+)?$/.test(v.trim())) return parseFloat(v.trim().replace(',', '.'));
  return v;
}

/** URL como link clicável (regra do LinkedIn clicável); texto que não é URL vai como está. */
function whLink_(cel, url) {
  if (!cel || !whTem_(url)) return;
  var u = String(url).trim();
  if (!/^https?:\/\//i.test(u)) { cel.setValue(u); return; }
  cel.setRichTextValue(SpreadsheetApp.newRichTextValue().setText(u).setLinkUrl(u).build());
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

/** Acha a pessoa por e-mail (principal ou 2) e depois LinkedIn; cria se não existir ou só preenche campos vazios.
 *  Pessoa nova recebe Data de cadastro (coluna criada em 13/11/2026). Devolve idPessoa, pessoaNova e a linha da pessoa na aba. */
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

  var agora = new Date(), idPessoa, pessoaNova = linhaP < 0, linhaPlanilha = 0;
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
    if (hP['Data de cadastro'] != null) nova[hP['Data de cadastro']] = agora;
    var rowP = whUltimaLinha_(shP, hP['ID Pessoa']) + 1;
    shP.getRange(rowP, hP['Telefone'] + 1).setNumberFormat('@');
    shP.getRange(rowP, 1, 1, nova.length).setValues([nova]);
    linhaPlanilha = rowP;
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
    linhaPlanilha = rowE;
  }
  return { idPessoa: idPessoa, pessoaNova: pessoaNova, linha: linhaPlanilha };
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