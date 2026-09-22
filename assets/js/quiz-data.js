/* =========================================================
   QUIZ-DATA.JS — Descubra sua Casa | SON
   Conteúdo do experimento: características, perfis das Casas,
   banco de perguntas e mensagens. Edite este arquivo livremente
   sem tocar na lógica em app.js.

   Estrutura:
     1. TRAITS            - as 10 características avaliadas
     2. CATEGORIES         - mesmas 10 características, usadas
                              para agrupar o banco de perguntas
                              e garantir variedade em cada teste
     3. HOUSE_PROFILES    - vetor de características por Casa
     4. HOUSES            - conteúdo textual das 4 Casas
     5. QUESTION_POOL      - banco com ~40 perguntas (4 por
                              categoria). A cada teste, o app.js
                              sorteia 12 delas, uma de cada
                              categoria no mínimo, com alternativas
                              embaralhadas (ver getRandomQuestions
                              em app.js).
     6. PROGRESS_MESSAGES - mensagens de progresso do quiz
     7. LOADING_SEQUENCE  - mensagens da revelação
     8. TRAIT_LABELS      - rótulos para a seção de perfil
   ========================================================= */

/* =======================================================
   1. TRAITS
======================================================= */
const TRAITS = [
  "lideranca",
  "comunicacao",
  "missao",
  "iniciativa",
  "espiritualidade",
  "fraternidade",
  "acolhimento",
  "servico",
  "perseveranca",
  "sabedoria"
];

/* =======================================================
   2. CATEGORIES
   Usadas apenas para organizar o banco de perguntas (não
   alteram o cálculo, que continua baseado 100% em TRAITS).
   Mantidas iguais a TRAITS para que cada categoria tenha um
   tema humano reconhecível (ver TRAIT_LABELS para os nomes).
======================================================= */
const CATEGORIES = [
  "lideranca",
  "comunicacao",
  "missao",
  "iniciativa",
  "espiritualidade",
  "fraternidade",
  "acolhimento",
  "servico",
  "perseveranca",
  "sabedoria"
];

/* =======================================================
   3. HOUSE_PROFILES
   Cada Casa é um vetor com as 10 características de TRAITS,
   de 0 (não representa) a 5 (representa totalmente).
   O algoritmo compara o vetor do jovem com estes perfis por
   similaridade de cosseno (app.js -> computeResult).
======================================================= */
const HOUSE_PROFILES = {

  // Águia — visão, liderança, iniciativa, missão, comunicação
  aguia: {
    lideranca: 5, comunicacao: 5, missao: 5, iniciativa: 5,
    espiritualidade: 3, fraternidade: 2, acolhimento: 2,
    servico: 2, perseveranca: 3, sabedoria: 3
  },

  // Árvore da Vida — enraizamento, fraternidade, acolhimento, sabedoria
  arvore: {
    lideranca: 2, comunicacao: 3, missao: 3, iniciativa: 2,
    espiritualidade: 5, fraternidade: 5, acolhimento: 5,
    servico: 3, perseveranca: 4, sabedoria: 5
  },

  // Grão de Trigo — serviço silencioso, perseverança, entrega
  grao: {
    lideranca: 2, comunicacao: 2, missao: 4, iniciativa: 2,
    espiritualidade: 4, fraternidade: 3, acolhimento: 3,
    servico: 5, perseveranca: 5, sabedoria: 3
  },

  // Cruz — oração, profundidade espiritual, fidelidade, discernimento
  cruz: {
    lideranca: 3, comunicacao: 3, missao: 4, iniciativa: 2,
    espiritualidade: 5, fraternidade: 3, acolhimento: 3,
    servico: 4, perseveranca: 5, sabedoria: 5
  }

};

