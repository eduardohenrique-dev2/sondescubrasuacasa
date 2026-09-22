/* =========================================================
   APP.JS — Descubra sua Casa | SON
   Lógica das telas, do quiz, da revelação e do resultado.
   Conteúdo em quiz-data.js · links em config.js

   NOVIDADES DESTA VERSÃO
   - getRandomQuestions() sorteia 12 perguntas do banco de 40
     (quiz-data.js -> QUESTION_POOL), garantindo uma de cada
     categoria + duas confirmações cruzadas, mantendo perguntas
     equivalentes afastadas e embaralhando todas as alternativas.
     O conjunto é montado no clique de "Descobrir minha Casa".
   - registerAttempt()/saveAttempt()/loadAttempts() controlam,
     via localStorage, quantas vezes o teste foi feito neste
     dispositivo e mantêm um histórico das últimas 10 tentativas.
   - Nada disso usa backend: é tudo local ao navegador.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- helpers gerais ---------- */
  const $ = (id) => document.getElementById(id);
  const HOUSE_KEYS = Object.keys(HOUSES);
  const STORE_KEY = "son_casas_v2";
  const ATTEMPTS_KEY = "son_casas_attempts_v1";
  const QUESTIONS_PER_ATTEMPT = 12;
  const CROSS_CHECKS_PER_ATTEMPT = 2;
  const MAX_HISTORY = 10;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = {
    screens: {
      landing: $("screen-landing"),
      quiz: $("screen-quiz"),
      loading: $("screen-loading"),
      result: $("screen-result")
    },
    landingShields: $("landing-shields"),
    quizShields: $("quiz-shields"),
    loadingShields: $("loading-shields"),
    beam: $("loading-beam"),
    loadingStage: $("loading-stage"),
    loadingTag: $("loading-tag"),
    progressFill: $("progress-fill"),
    progressTrack: $("progress-track"),
    progressMessage: $("progress-message"),
    qCurrent: $("q-current"),
    qTotal: $("q-total"),
    question: $("question-text"),
    options: $("options-wrap"),
    toast: $("toast"),
    notice: $("returning-notice"),
    noticeText: $("notice-text"),
    noticeClose: $("notice-close"),
    floatingJoin: $("floating-join"),
    floatingJoinShield: $("floating-join-shield"),
    floatingJoinTitle: $("floating-join-title"),
    floatingJoinSubtitle: $("floating-join-subtitle"),
    floatingJoinBtn: $("floating-join-btn"),
    floatingJoinBtnLabel: $("floating-join-btn-label"),
    floatingJoinClose: $("floating-join-close")
  };

  // "questions" guarda o conjunto sorteado e embaralhado desta
  // tentativa (perguntas + ordem das alternativas). É montado uma
  // única vez, no início do teste (ver btn-start em init()).
  const state = { index: 0, answers: [], questions: [] };

  // CTA flutuante do resultado — referências globais ao(s) timer(s)
  // para evitar duplicação caso renderResult() rode mais de uma vez.
  const FLOATING_JOIN_MS = 60000;
  let floatingJoinTimer = null;
  let floatingJoinHideTimer = null;

  /* ---------- escudos ---------- */
  function shieldMarkup(key) {
    const h = HOUSES[key];
    return `<img src="${h.image}" alt="Escudo da ${h.name}" width="240" height="320" loading="lazy" decoding="async">`;
  }

  function paintShieldRows() {
    const row = HOUSE_KEYS.map((k) => `<li data-house="${k}">${shieldMarkup(k)}</li>`).join("");
    el.landingShields.innerHTML = row;
    el.quizShields.innerHTML = row;
    el.loadingShields.innerHTML = row;
  }

  /* ---------- navegação entre telas ---------- */
  function show(name) {
    Object.values(el.screens).forEach((s) => s.classList.remove("active", "leaving"));
    el.screens[name].classList.add("active");
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  function toast(msg, ms) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => el.toast.classList.remove("show"), ms || 2600);
  }

  const wait = (ms) => new Promise((r) => window.setTimeout(r, reduce ? Math.min(ms, 120) : ms));

  /* =========================================================
     BANCO DE PERGUNTAS & ALEATORIZAÇÃO
     Centralizado aqui para manter a lógica de sorteio isolada
     do conteúdo (quiz-data.js) e da renderização das telas.
     ========================================================= */

  // Fisher-Yates — embaralha sem alterar o array original.
  function shuffleArray(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function getQuestionPool() {
    return QUESTION_POOL;
  }

  // Verifica se as perguntas de confirmação da mesma categoria
  // ficaram suficientemente afastadas no percurso.
  function categoriesAreWellSpaced(list, minGap) {
    const positions = {};
    list.forEach((q, index) => {
      if (!positions[q.category]) positions[q.category] = [];
      positions[q.category].push(index);
    });

    return Object.values(positions).every((indexes) => {
      if (indexes.length < 2) return true;
      for (let i = 1; i < indexes.length; i += 1) {
        if (indexes[i] - indexes[i - 1] < minGap) return false;
      }
      return true;
    });
  }

  // Embaralha tentando manter perguntas da mesma categoria afastadas.
  // Isso evita que a pessoa perceba que duas perguntas estão confirmando
  // o mesmo traço por ângulos diferentes.
  function spreadCrossChecks(list) {
    let best = shuffleArray(list);
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const candidate = shuffleArray(list);
      if (categoriesAreWellSpaced(candidate, 4)) return candidate;
      if (categoriesAreWellSpaced(candidate, 3)) best = candidate;
    }
    return best;
  }

  // Mantém 12 perguntas:
  // - 1 pergunta de cada uma das 10 categorias;
  // - 2 perguntas extras em duas categorias sorteadas, funcionando
  //   como confirmação cruzada do padrão de resposta.
  function getRandomQuestions(count) {
    const pool = getQuestionPool();

    const byCategory = {};
    CATEGORIES.forEach((category) => { byCategory[category] = []; });
    pool.forEach((q) => {
      if (byCategory[q.category]) byCategory[q.category].push(q);
    });

    const picked = [];
    const pickedSet = new Set();

    // Base: uma pergunta de cada categoria.
    CATEGORIES.forEach((category) => {
      const options = byCategory[category] || [];
      if (!options.length) return;
      const choice = options[Math.floor(Math.random() * options.length)];
      picked.push(choice);
      pickedSet.add(choice);
    });

    // Confirmação cruzada: escolhe duas categorias com pelo menos
    // uma segunda pergunta disponível.
    let extrasNeeded = Math.max(0, count - picked.length);
    const crossCheckCategories = shuffleArray(
      CATEGORIES.filter((category) =>
        (byCategory[category] || []).some((q) => !pickedSet.has(q))
      )
    ).slice(0, Math.min(CROSS_CHECKS_PER_ATTEMPT, extrasNeeded));

    crossCheckCategories.forEach((category) => {
      const alternatives = (byCategory[category] || []).filter((q) => !pickedSet.has(q));
      if (!alternatives.length) return;
      const choice = alternatives[Math.floor(Math.random() * alternatives.length)];
      picked.push(choice);
      pickedSet.add(choice);
      extrasNeeded -= 1;
    });

    // Segurança para futuras mudanças no número de perguntas.
    if (extrasNeeded > 0) {
      const remaining = shuffleArray(pool.filter((q) => !pickedSet.has(q)));
      for (let i = 0; i < remaining.length && extrasNeeded > 0; i += 1) {
        picked.push(remaining[i]);
        pickedSet.add(remaining[i]);
        extrasNeeded -= 1;
      }
    }

    return spreadCrossChecks(picked)
      .slice(0, count)
      .map((q) => ({
        text: q.text,
        category: q.category,
        options: shuffleArray(q.options)
      }));
  }

  /* =========================================================
     CONTROLE DE TENTATIVAS (localStorage)
     Não impede novas tentativas — apenas registra e informa.
     ========================================================= */

  function loadAttempts() {
    try {
      const raw = window.localStorage.getItem(ATTEMPTS_KEY);
      if (!raw) return { count: 0, history: [] };
      const parsed = JSON.parse(raw);
      return {
        count: typeof parsed.count === "number" ? parsed.count : 0,
        history: Array.isArray(parsed.history) ? parsed.history : []
      };
    } catch (_) {
      return { count: 0, history: [] };
    }
  }

  function saveAttempt(entry) {
    const data = loadAttempts();
    data.count += 1;
    data.history.push(entry);
    if (data.history.length > MAX_HISTORY) {
      data.history = data.history.slice(data.history.length - MAX_HISTORY);
    }
    try {
      window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
    } catch (_) { /* modo privado / localStorage indisponível */ }
    return data.count;
  }

  function registerAttempt(result) {
    const now = new Date();
    const entry = {
      date: now.toLocaleDateString("pt-BR"),
      time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      house: HOUSES[result.winner].name,
      compat: result.compat,
      name: state.userName || null
    };
    const count = saveAttempt(entry);
    console.log("Tentativa nº " + count);
    return count;
  }

  function showReturningNotice() {
    el.noticeText.textContent =
      "Percebemos que este dispositivo já realizou o teste anteriormente. Recomendamos considerar o primeiro resultado, pois ele representa melhor o seu perfil.";
    el.notice.classList.add("show");
    window.clearTimeout(showReturningNotice._t);
    showReturningNotice._t = window.setTimeout(hideReturningNotice, 9000);
  }

  function hideReturningNotice() {
    el.notice.classList.remove("show");
    window.clearTimeout(showReturningNotice._t);
  }

  function warnIfReturningUser() {
    const attempts = loadAttempts();
    if (attempts.count > 0) {
      window.setTimeout(showReturningNotice, 900);
    }
  }

  /* ---------- quiz ---------- */
  function progressText(ratio) {
    const found = PROGRESS_MESSAGES.find((m) => ratio < m.until);
    return found ? found.text : "";
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    const total = state.questions.length;
    const ratio = state.index / total;

    el.qTotal.textContent = String(total);
    el.qCurrent.textContent = String(state.index + 1);
    el.progressFill.style.width = (ratio * 100).toFixed(1) + "%";
    el.progressTrack.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    el.progressMessage.textContent = progressText(ratio);

    // brilho progressivo nos escudos conforme a jornada avança
    const lit = Math.round(ratio * HOUSE_KEYS.length);
    Array.from(el.quizShields.children).forEach((li, i) => {
      li.classList.toggle("lit", i < lit);
    });

    el.question.textContent = q.text;
    el.question.classList.remove("q-enter");
    void el.question.offsetWidth;
    el.question.classList.add("q-enter");

    el.options.innerHTML = q.options
      .map(
        (o, i) =>
          `<button type="button" class="option" role="radio" aria-checked="false" data-i="${i}" style="--d:${0.06 * i}s">${o.text}</button>`
      )
      .join("");
    Array.from(el.options.children).forEach((b, i) => {
      b.classList.add("reveal");
      b.addEventListener("click", () => choose(i));
    });

    $("btn-back").disabled = false;
  }

  async function choose(optionIndex) {
    const buttons = Array.from(el.options.children);
    buttons.forEach((b, i) => {
      b.disabled = true;
      b.classList.add(i === optionIndex ? "selected" : "dimmed");
      if (i === optionIndex) b.setAttribute("aria-checked", "true");
    });

    state.answers[state.index] = optionIndex;
    save();

    await wait(360);
    el.options.classList.add("q-exit");
    await wait(160);
    el.options.classList.remove("q-exit");

    if (state.index < state.questions.length - 1) {
      state.index += 1;
      renderQuestion();
    } else {
      el.progressFill.style.width = "100%";
      runReveal();
    }
  }

  function goBack() {
    if (state.index === 0) {
      show("landing");
      return;
    }
    state.index -= 1;
    renderQuestion();
  }

  /* ---------- cálculo ---------- */
  function normalizedWeightEntries(weights) {
    const entries = Object.entries(weights).filter(([, value]) => Number(value) > 0);
    const total = entries.reduce((sum, [, value]) => sum + Number(value), 0) || 1;
    return entries.map(([trait, value]) => [trait, Number(value) / total]);
  }

  function userVector() {
    const v = {};
    TRAITS.forEach((t) => (v[t] = 0));

    state.answers.forEach((optIndex, qIndex) => {
      const q = state.questions[qIndex];
      const opt = q && q.options[optIndex];
      if (!opt) return;

      // Cada resposta soma exatamente 1 ponto no total.
      // Assim, nenhuma alternativa vale mais só por possuir mais
      // pesos escritos no banco.
      normalizedWeightEntries(opt.weights).forEach(([trait, weight]) => {
        if (trait in v) v[trait] += weight;
      });
    });

    return v;
  }

  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    TRAITS.forEach((t) => {
      const x = a[t] || 0, y = b[t] || 0;
      dot += x * y; na += x * x; nb += y * y;
    });
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  function optionVector(option) {
    const vector = {};
    TRAITS.forEach((t) => (vector[t] = 0));
    if (!option) return vector;
    normalizedWeightEntries(option.weights).forEach(([trait, weight]) => {
      if (trait in vector) vector[trait] = weight;
    });
    return vector;
  }

  function crossCheckConsistency() {
    const byCategory = {};

    state.questions.forEach((question, index) => {
      const answerIndex = state.answers[index];
      const option = question && question.options[answerIndex];
      if (!option) return;
      if (!byCategory[question.category]) byCategory[question.category] = [];
      byCategory[question.category].push(optionVector(option));
    });

    const similarities = [];
    Object.values(byCategory).forEach((vectors) => {
      if (vectors.length < 2) return;
      for (let i = 1; i < vectors.length; i += 1) {
        similarities.push(cosine(vectors[i - 1], vectors[i]));
      }
    });

    if (!similarities.length) return 0.5;
    return similarities.reduce((sum, value) => sum + value, 0) / similarities.length;
  }

  function calculateCompatibility(scores, consistency) {
    const best = scores[0] ? scores[0].score : 0;
    const second = scores[1] ? scores[1].score : 0;

    // 1) Força do encaixe: converte a similaridade de cosseno em
    //    proximidade angular e suaviza a escala para leitura humana.
    const boundedBest = Math.max(0, Math.min(1, best));
    const angularFit = 1 - (Math.acos(boundedBest) / (Math.PI / 2));
    const profileStrength = Math.sqrt(Math.max(0, angularFit));

    // 2) Separação: mede quanto a Casa vencedora realmente se
    //    destacou da segunda colocada. Com 6 pontos percentuais de
    //    diferença ou mais, considera separação máxima.
    const separation = Math.max(0, Math.min(1, (best - second) / 0.06));

    // 3) Consistência: usa as duas perguntas de confirmação cruzada
    //    como um ajuste pequeno, sem permitir que elas dominem o teste.
    const reliability = Math.max(0, Math.min(1, consistency));

    const raw = (profileStrength * 0.82) + (separation * 0.12) + (reliability * 0.06);
    return Math.round(Math.max(60, Math.min(98, raw * 100)));
  }

  function computeResult() {
    const v = userVector();

    const scores = HOUSE_KEYS.map((k) => ({
      key: k,
      score: cosine(v, HOUSE_PROFILES[k])
    })).sort((a, b) => b.score - a.score);

    const consistency = crossCheckConsistency();
    const compat = calculateCompatibility(scores, consistency);

    const best = scores[0] ? scores[0].score : 0;
    const second = scores[1] ? scores[1].score : 0;
    const gapPoints = Math.max(0, (best - second) * 100);

    // Confiança combina separação entre as Casas e coerência das
    // respostas de confirmação. Não altera a Casa vencedora.
    const confidenceScore =
      (Math.max(0, Math.min(1, gapPoints / 5)) * 0.72) +
      (consistency * 0.28);

    const confidence = {
      gap: Math.round(gapPoints * 10) / 10,
      consistency: Math.round(consistency * 100),
      label: confidenceScore >= 0.72 ? "Alta" : confidenceScore >= 0.48 ? "Boa" : "Equilibrada",
      runnerUp: scores[1] ? HOUSES[scores[1].key].name : "",
      runnerUpKey: scores[1] ? scores[1].key : "",
      isClose: gapPoints < 3.2
    };

    return {
      vector: v,
      winner: scores[0].key,
      compat,
      consistency,
      confidence,
      ranking: scores
    };
  }

  /* ---------- revelação cinematográfica ---------- */
  async function runReveal() {
    const result = computeResult();
    show("loading");

    const items = Array.from(el.loadingShields.children);
    items.forEach((li) => li.classList.remove("dim", "winner"));
    el.loadingStage.classList.remove("on");
    el.beam.classList.remove("on");

    await wait(200);
    el.loadingStage.classList.add("on");

    for (const message of LOADING_SEQUENCE) {
      el.loadingTag.textContent = message;
      el.loadingTag.classList.add("on");
      await wait(1000);
      el.loadingTag.classList.remove("on");
      await wait(260);
    }

    // feixe de luz percorrendo os escudos
    el.loadingTag.textContent = "Sua Casa foi revelada";
    el.loadingTag.classList.add("on");
    el.beam.classList.add("on");
    await wait(1500);

    // revelação: apaga as outras, acende a vencedora
    items.forEach((li) => {
      if (li.dataset.house === result.winner) li.classList.add("winner");
      else li.classList.add("dim");
    });
    await wait(1500);

    renderResult(result);
  }

  /* ---------- resultado ---------- */
  const HOUSE_GLOW = {
    aguia: "rgba(59, 105, 220, 0.42)",
    arvore: "rgba(63, 168, 82, 0.42)",
    grao: "rgba(200, 72, 60, 0.4)",
    cruz: "rgba(140, 92, 226, 0.42)"
  };

  function stars(value, max) {
    const filled = Math.max(1, Math.round((value / max) * 5));
    return (
      '<span class="stars" aria-hidden="true">' +
      "\u2605".repeat(filled) +
      '<span class="off">' + "\u2605".repeat(5 - filled) + "</span></span>"
    );
  }

  /* CTA flutuante temporário: reutiliza escudo/nome/link já
     calculados pelo resultado — não duplica lógica de negócio,
     não hardcoda URLs. Some sozinho após 60s ou ao ser fechado. */
  function clearFloatingJoinTimers() {
    if (floatingJoinTimer) { window.clearTimeout(floatingJoinTimer); floatingJoinTimer = null; }
    if (floatingJoinHideTimer) { window.clearTimeout(floatingJoinHideTimer); floatingJoinHideTimer = null; }
  }

  function hideFloatingJoin() {
    if (floatingJoinTimer) { window.clearTimeout(floatingJoinTimer); floatingJoinTimer = null; }
    if (!el.floatingJoin || el.floatingJoin.hidden) return;
    el.floatingJoin.classList.remove("visible");
    floatingJoinHideTimer = window.setTimeout(() => {
      el.floatingJoin.hidden = true;
      floatingJoinHideTimer = null;
    }, reduce ? 60 : 650);
  }

  function showFloatingJoin(house, href) {
    if (!el.floatingJoin) return;

    // evita CTAs/timers duplicados se o resultado for renderizado de novo
    clearFloatingJoinTimers();
    el.floatingJoin.classList.remove("visible");
    el.floatingJoin.hidden = false;

    el.floatingJoinShield.src = house.image;
    el.floatingJoinShield.alt = "Escudo da " + house.name;
    el.floatingJoinTitle.textContent = "Sua Casa é " + house.name + ".";
    el.floatingJoinSubtitle.textContent = "Entre agora na sua Casa.";
    el.floatingJoinBtnLabel.textContent = "Entrar na " + house.name;
    el.floatingJoinBtn.href = href;
    el.floatingJoinBtn.setAttribute("aria-label", "Entrar na " + house.name);

    // força reflow para garantir que a transição de entrada rode
    // mesmo quando o elemento acabou de sair de [hidden]
    void el.floatingJoin.offsetWidth;
    el.floatingJoin.classList.add("visible");

    floatingJoinTimer = window.setTimeout(hideFloatingJoin, FLOATING_JOIN_MS);
  }

  function naturalJoin(items) {
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + " e " + items[1];
    return items.slice(0, -1).join(", ") + " e " + items[items.length - 1];
  }

  function personalizedWhyFit(house, topTraits) {
    const main = topTraits.slice(0, 3);
    const names = main.map(([trait]) => TRAIT_LABELS[trait].name.toLowerCase());
    const behaviors = main
      .map(([trait]) => TRAIT_LABELS[trait].result)
      .filter(Boolean);

    let text =
      "Ao longo das suas respostas, apareceram com mais força " +
      naturalJoin(names) + ". ";

    if (behaviors.length) {
      text +=
        "Isso indica uma tendência a " +
        naturalJoin(behaviors) + ". ";
    }

    return text +
      "É a combinação desses traços, e não uma resposta isolada, que aproxima seu perfil da " +
      house.name + ".";
  }

  function renderResult(result) {
    const house = HOUSES[result.winner];

    // registra a tentativa (data/hora/casa/compatibilidade) e
    // mostra no console a contagem, antes de exibir a tela.
    registerAttempt(result);

    $("result-image").src = house.image;
    $("result-image").alt = "Escudo da " + house.name;
    $("result-shield-wrap").style.setProperty("--house-glow", HOUSE_GLOW[result.winner]);

    $("result-name").textContent = house.name.toUpperCase();
    $("result-tagline").textContent = house.tagline;
    $("result-verse").textContent = house.verse;
    $("result-verse-ref").textContent = house.verseRef;
    $("result-desc").textContent = house.description;

    $("result-live-list").innerHTML = house.whatYouWillLive
      .map((t) => `<li>${t}</li>`)
      .join("");

    // Perfil: cinco características mais fortes, em estrelas.
    const entries = Object.entries(result.vector).sort((a, b) => b[1] - a[1]);
    const max = entries[0][1] || 1;
    const top = entries.slice(0, 5);
    const topThree = top.slice(0, 3);

    $("result-profile-list").innerHTML = top
      .map(
        ([t, v]) =>
          `<li><span>${TRAIT_LABELS[t].name}</span>${stars(v, max)}</li>`
      )
      .join("");

    $("result-profile-summary").textContent =
      "Os traços que mais apareceram nas suas respostas foram " +
      naturalJoin(topThree.map(([t]) => TRAIT_LABELS[t].name.toLowerCase())) +
      ".";

    // A explicação deixa de ser totalmente fixa por Casa e passa
    // a usar o perfil realmente construído pelas 12 respostas.
    $("result-whyfit").textContent = personalizedWhyFit(house, top);

    $("compat-value").textContent = result.compat + "%";
    $("compat-track").setAttribute("aria-valuenow", String(result.compat));

    if (result.confidence.runnerUp && result.confidence.isClose) {
      $("compat-note").textContent =
        "Seu perfil também ficou próximo da " +
        result.confidence.runnerUp +
        ". A diferença entre as duas Casas foi pequena (" +
        result.confidence.gap +
        " p.p.).";
    } else {
      $("compat-note").textContent =
        "Definição do resultado: " +
        result.confidence.label +
        " · consistência das respostas: " +
        result.confidence.consistency +
        "%.";
    }

    // botão dinâmico de WhatsApp
    const label = $("btn-join-label");
    label.textContent = "Entrar na " + house.name;
    $("btn-join-shield").src = house.image;
    $("btn-join").href = joinLink(house, result.compat);

    // CTA flutuante reaproveita exatamente o mesmo link já resolvido
    // acima para o botão original — sem recalcular nem hardcodar nada.
    showFloatingJoin(house, $("btn-join").href);

    show("result");
    window.setTimeout(() => {
      $("compat-fill").style.width = result.compat + "%";
    }, 320);

    save({ winner: result.winner, compat: result.compat });
  }

  /* Mensagem montada a partir do template em config.js.
     Sempre passa por encodeURIComponent, senão emojis e quebras
     de linha corrompem o link em parte dos navegadores. */
  function joinMessage(house, compat) {
    const template =
      (typeof WHATSAPP_TEMPLATE !== "undefined" && WHATSAPP_TEMPLATE) ||
      "Olá! Minha Casa no SON é a {{NOME_DA_CASA}} ({{PERCENTUAL}}%).";
    return template
      .replace(/\{\{NOME_DA_CASA\}\}/g, house.name)
      .replace(/\{\{PERCENTUAL\}\}/g, String(compat));
  }

  /* Cada Casa pode ter link de grupo próprio; sem link, cai no
     contato responsável (por Casa, se houver) com a mensagem pronta. */
  function joinLink(house, compat) {
    const key = Object.keys(HOUSES).find((k) => HOUSES[k] === house);
    const direct = (typeof HOUSE_LINKS !== "undefined" && HOUSE_LINKS[key]) || "";
    if (direct) return direct;
    const perHouse = (typeof HOUSE_PHONES !== "undefined" && HOUSE_PHONES[key]) || "";
    const phone = perHouse || ((typeof CONTACT_PHONE !== "undefined" && CONTACT_PHONE) || "");
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(joinMessage(house, compat));
  }

  async function share() {
    const name = $("result-name").textContent;
    const text = "Descobri minha Casa no SON: " + name + ". Descubra a sua!";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Descubra sua Casa | SON", text, url: location.href });
        return;
      }
      await navigator.clipboard.writeText(text + " " + location.href);
      toast("Link copiado para compartilhar");
    } catch (_) {
      toast("Não foi possível compartilhar agora");
    }
  }

  /* ---------- persistência do progresso em curso ---------- */
  function save(extra) {
    try {
      window.localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ index: state.index, answers: state.answers, ...(extra || {}) })
      );
    } catch (_) { /* modo privado */ }
  }

  function clear() {
    try { window.localStorage.removeItem(STORE_KEY); } catch (_) { /* noop */ }
  }

  /* ---------- partículas douradas ---------- */
  function initParticles() {
    const canvas = $("particles");
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dots = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      const count = window.innerWidth < 640 ? 34 : 60;
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.5 + 0.4) * dpr,
        vy: (Math.random() * 0.22 + 0.05) * dpr,
        vx: (Math.random() - 0.5) * 0.12 * dpr,
        a: Math.random() * 0.4 + 0.12,
        p: Math.random() * Math.PI * 2
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        d.y -= d.vy;
        d.x += d.vx;
        d.p += 0.02;
        if (d.y < -8) { d.y = h + 8; d.x = Math.random() * w; }
        if (d.x < -8) d.x = w + 8;
        if (d.x > w + 8) d.x = -8;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212, 175, 55, " + (d.a * (0.6 + 0.4 * Math.sin(d.p))).toFixed(3) + ")";
        ctx.fill();
      });
      window.requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.requestAnimationFrame(frame);
  }

  /* ---------- ripple (transform/opacity apenas) ---------- */
  function initRipple() {
    document.addEventListener("pointerdown", (ev) => {
      const target = ev.target.closest(".btn, .option");
      if (!target || target.disabled || reduce) return;
      const rect = target.getBoundingClientRect();
      const ink = document.createElement("span");
      ink.className = "ripple";
      const size = Math.max(rect.width, rect.height);
      ink.style.width = ink.style.height = size + "px";
      ink.style.left = ev.clientX - rect.left - size / 2 + "px";
      ink.style.top = ev.clientY - rect.top - size / 2 + "px";
      target.appendChild(ink);
      window.setTimeout(() => ink.remove(), 620);
    }, { passive: true });
  }

  /* ---------- parallax de entrada da landing ---------- */
  function initParallax() {
    if (reduce) return;
    const crest = document.querySelector(".crest-wrap");
    if (!crest) return;
    window.addEventListener("pointermove", (ev) => {
      if (!el.screens.landing.classList.contains("active")) return;
      const dx = (ev.clientX / window.innerWidth - 0.5) * 12;
      const dy = (ev.clientY / window.innerHeight - 0.5) * 8;
      crest.style.setProperty("--px", dx.toFixed(2) + "px");
      crest.style.setProperty("--py", dy.toFixed(2) + "px");
    }, { passive: true });
  }

  /* ---------- init ---------- */
  function init() {
    paintShieldRows();
    el.qTotal.textContent = String(QUESTIONS_PER_ATTEMPT);

    $("btn-start").addEventListener("click", () => {
      // sorteio acontece uma única vez, aqui, no início do teste
      state.questions = getRandomQuestions(QUESTIONS_PER_ATTEMPT);
      state.index = 0;
      state.answers = [];
      el.qTotal.textContent = String(state.questions.length);

      show("quiz");
      renderQuestion();
      window.setTimeout(() => {
        const first = el.options.querySelector(".option");
        if (first) first.focus();
      }, 240);
    });
    $("btn-back").addEventListener("click", goBack);
    $("btn-share").addEventListener("click", share);
    el.noticeClose.addEventListener("click", hideReturningNotice);
    if (el.floatingJoinClose) el.floatingJoinClose.addEventListener("click", hideFloatingJoin);

    // navegação por teclado no radiogroup das alternativas
    el.options.addEventListener("keydown", (ev) => {
      const items = Array.from(el.options.querySelectorAll(".option:not(:disabled)"));
      if (!items.length) return;
      const at = items.indexOf(document.activeElement);
      let next = -1;
      if (ev.key === "ArrowDown" || ev.key === "ArrowRight") next = (at + 1) % items.length;
      if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") next = (at - 1 + items.length) % items.length;
      if (next < 0) return;
      ev.preventDefault();
      items[next].focus();
    });

    initParticles();
    initRipple();
    initParallax();

    // avisa discretamente, sem bloquear, se este dispositivo já
    // tiver feito o teste antes
    warnIfReturningUser();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();