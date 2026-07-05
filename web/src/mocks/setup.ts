import MockAdapter from "axios-mock-adapter";
import { api } from "../lib/api";

// Inicializa o interceptor no Axios com um atraso de 600ms para simular a latência da rede real
const mock = new MockAdapter(api, { delayResponse: 600 });

// ==========================================
// CONTROLE DE VERSÃO DO BANCO (Limpeza Automática)
// ==========================================
const DB_VERSION = "v6.0.0";

if (sessionStorage.getItem("db_version") !== DB_VERSION) {
  console.log(
    "🔄 Nova estrutura de Mocks detectada. Limpando SessionStorage antigo...",
  );
  sessionStorage.clear();
  sessionStorage.setItem("db_version", DB_VERSION);
}

// ==========================================
// UTILITÁRIOS DA "BASE DE DADOS" (sessionStorage)
// ==========================================

const getStorage = <T>(key: string, defaultValue: T): T => {
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T>(key: string, value: T): void => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const generateId = () => Math.random().toString(36).substring(2, 10);
const DEMO_USER_ID = "demo-user-id";

// ==========================================
// GERADOR DE SUBMISSÕES REALISTAS (MOCK)
// ==========================================

const generateMockSubmissions = (
  problem: any,
  students: any[],
  isHtml: boolean,
) => {
  const submissions: any[] = [];

  // Dicionário de códigos contextualizados para cada problema
  const mockCodes: Record<string, { accepted: string; wrong: string }> = {
    "prob-1": {
      // Bhaskara
      accepted: `import math\n\ndef solve():\n    entradas = input().split()\n    a, b, c = float(entradas[0]), float(entradas[1]), float(entradas[2])\n    delta = b**2 - 4*a*c\n    if delta < 0:\n        print("Sem raizes reais")\n    else:\n        x1 = (-b + math.sqrt(delta)) / (2*a)\n        x2 = (-b - math.sqrt(delta)) / (2*a)\n        print(f"{x1:.0f} {x2:.0f}")\n\nsolve()`,
      wrong: `def solve():\n    entradas = input().split()\n    a, b, c = float(entradas[0]), float(entradas[1]), float(entradas[2])\n    delta = b**2 - 4*a*c\n    # Esqueceu de extrair a raiz quadrada do delta\n    x1 = (-b + delta) / (2*a)\n    x2 = (-b - delta) / (2*a)\n    print(f"{x1} {x2}")\n\nsolve()`,
    },
    "prob-2": {
      // Formulário de Contacto
      accepted: `<!DOCTYPE html>\n<html>\n<head>\n  <style> body { font-family: sans-serif; } </style>\n</head>\n<body>\n  <h2>Contato</h2>\n  <form>\n    <input type="text" name="nome" placeholder="Seu Nome" required />\n    <input type="email" name="email" placeholder="Seu Email" required />\n    <button type="submit">Enviar Dados</button>\n  </form>\n</body>\n</html>`,
      wrong: `<!DOCTYPE html>\n<html>\n<body>\n  <h2>Contato</h2>\n  <form>\n    <input type="text" name="nome" placeholder="Seu Nome" />\n    <input type="email" name="email" placeholder="Seu Email" />\n    \n  </form>\n</body>\n</html>`,
    },
    "prob-4": {
      // Ordenação
      accepted: `def solve():\n    arr = list(map(int, input().split()))\n    arr.sort()\n    print(" ".join(map(str, arr)))\n\nsolve()`,
      wrong: `def solve():\n    arr = list(map(int, input().split()))\n    # Erro: Apenas imprimiu o array original sem ordenar\n    print(" ".join(map(str, arr)))\n\nsolve()`,
    },
    "prob-5": {
      // Busca Binária
      accepted: `def solve():\n    arr = list(map(int, input().split()))\n    target = int(input())\n    if target in arr:\n        print(f"Encontrado na posição {arr.index(target)}")\n    else:\n        print("Não encontrado")\n\nsolve()`,
      wrong: `def solve():\n    arr = list(map(int, input().split()))\n    target = int(input())\n    # Erro lógico na busca\n    print(f"Encontrado na posição 0")\n\nsolve()`,
    },
    "prob-6": {
      // Grid Layout
      accepted: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .gallery {\n      display: grid;\n      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n      gap: 15px;\n    }\n    .item { background: #eee; padding: 20px; text-align: center; }\n  </style>\n</head>\n<body>\n  <div class="gallery">\n    <div class="item">Img 1</div>\n    <div class="item">Img 2</div>\n    <div class="item">Img 3</div>\n  </div>\n</body>\n</html>`,
      wrong: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .gallery {\n      display: block; /* Erro: Usou block em vez de grid */\n    }\n    .item { background: #eee; padding: 20px; }\n  </style>\n</head>\n<body>\n  <div class="gallery">\n    <div class="item">Img 1</div>\n    <div class="item">Img 2</div>\n  </div>\n</body>\n</html>`,
    },
  };

  const statuses = [
    "Accepted",
    "Accepted",
    "Accepted",
    "Wrong Answer",
    "Compilation Error",
  ];

  students.forEach((student) => {
    const isDemoUser = student.id === DEMO_USER_ID;

    // -----------------------------------------------------------------
    // TRATAMENTO EXCLUSIVO PARA O USUÁRIO REAL DA DEMO
    // Cria apenas 1 rascunho estático de ontem para não gerar spam ou poluição
    // -----------------------------------------------------------------
    if (isDemoUser) {
      const codes = mockCodes[problem.id] || {
        accepted: "",
        wrong: "// Código em desenvolvimento...",
      };
      submissions.push({
        id: generateId(),
        status: "Wrong Answer",
        files: [
          { name: isHtml ? "index.html" : "main.py", content: codes.wrong },
        ],
        output:
          "Erro: A saída gerada não corresponde à saída esperada no caso de teste #1.",
        executionTime: 32,
        memoryUsage: 1800,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Exatamente 1 dia atrás
        user: student,
        grade: null,
        teacherComment:
          "Você está no caminho certo! Leia com atenção o enunciado e tente ajustar os parâmetros antes de reenviar.",
        problemId: problem.id,
        isDelivery: false,
      });
      return;
    }

    // -----------------------------------------------------------------
    // TRATAMENTO PARA ALUNOS FANTASMAS (Volume para painéis do professor)
    // -----------------------------------------------------------------
    const numSubs = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numSubs; i++) {
      const isLast = i === numSubs - 1;
      const status =
        isLast && Math.random() > 0.4
          ? "Accepted"
          : statuses[Math.floor(Math.random() * statuses.length)];

      const codes = mockCodes[problem.id] || {
        accepted: "// Código correto",
        wrong: "// Código com erro",
      };
      const content = status === "Accepted" ? codes.accepted : codes.wrong;

      let outputMsg = "";
      if (status === "Accepted")
        outputMsg =
          "Saída correta. Todos os casos de teste passaram com sucesso.";
      else if (status === "Wrong Answer")
        outputMsg =
          "Erro: A saída gerada pelo programa não corresponde à saída esperada no caso de teste #1.";
      else outputMsg = "SyntaxError: invalid syntax (line 5)";

      const daysAgo = numSubs - i;
      const randomHours = Math.floor(Math.random() * 12);
      const submissionDate = new Date(
        Date.now() - daysAgo * 86400000 + randomHours * 3600000,
      ).toISOString();

      submissions.push({
        id: generateId(),
        status: status,
        files: [{ name: isHtml ? "index.html" : "main.py", content: content }],
        output: outputMsg,
        executionTime: Math.floor(Math.random() * 120) + 15,
        memoryUsage: Math.floor(Math.random() * 3000) + 1200,
        createdAt: submissionDate,
        user: student,
        grade:
          isLast && status === "Accepted"
            ? 10
            : isLast
              ? Math.floor(Math.random() * 5)
              : null,
        teacherComment:
          isLast && status !== "Accepted"
            ? "Preste atenção na estrutura pedida no enunciado. Revise sua lógica."
            : null,
        problemId: problem.id,
        isDelivery: problem.type === "EXAM" ? isLast : false,
      });
    }
  });

  return submissions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

// ==========================================
// SEMENTE INICIAL DE DADOS (Fixtures)
// ==========================================

const seedDatabase = () => {
  // CORREÇÃO: Resgatamos os dados estruturais do visitante de forma segura,
  // mas REMOVEMOS a gravação forçada inicial com setStorage("demo_user").
  // O fluxo agora respeitará o Login.tsx perfeitamente!
  const currentUser = getStorage("demo_user", {
    id: DEMO_USER_ID,
    email: "visitante@demo.com",
    name: "Visitante",
  });

  let classrooms = getStorage<any[]>("demo_classrooms", []);

  if (classrooms.length === 0) {
    classrooms = [
      {
        id: "turma-1",
        name: "Lógica de Programação",
        code: "LOG2024",
        subject: "PROGRAMMING",
        owner: {
          id: DEMO_USER_ID,
          email: currentUser.email,
          name: currentUser.name,
        },
        students: [
          { id: "s1", name: "Ana Silva", email: "ana@escola.com" },
          { id: "s2", name: "Carlos Souza", email: "carlos@escola.com" },
          { id: "s10", name: "Ricardo Gomes", email: "ricardo@escola.com" },
          { id: "s11", name: "Sofia Martins", email: "sofia@escola.com" },
          { id: "s12", name: "Tiago Ferreira", email: "tiago@escola.com" },
        ],
        isArchived: false,
        _count: { students: 5, problems: 1 },
        createdAt: new Date().toISOString(),
      },
      {
        id: "turma-2",
        name: "Desenvolvimento Web (Visão de Aluno)",
        code: "WEB101",
        subject: "HTML",
        owner: {
          id: "outro-professor-id",
          email: "roberto@escola.com",
          name: "Prof. Roberto",
        },
        students: [
          {
            id: DEMO_USER_ID,
            name: currentUser.name,
            email: currentUser.email,
          },
          { id: "s3", name: "Mariana Costa", email: "mariana@escola.com" },
          { id: "s13", name: "Inês Rodrigues", email: "ines@escola.com" },
          { id: "s14", name: "Diogo Alves", email: "diogo@escola.com" },
          { id: "s15", name: "Catarina Ribeiro", email: "catarina@escola.com" },
        ],
        isArchived: false,
        _count: { students: 5, problems: 1 },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "turma-3",
        name: "Estrutura de Dados (Turma Antiga)",
        code: "ED2023",
        subject: "PROGRAMMING",
        owner: {
          id: DEMO_USER_ID,
          email: currentUser.email,
          name: currentUser.name,
        },
        students: [
          { id: "s4", name: "João Pedro", email: "joao@escola.com" },
          { id: "s16", name: "Bruno Carvalho", email: "bruno@escola.com" },
          { id: "s17", name: "Laura Sousa", email: "laura@escola.com" },
          { id: "s18", name: "Gonçalo Pereira", email: "goncalo@escola.com" },
        ],
        isArchived: true,
        _count: { students: 4, problems: 1 },
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      },
      {
        id: "turma-4",
        name: "Algoritmos Avançados (Visão de Aluno)",
        code: "ALG500",
        subject: "PROGRAMMING",
        owner: {
          id: "outro-professor-2",
          email: "fernanda@escola.com",
          name: "Profa. Fernanda",
        },
        students: [
          {
            id: DEMO_USER_ID,
            name: currentUser.name,
            email: currentUser.email,
          },
          { id: "s5", name: "Lucas Mendes", email: "lucas@escola.com" },
          { id: "s19", name: "Marta Fernandes", email: "marta@escola.com" },
          { id: "s20", name: "Nuno Marques", email: "nuno@escola.com" },
          { id: "s21", name: "Joana Pinto", email: "joana@escola.com" },
        ],
        isArchived: false,
        _count: { students: 5, problems: 2 },
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: "turma-5",
        name: "Front-end Moderno",
        code: "WEB204",
        subject: "HTML",
        owner: {
          id: "demo-user-id",
          email: currentUser.email,
          name: currentUser.name,
        },
        students: [
          { id: "s6", name: "Beatriz Lima", email: "bia@escola.com" },
          { id: "s7", name: "Gabriel Santos", email: "gabriel@escola.com" },
          { id: "s22", name: "Pedro Silva", email: "pedro@escola.com" },
          { id: "s23", name: "Rita Castro", email: "rita@escola.com" },
          { id: "s24", name: "Hugo Almeida", email: "hugo@escola.com" },
        ],
        isArchived: false,
        _count: { students: 5, problems: 1 },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];
    setStorage("demo_classrooms", classrooms);

    // ==========================================
    // INSERÇÃO DE PROBLEMAS E GERAÇÃO DE SUBMISSÕES
    // ==========================================

    const allProblems = {
      "turma-1": [
        {
          id: "prob-1",
          classroomId: "turma-1",
          title: "Calculadora de Bhaskara",
          type: "EXERCISE",
          description:
            "Escreva um programa que calcule as raízes de uma equação do segundo grau.\\n\\n**Fórmula:** $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
          allowedLanguages: ["python", "javascript", "cpp", "java"],
          testCases: [
            { input: "1 -5 6", expectedOutput: "3 2", isHidden: false },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      "turma-2": [
        {
          id: "prob-2",
          classroomId: "turma-2",
          title: "Criando um Formulário de Contacto",
          type: "EXERCISE",
          description:
            "Crie um formulário HTML simples contendo campos para Nome, Email e um botão de submissão.",
          allowedLanguages: ["html"],
          createdAt: new Date().toISOString(),
        },
      ],
      "turma-3": [
        {
          id: "prob-3",
          classroomId: "turma-3",
          title: "Árvores Binárias",
          type: "EXERCISE",
          description: "Implemente uma Árvore Binária de Busca.",
          allowedLanguages: ["cpp", "java"],
          createdAt: new Date().toISOString(),
        },
      ],
      "turma-4": [
        {
          id: "prob-4",
          classroomId: "turma-4",
          title: "Ordenação de Vetores",
          type: "EXERCISE",
          description:
            "Escreva um algoritmo para ordenar um vetor de inteiros de forma crescente.\\n\\n**Exemplo:** [5, 4, 3, 2, 1] -> [1, 2, 3, 4, 5]",
          allowedLanguages: ["c", "cpp", "java", "python"],
          testCases: [
            {
              input: "5 4 3 2 1",
              expectedOutput: "1 2 3 4 5",
              isHidden: false,
            },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "prob-5",
          classroomId: "turma-4",
          title: "Busca Binária",
          type: "EXERCISE",
          description:
            "Implemente o algoritmo de busca binária para encontrar a posição de um elemento em um vetor ordenado.",
          allowedLanguages: ["c", "cpp", "java", "python"],
          testCases: [
            {
              input: "1 2 3 4 5\\n3",
              expectedOutput: "Encontrado na posição 2",
              isHidden: false,
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      "turma-5": [
        {
          id: "prob-6",
          classroomId: "turma-5",
          title: "Grid Layout Moderno",
          type: "EXERCISE",
          description:
            "Crie uma galeria de imagens responsiva usando CSS Grid.\\n\\nA galeria deve ter uma classe `.gallery` que distribui itens automaticamente.",
          allowedLanguages: ["html"],
          createdAt: new Date().toISOString(),
        },
      ],
    };

    classrooms.forEach((classroom: any) => {
      const problemsForClass = (allProblems as any)[classroom.id] || [];
      setStorage(`demo_problems_${classroom.id}`, problemsForClass);

      problemsForClass.forEach((problem: any) => {
        const isHtml = classroom.subject === "HTML";
        const subs = generateMockSubmissions(
          problem,
          classroom.students,
          isHtml,
        );
        setStorage(`demo_submissions_${problem.id}`, subs);
      });
    });

    // ==========================================
    // INSERÇÃO DE MURAIS
    // ==========================================

    setStorage("demo_announcements_turma-1", [
      {
        id: "ann-1",
        content:
          "Bem-vindos à turma de demonstração do AutoCore! Sinta-se à vontade para explorar os exercícios e testar a interface.",
        createdAt: new Date().toISOString(),
        author: {
          id: DEMO_USER_ID,
          email: currentUser.email,
          name: currentUser.name,
        },
      },
    ]);

    setStorage("demo_announcements_turma-4", [
      {
        id: "ann-4",
        content:
          "Atenção alunos: a lista de ordenação de vetores já está disponível na aba de Atividades.",
        createdAt: new Date().toISOString(),
        author: {
          id: "outro-professor-2",
          email: "fernanda@escola.com",
          name: "Profa. Fernanda",
        },
      },
    ]);

    setStorage("demo_announcements_turma-5", [
      {
        id: "ann-5",
        content:
          "Material complementar sobre CSS Flexbox e Grid já foi liberado. Aproveitem para revisar antes do exercício.",
        createdAt: new Date().toISOString(),
        author: {
          id: DEMO_USER_ID,
          email: currentUser.email,
          name: currentUser.name,
        },
      },
    ]);
  }
};

seedDatabase();

// ==========================================
// INTERCEPTAÇÃO DE ROTAS (MOCK API)
// ==========================================

mock
  .onGet("/classrooms")
  .reply(() => [
    200,
    getStorage<any[]>("demo_classrooms", []).filter((c) => !c.isArchived),
  ]);
mock
  .onGet("/classrooms/archived")
  .reply(() => [
    200,
    getStorage<any[]>("demo_classrooms", []).filter((c) => c.isArchived),
  ]);

mock.onPost("/classrooms").reply((config) => {
  const body = JSON.parse(config.data);
  const user = getStorage<any>("demo_user", {
    name: "Visitante",
    email: "demo@demo.com",
  });

  const newClassroom = {
    id: generateId(),
    name: body.name,
    subject: body.subject || "PROGRAMMING",
    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    owner: { id: DEMO_USER_ID, email: user.email, name: user.name },
    students: [],
    isArchived: false,
    _count: { students: 0, problems: 0 },
    createdAt: new Date().toISOString(),
  };

  const classrooms = getStorage<any[]>("demo_classrooms", []);
  setStorage("demo_classrooms", [newClassroom, ...classrooms]);
  return [201, newClassroom];
});

mock.onPost(/\/classrooms\/join\/[a-zA-Z0-9]+/).reply((config) => {
  const code = config.url!.split("/").pop()!;
  const classrooms = getStorage<any[]>("demo_classrooms", []);
  const classIndex = classrooms.findIndex((c) => c.code === code);

  if (classIndex === -1)
    return [404, { message: "Código inválido ou turma não encontrada." }];

  const user = getStorage<any>("demo_user", {
    name: "Visitante",
    email: "demo@demo.com",
  });
  const isAlreadyStudent = classrooms[classIndex].students.find(
    (s: any) => s.id === DEMO_USER_ID,
  );

  if (!isAlreadyStudent) {
    classrooms[classIndex].students.push({
      id: DEMO_USER_ID,
      name: user.name,
      email: user.email,
    });
    classrooms[classIndex]._count.students += 1;
    setStorage("demo_classrooms", classrooms);
  }
  return [200, { message: "Entrou na turma com sucesso!" }];
});

mock.onPatch(/\/classrooms\/([a-zA-Z0-9-_]+)\/archive/).reply((config) => {
  const match = config.url!.match(/\/classrooms\/([a-zA-Z0-9-_]+)\/archive/);
  const classrooms = getStorage<any[]>("demo_classrooms", []);
  const classIndex = classrooms.findIndex(
    (c) => c.id === (match ? match[1] : null),
  );
  if (classIndex > -1) {
    classrooms[classIndex].isArchived = true;
    setStorage("demo_classrooms", classrooms);
  }
  return [200, { message: "Turma arquivada" }];
});

mock.onPatch(/\/classrooms\/([a-zA-Z0-9-_]+)\/unarchive/).reply((config) => {
  const match = config.url!.match(/\/classrooms\/([a-zA-Z0-9-_]+)\/unarchive/);
  const classrooms = getStorage<any[]>("demo_classrooms", []);
  const classIndex = classrooms.findIndex(
    (c) => c.id === (match ? match[1] : null),
  );
  if (classIndex > -1) {
    classrooms[classIndex].isArchived = false;
    setStorage("demo_classrooms", classrooms);
  }
  return [200, { message: "Turma restaurada" }];
});

mock.onDelete(/\/classrooms\/([a-zA-Z0-9-_]+)$/).reply((config) => {
  const id = config.url!.split("/").pop()!;
  setStorage(
    "demo_classrooms",
    getStorage<any[]>("demo_classrooms", []).filter((c) => c.id !== id),
  );
  return [200, { message: "Turma excluída" }];
});

mock.onGet(/\/classrooms\/(?!archived$)([a-zA-Z0-9-_]+)$/).reply((config) => {
  const id = config.url!.split("/").pop()!;
  const classroom = getStorage<any[]>("demo_classrooms", []).find(
    (c) => c.id === id,
  );

  if (!classroom) return [404, { message: "Turma não encontrada" }];
  classroom.problems = getStorage<any[]>(`demo_problems_${id}`, []);
  classroom.announcements = getStorage<any[]>(`demo_announcements_${id}`, []);

  return [200, classroom];
});

mock.onPost("/problems").reply((config) => {
  const body = JSON.parse(config.data);
  const newProblem = {
    ...body,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const problems = getStorage<any[]>(`demo_problems_${body.classroomId}`, []);
  setStorage(`demo_problems_${body.classroomId}`, [...problems, newProblem]);

  const classrooms = getStorage<any[]>("demo_classrooms", []);
  const classIndex = classrooms.findIndex((c) => c.id === body.classroomId);
  if (classIndex > -1) {
    classrooms[classIndex]._count.problems = problems.length + 1;
    setStorage("demo_classrooms", classrooms);
  }
  return [201, newProblem];
});

mock.onPost("/announcements").reply((config) => {
  const body = JSON.parse(config.data);
  const user = getStorage<any>("demo_user", {});
  const newAnnouncement = {
    ...body,
    id: generateId(),
    author: { id: DEMO_USER_ID, email: user.email, name: user.name },
    createdAt: new Date().toISOString(),
  };

  const announcements = getStorage<any[]>(
    `demo_announcements_${body.classroomId}`,
    [],
  );
  setStorage(`demo_announcements_${body.classroomId}`, [
    newAnnouncement,
    ...announcements,
  ]);
  return [201, newAnnouncement];
});

mock.onGet(/\/submissions\/problem\/([a-zA-Z0-9-_]+)$/).reply((config) => {
  const probId = config.url!.split("/").pop()!;
  const allSubs = getStorage<any[]>(`demo_submissions_${probId}`, []);

  const classrooms = getStorage<any[]>("demo_classrooms", []);
  const targetClassroom = classrooms.find((c) => {
    const probs = getStorage<any[]>(`demo_problems_${c.id}`, []);
    return probs.some((p) => p.id === probId);
  });

  const currentUser = getStorage<any>("demo_user", { id: DEMO_USER_ID });
  const currentUserId = currentUser.id || DEMO_USER_ID;

  if (targetClassroom && targetClassroom.owner?.id === currentUserId) {
    return [200, allSubs];
  }

  const studentOwnSubs = allSubs.filter((s) => s.user?.id === currentUserId);
  return [200, studentOwnSubs];
});

mock
  .onGet(/\/submissions\/stats\/problem\/([a-zA-Z0-9-_]+)$/)
  .reply((config) => {
    const probId = config.url!.split("/").pop()!;
    const subs = getStorage<any[]>(`demo_submissions_${probId}`, []);

    let accepted = 0;
    let error = 0;

    subs.forEach((s) => {
      if (s.status === "Accepted") accepted++;
      else error++;
    });

    return [
      200,
      [
        { name: "Acertos", value: accepted, fill: "#10b981" },
        { name: "Erros", value: error, fill: "#ef4444" },
      ],
    ];
  });

mock
  .onGet(/\/submissions\/stats\/classroom\/([a-zA-Z0-9-_]+)$/)
  .reply((config) => {
    const classId = config.url!.split("/").pop()!;
    const probs = getStorage<any[]>(`demo_problems_${classId}`, []);

    const stats: any[] = [];

    probs.forEach((p) => {
      const subs = getStorage<any[]>(`demo_submissions_${p.id}`, []);
      let accepted = 0;
      let error = 0;

      subs.forEach((s) => {
        if (s.status === "Accepted") accepted++;
        else error++;
      });

      stats.push({ name: p.title, Accepted: accepted, Error: error });
    });

    return [200, stats];
  });

mock.onGet(/\/problems\/[a-zA-Z0-9-]+/).reply((config) => {
  const probId = config.url!.split("/").pop()!;
  const classrooms = getStorage<any[]>("demo_classrooms", []);
  for (const c of classrooms) {
    const probs = getStorage<any[]>(`demo_problems_${c.id}`, []);
    const p = probs.find((x) => x.id === probId);
    if (p) return [200, p];
  }
  return [404, {}];
});

mock.onAny().reply((config) => {
  console.warn(
    `[Mock Demo] Rota não interceptada: ${config.method?.toUpperCase()} ${config.url}`,
  );
  return [200, {}];
});

console.log(
  "🚀 [AutoCore Demo] Inicialização Corrigida — Fluxo de Login Ativo!",
);