/* =======================================================
   4. HOUSES
   Ordem das chaves = ordem dos escudos na interface.
======================================================= */
const HOUSES = {

  aguia: {
    name: "Casa Águia",
    shortName: "Águia",
    tagline: "Renovados para voar",
    image: "images/houses/aguia.webp",
    description:
      "Você foi criado para enxergar além e conduzir pelo exemplo. Como a águia, Deus o chama a voar alto na fé e a abrir caminhos para que outros também subam.",
    verse:
      "\u201cOs que esperam no Senhor renovam as suas forças, voam alto como águias.\u201d",
    verseRef: "Isaías 40,31",
    whyFit:
      "Suas respostas revelam alguém que percebe o próximo passo antes dos outros, comunica com clareza e não teme assumir a frente quando é preciso decidir.",
    whatYouWillLive: [
      "Formação em liderança e discernimento vocacional",
      "Oportunidades reais de conduzir projetos e pequenos grupos",
      "Acompanhamento espiritual para lapidar sua visão a serviço da missão"
    ]
  },

  arvore: {
    name: "Casa Árvore da Vida",
    shortName: "Árvore da Vida",
    tagline: "Permanecer para dar frutos",
    image: "images/houses/arvore.webp",
    description:
      "Você é chamado a permanecer unido a Cristo, como o ramo que só dá fruto porque está ligado à videira. Sua vida floresce quando permanece enraizada na oração, na comunidade e na escuta da Palavra — e por isso você também ajuda outros a permanecerem firmes na fé.",
    verse:
      "\u201cEu sou a videira verdadeira, e meu Pai é o agricultor. Todo ramo que, estando em mim, não dá fruto, ele corta; e todo que dá fruto, ele poda, para que dê mais fruto.\u201d",
    verseRef: "João 15,1\u20132",
    whyFit:
      "Suas respostas revelam alguém que cresce em comunhão, permanece fiel aos vínculos que constrói e floresce quando está enraizado na comunidade e na presença de Deus.",
    whatYouWillLive: [
      "Formação espiritual contínua e vida de oração",
      "Vida fraterna profunda e amizades que sustentam a fé",
      "Missão vivida com constância, cuidado e escuta"
    ]
  },

  grao: {
    name: "Casa Grão de Trigo",
    shortName: "Grão de Trigo",
    tagline: "Morrer para frutificar",
    image: "images/houses/grao.webp",
    description:
      "Você entende, no fundo do coração, que só se dá fruto quando se entrega. Como o grão que morre escondido na terra, sua vida floresce quando você se despoja de si mesmo para gerar vida nova em quem está ao seu redor.",
    verse:
      "\u201cSe o grão de trigo não cair na terra e não morrer, fica só; mas, se morrer, dá muito fruto.\u201d",
    verseRef: "João 12,24",
    whyFit:
      "Suas respostas mostram alguém que se doa nas pequenas coisas, aceita morrer para o próprio interesse e encontra em Deus a força para permanecer, mesmo sem ser visto.",
    whatYouWillLive: [
      "Experiências práticas de serviço dentro e fora do grupo",
      "Uma comunidade que valoriza cada gesto discreto de cuidado",
      "Crescimento espiritual pela entrega e pela perseverança"
    ]
  },

  cruz: {
    name: "Casa Cruz",
    shortName: "Cruz",
    tagline: "Negar-se para seguir",
    image: "images/houses/cruz.webp",
    description:
      "Sua caminhada nasce da oração e se firma na fidelidade. Na Cruz você aprende a negar-se a si mesmo, a permanecer quando é difícil e a transformar entrega em vida nova.",
    verse:
      "\u201cSe alguém quer vir após mim, negue-se a si mesmo, tome cada dia a sua cruz e siga-me.\u201d",
    verseRef: "Lucas 9,23",
    whyFit:
      "Suas respostas revelam alguém que busca a vontade de Deus antes de agir, escuta com profundidade e permanece fiel mesmo quando o caminho pesa.",
    whatYouWillLive: [
      "Vida de oração, silêncio e escuta da Palavra",
      "Acompanhamento espiritual e discernimento do seu chamado",
      "Missão sustentada pela intercessão e pela fidelidade diária"
    ]
  }

};

/* =======================================================
   5. QUESTION_POOL
   Banco com 40 perguntas de discernimento baseadas em
   situações pessoais do dia a dia (relações, decisões, rotina,
   fé, desafios, propósito, comunicação, cuidado, iniciativa
   e serviço), evitando depender de experiências dentro do SON. As alternativas
   são formuladas para parecer igualmente plausíveis, reduzindo respostas
   por desejo de obter uma Casa específica. Cada alternativa distribui pesos
   entre 3 e 4 características, sem apontar diretamente para
   nenhuma Casa. Cada pergunta tem uma "category" (uma das
   CATEGORIES) usada só para garantir variedade no sorteio —
   o cálculo do resultado usa exclusivamente os "weights".
======================================================= */
const QUESTION_POOL = [

  /* ---------- acolhimento ---------- */
  {
    category: "acolhimento",
    text: "Quando você chega a um lugar onde conhece poucas pessoas, qual atitude surge mais naturalmente?",
    options: [
      { text: "Puxo conversa e tento conhecer quem está por perto.", weights: { comunicacao: 2, fraternidade: 2, acolhimento: 2, iniciativa: 1 } },
      { text: "Observo o ambiente primeiro e vou me aproximando no meu tempo.", weights: { sabedoria: 2, espiritualidade: 2, perseveranca: 2, acolhimento: 1 } },
      { text: "Percebo se alguém precisa de ajuda prática e começo por aí.", weights: { servico: 3, perseveranca: 2, iniciativa: 1, fraternidade: 1 } },
      { text: "Procuro entender o que está acontecendo e onde posso contribuir melhor.", weights: { lideranca: 2, missao: 2, comunicacao: 1, iniciativa: 2 } }
    ]
  },
  {
    category: "acolhimento",
    text: "Uma pessoa próxima está visivelmente mal, mas diz que está tudo bem. O que você tende a fazer?",
    options: [
      { text: "Chamo para conversar e tento ajudá-la a colocar em palavras o que está sentindo.", weights: { comunicacao: 2, acolhimento: 2, fraternidade: 2, lideranca: 1 } },
      { text: "Fico por perto, respeitando o tempo dela e oferecendo presença.", weights: { espiritualidade: 2, acolhimento: 2, sabedoria: 2, fraternidade: 1 } },
      { text: "Mobilizo outras pessoas de confiança para que ela não fique sozinha.", weights: { lideranca: 2, fraternidade: 2, comunicacao: 2, servico: 1 } },
      { text: "Rezo por ela e continuo acompanhando com cuidado, mesmo sem insistir.", weights: { espiritualidade: 3, servico: 2, perseveranca: 2 } }
    ]
  },
  {
    category: "acolhimento",
    text: "Em uma roda de pessoas, você percebe alguém quieto e um pouco deslocado. O que faz?",
    options: [
      { text: "Vou até a pessoa e puxo assunto para ela se sentir incluída.", weights: { acolhimento: 3, comunicacao: 2 } },
      { text: "Aproximo essa pessoa de outras com quem acho que ela pode se identificar.", weights: { acolhimento: 2, fraternidade: 2, comunicacao: 1 } },
      { text: "Fico disponível e atento, sem forçar uma aproximação.", weights: { acolhimento: 2, sabedoria: 1, espiritualidade: 1 } },
      { text: "Convido a pessoa para fazer algo comigo, de um jeito natural.", weights: { acolhimento: 2, servico: 1, iniciativa: 1 } }
    ]
  },
  {
    category: "acolhimento",
    text: "Alguém próximo começa algo novo e demonstra insegurança. Como você costuma apoiar?",
    options: [
      { text: "Explico o que sei e tento deixar a situação mais clara e leve.", weights: { acolhimento: 3, comunicacao: 1, sabedoria: 1 } },
      { text: "Fico junto durante os primeiros passos para a pessoa não se sentir sozinha.", weights: { acolhimento: 2, fraternidade: 2 } },
      { text: "Ajudo a conectar essa pessoa com quem também pode apoiá-la.", weights: { lideranca: 1, acolhimento: 2, comunicacao: 1 } },
      { text: "Me ofereço para fazer uma parte junto com ela até ganhar confiança.", weights: { acolhimento: 2, servico: 1, fraternidade: 1 } }
    ]
  },

  /* ---------- lideranca ---------- */
  {
    category: "lideranca",
    text: "Um plano com amigos ou família dá errado de última hora. Qual é sua reação mais natural?",
    options: [
      { text: "Junto as opções disponíveis e tento transformar a confusão em um próximo passo possível.", weights: { lideranca: 2, iniciativa: 2, comunicacao: 2, missao: 1 } },
      { text: "Vou direto para o problema e começo a resolver o que estiver ao meu alcance.", weights: { servico: 3, perseveranca: 2, iniciativa: 1, missao: 1 } },
      { text: "Primeiro tento acalmar quem ficou mais preocupado com a situação.", weights: { acolhimento: 3, fraternidade: 2, sabedoria: 1, espiritualidade: 1 } },
      { text: "Paro por um instante para entender o que aconteceu antes de agir.", weights: { sabedoria: 3, perseveranca: 2, lideranca: 1, iniciativa: 1 } }
    ]
  },
  {
    category: "lideranca",
    text: "Quando você precisa organizar algo com outras pessoas, como costuma começar?",
    options: [
      { text: "Começo organizando etapas, responsabilidades e o que precisa acontecer primeiro.", weights: { lideranca: 3, comunicacao: 2, iniciativa: 1 } },
      { text: "Pergunto o que cada pessoa prefere ou consegue fazer antes de decidir.", weights: { lideranca: 2, acolhimento: 2, fraternidade: 1, sabedoria: 1 } },
      { text: "Começo fazendo a minha parte e vou puxando os outros pelo exemplo.", weights: { lideranca: 2, servico: 2, iniciativa: 1, perseveranca: 1 } },
      { text: "Busco conselho, reflito e só depois defino como seguir.", weights: { sabedoria: 2, lideranca: 1, espiritualidade: 2 } }
    ]
  },
  {
    category: "lideranca",
    text: "Quando ninguém se posiciona diante de uma decisão importante, o que você costuma fazer?",
    options: [
      { text: "Se vejo um caminho viável, coloco a ideia na mesa para destravar a decisão.", weights: { lideranca: 3, comunicacao: 2, iniciativa: 1 } },
      { text: "Dou uma sugestão, mas prefiro construir a decisão junto com todos.", weights: { lideranca: 2, fraternidade: 2, comunicacao: 1, sabedoria: 1 } },
      { text: "Espero um pouco, observo e só me posiciono quando entendo melhor o cenário.", weights: { sabedoria: 2, perseveranca: 1, lideranca: 1 } },
      { text: "Estimulo alguém a se expressar e ajudo a conversa a avançar.", weights: { lideranca: 2, acolhimento: 2, comunicacao: 1 } }
    ]
  },
  {
    category: "lideranca",
    text: "Quando algo que você liderou ou ajudou a organizar não sai como esperado, como reage?",
    options: [
      { text: "Assumo minha parte e já penso no que posso fazer melhor na próxima vez.", weights: { lideranca: 3, perseveranca: 2, sabedoria: 1 } },
      { text: "Converso com as pessoas envolvidas para entender o que aconteceu.", weights: { lideranca: 2, comunicacao: 2, fraternidade: 1, sabedoria: 1 } },
      { text: "Reconheço o esforço de todos antes de falar dos erros.", weights: { acolhimento: 2, fraternidade: 2, lideranca: 1 } },
      { text: "Levo a situação para a oração e reflito antes de tomar novas decisões.", weights: { espiritualidade: 3, sabedoria: 2, lideranca: 1 } }
    ]
  },

  /* ---------- espiritualidade ---------- */
  {
    category: "espiritualidade",
    text: "Quando você consegue ficar alguns minutos a sós com Deus, o que mais costuma acontecer dentro de você?",
    options: [
      { text: "Sinto vontade de transformar o que vivi em palavras que possam fortalecer alguém.", weights: { comunicacao: 2, missao: 2, lideranca: 1, espiritualidade: 2 } },
      { text: "Busco silêncio e tento escutar com profundidade.", weights: { espiritualidade: 3, sabedoria: 2, perseveranca: 2 } },
      { text: "Lembro das pessoas que estão sofrendo e rezo por elas.", weights: { acolhimento: 2, fraternidade: 2, espiritualidade: 2, servico: 1 } },
      { text: "Peço força para viver com fidelidade aquilo que sinto ser meu propósito.", weights: { missao: 3, perseveranca: 2, espiritualidade: 2 } }
    ]
  },
  {
    category: "espiritualidade",
    text: "Pensando na pessoa que você deseja se tornar, qual frase mais representa seu coração?",
    options: [
      { text: "Quero inspirar outras pessoas a se aproximarem de Deus.", weights: { lideranca: 2, missao: 3, comunicacao: 2 } },
      { text: "Quero construir relações profundas que façam as pessoas crescerem juntas.", weights: { fraternidade: 3, acolhimento: 2, espiritualidade: 2 } },
      { text: "Quero ser alguém disposto a ajudar, mesmo nas pequenas coisas.", weights: { servico: 3, perseveranca: 2, espiritualidade: 2 } },
      { text: "Quero crescer espiritualmente e compreender cada vez melhor meu chamado.", weights: { espiritualidade: 3, sabedoria: 2, missao: 2 } }
    ]
  },
  {
    category: "espiritualidade",
    text: "Antes de uma decisão realmente importante na sua vida, o que você costuma fazer primeiro?",
    options: [
      { text: "Procuro me afastar do ruído por um momento e colocar a decisão diante de Deus.", weights: { espiritualidade: 3, sabedoria: 1 } },
      { text: "Converso com alguém de confiança que compartilha da minha fé.", weights: { espiritualidade: 2, fraternidade: 2, sabedoria: 1 } },
      { text: "Penso sozinho nos prós, contras e consequências.", weights: { sabedoria: 2, espiritualidade: 1, perseveranca: 1 } },
      { text: "Dou atenção ao que meu coração está dizendo naquele momento.", weights: { espiritualidade: 2, iniciativa: 1 } }
    ]
  },
  {
    category: "espiritualidade",
    text: "Como você descreveria sua relação com a oração no dia a dia?",
    options: [
      { text: "É uma parte central da minha rotina e procuro protegê-la.", weights: { espiritualidade: 3, perseveranca: 1 } },
      { text: "Tenho desejo de rezar mais, mas ainda luto para manter constância.", weights: { espiritualidade: 2, perseveranca: 2, sabedoria: 1 } },
      { text: "Minha oração ganha mais força quando estou com outras pessoas.", weights: { espiritualidade: 2, fraternidade: 2 } },
      { text: "Percebo que a oração me impulsiona a cuidar e servir melhor.", weights: { espiritualidade: 2, servico: 2 } }
    ]
  },

  /* ---------- fraternidade ---------- */
  {
    category: "fraternidade",
    text: "Em um ambiente social, você percebe alguém sozinho enquanto os outros já estão conversando. O que faz?",
    options: [
      { text: "Encontro uma forma natural de me aproximar para que ela não precise dar o primeiro passo sozinha.", weights: { acolhimento: 3, comunicacao: 2, fraternidade: 2 } },
      { text: "Chamo outras pessoas e ajudo a criar uma roda em que ela possa entrar.", weights: { lideranca: 2, fraternidade: 2, comunicacao: 2, missao: 1 } },
      { text: "Observo um pouco antes para entender qual aproximação seria mais confortável.", weights: { sabedoria: 3, acolhimento: 2, espiritualidade: 1, perseveranca: 1 } },
      { text: "Convido a pessoa para participar comigo de alguma atividade ou conversa.", weights: { iniciativa: 2, servico: 2, acolhimento: 2, missao: 1 } }
    ]
  },
  {
    category: "fraternidade",
    text: "Um amigo está passando por uma fase difícil e não sabe muito bem como pedir ajuda. Como você reage?",
    options: [
      { text: "Fico perto, mesmo que eu não tenha as palavras certas.", weights: { fraternidade: 3, acolhimento: 2 } },
      { text: "Procuro envolver outras pessoas de confiança para criar uma rede de apoio.", weights: { lideranca: 1, fraternidade: 2, comunicacao: 1 } },
      { text: "Uno as duas coisas: coloco a pessoa em oração e procuro perceber uma ajuda concreta possível.", weights: { espiritualidade: 2, servico: 2, fraternidade: 1 } },
      { text: "Respeito o espaço dele, mas deixo claro que estou disponível.", weights: { sabedoria: 1, fraternidade: 2, acolhimento: 1 } }
    ]
  },
  {
    category: "fraternidade",
    text: "Depois de muito tempo sem ver pessoas de quem você gosta, como costuma retomar a proximidade?",
    options: [
      { text: "Procuro algumas delas individualmente para colocar a conversa em dia.", weights: { fraternidade: 3, comunicacao: 1 } },
      { text: "Volto ao convívio e deixo a proximidade reaparecer naturalmente.", weights: { fraternidade: 2, perseveranca: 1 } },
      { text: "Pergunto como as pessoas estão e se existe algo em que eu possa ajudar.", weights: { servico: 2, fraternidade: 2 } },
      { text: "Chego contando novidades e puxando assunto para reanimar a conexão.", weights: { comunicacao: 2, fraternidade: 2 } }
    ]
  },
  {
    category: "fraternidade",
    text: "Dois amigos importantes para você querem fazer coisas diferentes no mesmo dia. Como tende a escolher?",
    options: [
      { text: "Tento encontrar uma forma de conciliar os dois lados antes de decidir.", weights: { fraternidade: 3, lideranca: 1, comunicacao: 1 } },
      { text: "Acabo indo para onde estão as pessoas com quem tenho mais proximidade naquele momento.", weights: { fraternidade: 2, acolhimento: 1 } },
      { text: "Escolho estar onde sinto que minha presença ou ajuda será mais necessária.", weights: { servico: 2, fraternidade: 1, iniciativa: 1 } },
      { text: "Peço a opinião de alguém maduro e penso com calma antes de escolher.", weights: { sabedoria: 2, fraternidade: 1 } }
    ]
  },

  /* ---------- missao ---------- */
  {
    category: "missao",
    text: "Quando você pensa em fazer algo que gere impacto positivo na vida de outras pessoas, qual papel mais combina com você?",
    options: [
      { text: "Gosto de organizar a ideia, definir o caminho e colocar as pessoas em movimento.", weights: { lideranca: 3, missao: 2, iniciativa: 2, comunicacao: 1 } },
      { text: "Prefiro estar em contato direto com as pessoas, conversando e transmitindo a mensagem.", weights: { comunicacao: 3, missao: 2, acolhimento: 1, fraternidade: 1 } },
      { text: "Tenho tendência a perceber quem precisa de mais cuidado e acompanhar de perto.", weights: { acolhimento: 2, fraternidade: 2, servico: 2, sabedoria: 1 } },
      { text: "Faço o que for necessário nos bastidores para que a iniciativa aconteça bem.", weights: { servico: 3, perseveranca: 2, iniciativa: 1, missao: 1 } }
    ]
  },
  {
    category: "missao",
    text: "Quando você sente que sua fé pode fazer bem a alguém próximo, como costuma demonstrá-la?",
    options: [
      { text: "Falo abertamente sobre o que vivo e acredito.", weights: { missao: 3, comunicacao: 2, espiritualidade: 1 } },
      { text: "Faço um convite simples para a pessoa viver alguma experiência comigo, sem pressionar.", weights: { missao: 2, acolhimento: 2, fraternidade: 1 } },
      { text: "Rezo por essa pessoa antes de pensar em qualquer conversa.", weights: { espiritualidade: 2, missao: 2, perseveranca: 1 } },
      { text: "Procuro ajudá-la concretamente e deixo minha fé aparecer pelas atitudes.", weights: { servico: 2, missao: 2, acolhimento: 1 } }
    ]
  },
  {
    category: "missao",
    text: "Surge uma oportunidade de participar de uma ação que ajuda outras pessoas. Qual papel aparece mais naturalmente em você?",
    options: [
      { text: "Antes de começar, gosto de visualizar etapas e possíveis imprevistos.", weights: { lideranca: 2, missao: 2, iniciativa: 1 } },
      { text: "Quero estar perto das pessoas, conversar e criar vínculo.", weights: { comunicacao: 2, missao: 2, fraternidade: 1 } },
      { text: "Cuido de detalhes e tarefas práticas para que as coisas funcionem.", weights: { servico: 2, missao: 1, iniciativa: 1, perseveranca: 1 } },
      { text: "Antes e durante a ação, sinto necessidade de sustentá-la também pela oração.", weights: { espiritualidade: 2, missao: 3 } }
    ]
  },
  {
    category: "missao",
    text: "Depois de viver uma experiência que mexeu profundamente com você, o que costuma permanecer mais forte?",
    options: [
      { text: "Vontade de contar para outras pessoas o que aprendi ou vivi.", weights: { comunicacao: 2, missao: 3 } },
      { text: "Desejo de continuar ajudando e transformar a experiência em atitudes.", weights: { servico: 2, missao: 2, perseveranca: 1 } },
      { text: "Uma gratidão profunda que me leva à oração.", weights: { espiritualidade: 3, missao: 2 } },
      { text: "Vontade de buscar outras experiências que me façam crescer do mesmo jeito.", weights: { iniciativa: 2, missao: 2, perseveranca: 1 } }
    ]
  },

  /* ---------- comunicacao ---------- */
  {
    category: "comunicacao",
    text: "Quando surgem opiniões muito diferentes entre pessoas próximas, como você costuma agir?",
    options: [
      { text: "Ajudo a organizar a conversa para que seja possível chegar a uma decisão.", weights: { lideranca: 3, comunicacao: 2, sabedoria: 1, fraternidade: 1 } },
      { text: "Escuto todos com atenção antes de dizer o que penso.", weights: { sabedoria: 3, acolhimento: 2, espiritualidade: 1, fraternidade: 1 } },
      { text: "Procuro um caminho que preserve a relação entre as pessoas.", weights: { fraternidade: 3, acolhimento: 2, comunicacao: 1, sabedoria: 1 } },
      { text: "Depois que uma decisão é tomada, foco em ajudar para que ela funcione.", weights: { servico: 2, perseveranca: 2, missao: 2, iniciativa: 1 } }
    ]
  },
  {
    category: "comunicacao",
    text: "Quando você precisa contar uma novidade importante para várias pessoas, como prefere fazer?",
    options: [
      { text: "Organizo o que quero dizer e prefiro comunicar de um jeito que mobilize as pessoas.", weights: { comunicacao: 3, lideranca: 2, iniciativa: 1 } },
      { text: "Converso primeiro com algumas pessoas mais próximas antes de falar com todos.", weights: { comunicacao: 2, sabedoria: 2, fraternidade: 1, lideranca: 1 } },
      { text: "Organizo as informações para ter certeza de que ninguém vai ficar confuso.", weights: { comunicacao: 2, servico: 2, iniciativa: 1 } },
      { text: "Penso, rezo e busco as palavras certas antes de falar.", weights: { espiritualidade: 2, comunicacao: 2, sabedoria: 1 } }
    ]
  },
  {
    category: "comunicacao",
    text: "Alguém entende errado uma coisa que você disse. Qual é sua reação mais comum?",
    options: [
      { text: "Procuro a pessoa logo e tento esclarecer com calma.", weights: { comunicacao: 3, acolhimento: 2, fraternidade: 1 } },
      { text: "Explico novamente de outra forma, procurando palavras melhores.", weights: { comunicacao: 2, sabedoria: 2, iniciativa: 1 } },
      { text: "Reconheço minha parte e peço desculpas se me expressei mal.", weights: { acolhimento: 2, comunicacao: 2, fraternidade: 1 } },
      { text: "Dou espaço e espero um momento mais adequado para retomar o assunto.", weights: { sabedoria: 2, perseveranca: 1, comunicacao: 1 } }
    ]
  },
  {
    category: "comunicacao",
    text: "Em uma conversa tensa, as pessoas começam a falar por cima umas das outras. O que você tende a fazer?",
    options: [
      { text: "Assumo a palavra e tento colocar ordem na conversa.", weights: { comunicacao: 3, lideranca: 2, iniciativa: 1 } },
      { text: "Procuro ouvir cada pessoa com atenção para entender o que está por trás do conflito.", weights: { comunicacao: 2, sabedoria: 2, acolhimento: 1 } },
      { text: "Sugiro uma pausa para que todos consigam se recompor.", weights: { fraternidade: 2, comunicacao: 1, sabedoria: 2 } },
      { text: "Dou atenção especial a quem está tendo mais dificuldade para se expressar.", weights: { servico: 2, acolhimento: 2, comunicacao: 1 } }
    ]
  },

  /* ---------- servico ---------- */
  {
    category: "servico",
    text: "Depois de um almoço ou encontro em família, ainda há muita coisa para arrumar. O que você costuma fazer?",
    options: [
      { text: "Ajudo a organizar quem pode cuidar de cada parte.", weights: { lideranca: 2, comunicacao: 2, iniciativa: 2, servico: 1 } },
      { text: "Começo logo pela tarefa que parece mais urgente.", weights: { servico: 3, perseveranca: 2, iniciativa: 2 } },
      { text: "Percebo quem está mais cansado e tento aliviar essa pessoa primeiro.", weights: { acolhimento: 2, fraternidade: 2, servico: 2, espiritualidade: 1 } },
      { text: "Fico até tudo estar resolvido, mesmo que leve mais tempo.", weights: { perseveranca: 3, servico: 2, missao: 1, espiritualidade: 1 } }
    ]
  },
  {
    category: "servico",
    text: "Uma pessoa próxima está de mudança e percebe que vai precisar de ajuda. Qual atitude mais parece com você?",
    options: [
      { text: "Fico até o fim ajudando no que for necessário, mesmo cansado.", weights: { servico: 3, perseveranca: 2 } },
      { text: "Organizo rapidamente o que cada pessoa pode fazer.", weights: { lideranca: 1, servico: 2, comunicacao: 1 } },
      { text: "Começo pelo que me pediram e depois procuro outras formas de ajudar.", weights: { servico: 2, iniciativa: 1, perseveranca: 1 } },
      { text: "Tento perceber quem está mais sobrecarregado para aliviar essa pessoa.", weights: { acolhimento: 2, servico: 2 } }
    ]
  },
  {
    category: "servico",
    text: "Existe uma tarefa desagradável que ninguém quer fazer. Qual reação é mais comum em você?",
    options: [
      { text: "Se percebo que precisa ser feito, geralmente começo antes de alguém distribuir a tarefa.", weights: { servico: 3, iniciativa: 1 } },
      { text: "Prefiro chamar alguém e fazer junto para ficar mais leve.", weights: { servico: 2, fraternidade: 2 } },
      { text: "Transformo aquilo em uma oferta e tento fazer com boa disposição.", weights: { espiritualidade: 2, servico: 2 } },
      { text: "Sugiro dividir a tarefa para que o peso não fique em uma pessoa só.", weights: { lideranca: 1, servico: 2, comunicacao: 1 } }
    ]
  },
  {
    category: "servico",
    text: "Depois de ajudar bastante alguém, você recebe um elogio na frente de outras pessoas. Como reage?",
    options: [
      { text: "Agradeço e faço questão de lembrar quem também ajudou.", weights: { servico: 2, fraternidade: 2, sabedoria: 1 } },
      { text: "Fico feliz, mas logo penso no que ainda posso fazer.", weights: { servico: 3, perseveranca: 1 } },
      { text: "Recebo o elogio com gratidão, mas sinto que apenas fiz o que era certo naquele momento.", weights: { espiritualidade: 2, servico: 2 } },
      { text: "Fico um pouco sem graça, porque prefiro ajudar sem chamar atenção.", weights: { servico: 2, sabedoria: 1, acolhimento: 1 } }
    ]
  },

  /* ---------- iniciativa ---------- */
  {
    category: "iniciativa",
    text: "Você percebe uma oportunidade de começar algo novo na sua vida. Qual é sua tendência inicial?",
    options: [
      { text: "Minha cabeça já começa a ligar a ideia a primeiros passos concretos.", weights: { lideranca: 3, iniciativa: 2, missao: 2, comunicacao: 1 } },
      { text: "Começo imaginando formas diferentes e criativas de fazer aquilo acontecer.", weights: { comunicacao: 2, missao: 2, sabedoria: 2, iniciativa: 1 } },
      { text: "Penso em quem poderia fazer parte comigo e como incluir essas pessoas.", weights: { acolhimento: 3, fraternidade: 2, servico: 1, espiritualidade: 1 } },
      { text: "Prefiro cuidar dos detalhes e fazer a ideia funcionar bem, mesmo sem aparecer.", weights: { servico: 3, perseveranca: 2, espiritualidade: 1, fraternidade: 1 } }
    ]
  },
  {
    category: "iniciativa",
    text: "Você percebe um hábito da sua rotina que precisa mudar. O que costuma fazer?",
    options: [
      { text: "Tomo uma decisão e começo a mudar antes que o problema cresça.", weights: { iniciativa: 3, lideranca: 1, servico: 1 } },
      { text: "Converso com alguém de confiança para organizar melhor o que fazer.", weights: { comunicacao: 2, sabedoria: 1, iniciativa: 1 } },
      { text: "Observo por mais um tempo para ter certeza de que a mudança é realmente necessária.", weights: { sabedoria: 1, perseveranca: 1 } },
      { text: "Mudo imediatamente e vou ajustando o caminho enquanto faço.", weights: { iniciativa: 3, servico: 1, lideranca: 1 } }
    ]
  },
  {
    category: "iniciativa",
    text: "Surge uma oportunidade nova que parece interessante, mas você ainda não sabe todos os detalhes. Como reage?",
    options: [
      { text: "Costumo experimentar um primeiro movimento antes de ter todas as respostas.", weights: { iniciativa: 3, comunicacao: 2 } },
      { text: "Prefiro pesquisar e pensar bastante antes de me comprometer.", weights: { sabedoria: 2, iniciativa: 1, perseveranca: 1 } },
      { text: "Converso com pessoas próximas para ouvir outras perspectivas.", weights: { fraternidade: 2, iniciativa: 1, comunicacao: 1 } },
      { text: "Espero alguém tomar a frente e, se fizer sentido, ajudo a colocar em prática.", weights: { servico: 2, perseveranca: 1, iniciativa: 1 } }
    ]
  },
  {
    category: "iniciativa",
    text: "Um plano importante muda completamente de última hora. Qual é sua reação mais natural?",
    options: [
      { text: "Minha reação é procurar uma saída possível e colocá-la em teste.", weights: { iniciativa: 3, lideranca: 1, sabedoria: 1 } },
      { text: "Me adapto à solução escolhida e ajudo a fazê-la funcionar.", weights: { servico: 2, perseveranca: 1, iniciativa: 1 } },
      { text: "Tento manter as pessoas tranquilas enquanto a situação se reorganiza.", weights: { acolhimento: 2, fraternidade: 1, iniciativa: 1 } },
      { text: "Confio, rezo e procuro perceber qual caminho faz mais sentido agora.", weights: { espiritualidade: 2, sabedoria: 1, iniciativa: 1 } }
    ]
  },

  /* ---------- perseveranca ---------- */
  {
    category: "perseveranca",
    text: "Você está trabalhando há algum tempo em um objetivo pessoal, mas surgem várias dificuldades. O que faz primeiro?",
    options: [
      { text: "Procuro uma nova estratégia e me animo a continuar.", weights: { lideranca: 2, missao: 2, iniciativa: 2, perseveranca: 1 } },
      { text: "Converso com alguém que possa me ouvir e ajudar a recuperar o ânimo.", weights: { acolhimento: 3, fraternidade: 2, comunicacao: 1, sabedoria: 1 } },
      { text: "Continuo fazendo a minha parte com constância, mesmo sem ver resultado imediato.", weights: { servico: 3, perseveranca: 3, espiritualidade: 1 } },
      { text: "Reavalio o caminho com calma antes de decidir o que mudar.", weights: { sabedoria: 3, espiritualidade: 2, lideranca: 1, perseveranca: 1 } }
    ]
  },
  {
    category: "perseveranca",
    text: "Você assumiu um compromisso importante justamente em uma semana muito cansativa. Como tende a agir?",
    options: [
      { text: "Tendo assumido o compromisso, minha primeira tendência é reorganizar o resto para conseguir cumpri-lo.", weights: { perseveranca: 3, servico: 1 } },
      { text: "Reconheço meu limite, aviso com responsabilidade e me reorganizo para não abandonar o compromisso.", weights: { sabedoria: 2, perseveranca: 1, comunicacao: 1 } },
      { text: "Peço força a Deus para atravessar o cansaço e seguir.", weights: { espiritualidade: 2, perseveranca: 2 } },
      { text: "Faço um esforço para estar presente porque sei que outras pessoas contam comigo.", weights: { fraternidade: 2, perseveranca: 2 } }
    ]
  },
  {
    category: "perseveranca",
    text: "Você começa um hábito espiritual importante, mas não consegue manter todos os dias. O que faz?",
    options: [
      { text: "Continuo tentando, mesmo depois dos dias em que falho.", weights: { perseveranca: 3, espiritualidade: 1 } },
      { text: "Peço apoio a alguém para me ajudar a manter constância.", weights: { fraternidade: 2, perseveranca: 1, sabedoria: 1 } },
      { text: "Ajusto a meta para algo mais realista, sem desistir dela.", weights: { sabedoria: 2, perseveranca: 2 } },
      { text: "Procuro viver até as dificuldades como parte do meu crescimento espiritual.", weights: { espiritualidade: 2, perseveranca: 2 } }
    ]
  },
  {
    category: "perseveranca",
    text: "Depois de meses se dedicando a uma meta, o resultado não aparece como você esperava. Como reage?",
    options: [
      { text: "Antes de abandonar, costumo dar mais tempo ao processo e observar se o esforço ainda pode amadurecer.", weights: { perseveranca: 3, espiritualidade: 1 } },
      { text: "Reviso o que posso fazer diferente e preparo uma nova tentativa.", weights: { sabedoria: 2, perseveranca: 1, lideranca: 1 } },
      { text: "Tento agradecer pelo que aprendi, mesmo sentindo frustração.", weights: { espiritualidade: 2, perseveranca: 1, sabedoria: 1 } },
      { text: "Procuro encorajar também quem caminhou comigo para ninguém desanimar.", weights: { comunicacao: 1, fraternidade: 1, perseveranca: 2 } }
    ]
  },

  /* ---------- sabedoria ---------- */
  {
    category: "sabedoria",
    text: "Você recebe uma responsabilidade grande e percebe que suas decisões vão afetar outras pessoas. Qual atitude mais representa você?",
    options: [
      { text: "Aceito a responsabilidade e tento fazer minhas atitudes falarem antes das cobranças.", weights: { lideranca: 3, missao: 2, comunicacao: 2 } },
      { text: "Quero caminhar perto das pessoas e ajudá-las a crescer junto comigo.", weights: { fraternidade: 3, acolhimento: 2, espiritualidade: 2 } },
      { text: "Estou disposto a fazer o que for necessário, mesmo sem reconhecimento.", weights: { servico: 3, perseveranca: 2, espiritualidade: 2 } },
      { text: "Antes de definir qualquer direção, busco discernir com profundidade o que Deus espera de mim.", weights: { sabedoria: 3, espiritualidade: 3, missao: 1 } }
    ]
  },
  {
    category: "sabedoria",
    text: "Um amigo pede sua opinião sobre uma decisão importante da vida dele. Como você costuma agir?",
    options: [
      { text: "Escuto bastante antes de dizer qualquer coisa.", weights: { sabedoria: 3, acolhimento: 1 } },
      { text: "Compartilho o que já vivi, mas deixo claro que a decisão é dele.", weights: { sabedoria: 2, comunicacao: 1, fraternidade: 1 } },
      { text: "Sugiro que ele também leve a situação para a oração.", weights: { espiritualidade: 2, sabedoria: 2 } },
      { text: "Ajudo a organizar os prós, contras e possíveis consequências.", weights: { sabedoria: 2, iniciativa: 1, perseveranca: 1 } }
    ]
  },
  {
    category: "sabedoria",
    text: "Duas pessoas de quem você gosta estão em desacordo e pedem sua opinião. O que você faz?",
    options: [
      { text: "Escuto os dois lados antes de me posicionar.", weights: { sabedoria: 3, comunicacao: 1 } },
      { text: "Procuro um ponto de equilíbrio que preserve a relação entre elas.", weights: { sabedoria: 2, fraternidade: 2 } },
      { text: "Evito interferir cedo demais e dou espaço para que tentem resolver.", weights: { sabedoria: 2, perseveranca: 1 } },
      { text: "Convido as duas a acalmar o coração e buscar uma conversa mais serena.", weights: { espiritualidade: 2, sabedoria: 1, fraternidade: 1 } }
    ]
  },
  {
    category: "sabedoria",
    text: "Você recebe uma crítica sobre algo que fez com boa intenção. Como costuma reagir?",
    options: [
      { text: "Penso com calma antes de responder.", weights: { sabedoria: 3, perseveranca: 1 } },
      { text: "Agradeço e tento identificar o que realmente posso melhorar.", weights: { sabedoria: 2, servico: 1, acolhimento: 1 } },
      { text: "Evito concluir na hora e procuro colocar aquilo diante de Deus antes de reagir.", weights: { espiritualidade: 2, sabedoria: 2 } },
      { text: "Converso com a pessoa para compreender melhor o que ela quis dizer.", weights: { comunicacao: 2, sabedoria: 2 } }
    ]
  }

];

/* =======================================================
   6. PROGRESS_MESSAGES — durante o quiz
======================================================= */
const PROGRESS_MESSAGES = [
  { until: 0.15, text: "Conhecendo seu jeito de perceber as situações" },
  { until: 0.4,  text: "Conectando padrões das suas respostas" },
  { until: 0.7,  text: "Seu perfil está ficando mais nítido" },
  { until: 0.95, text: "Quase lá" },
  { until: 1.01, text: "Preparando seu resultado" }
];

/* =======================================================
   7. LOADING_SEQUENCE — revelação cinematográfica
   A ordem é exatamente a ordem exibida na tela.
======================================================= */
const LOADING_SEQUENCE = [
  "Analisando suas respostas...",
  "Cruzando padrões do seu perfil...",
  "Comparando suas afinidades...",
  "Preparando sua Casa..."
];

/* =======================================================
   8. TRAIT_LABELS — usados na seção de perfil
======================================================= */
const TRAIT_LABELS = {
  lideranca: {
    name: "Liderança",
    phrase: "liderança e visão",
    result: "assumir responsabilidade e dar direção quando uma situação precisa avançar"
  },
  comunicacao: {
    name: "Comunicação",
    phrase: "comunicação clara",
    result: "transformar ideias e sentimentos em pontes com outras pessoas"
  },
  missao: {
    name: "Missão",
    phrase: "senso de propósito",
    result: "buscar um propósito que vá além do próprio interesse"
  },
  iniciativa: {
    name: "Iniciativa",
    phrase: "iniciativa e coragem",
    result: "começar movimentos e testar caminhos sem depender sempre de um primeiro empurrão"
  },
  espiritualidade: {
    name: "Espiritualidade",
    phrase: "profundidade espiritual",
    result: "buscar Deus como referência para suas escolhas e para o sentido do que vive"
  },
  fraternidade: {
    name: "Fraternidade",
    phrase: "espírito fraterno",
    result: "valorizar vínculos, presença e crescimento compartilhado"
  },
  acolhimento: {
    name: "Acolhimento",
    phrase: "acolhimento e cuidado",
    result: "perceber quem está ao redor e criar espaço para que as pessoas se sintam seguras"
  },
  servico: {
    name: "Serviço",
    phrase: "dedicação ao serviço",
    result: "ajudar de forma concreta, inclusive quando isso não traz reconhecimento"
  },
  perseveranca: {
    name: "Perseverança",
    phrase: "perseverança e constância",
    result: "continuar quando o entusiasmo inicial passa e o caminho fica mais exigente"
  },
  sabedoria: {
    name: "Sabedoria",
    phrase: "sabedoria e discernimento",
    result: "observar com profundidade antes de escolher a melhor forma de agir"
  }
};

/* Congela os dados de conteúdo para dificultar alterações simples
   via console do navegador. Proteção adicional — não substitui o
   fato de que todo código enviado ao navegador é, por natureza,
   visível a quem quiser inspecionar. */
if (typeof Object.freeze === "function") {
  Object.freeze(TRAITS);
  Object.freeze(CATEGORIES);
  Object.freeze(HOUSE_PROFILES);
  Object.freeze(QUESTION_POOL);
}
