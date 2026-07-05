import MockAdapter from "axios-mock-adapter";
import { api } from "../lib/api";

// Inicializa o intercetor no Axios com um atraso de 600ms para simular a rede
const mock = new MockAdapter(api, { delayResponse: 600 });

// --- UTILITÁRIOS DE BASE DE DADOS (sessionStorage) ---

const getStorage = <T>(key: string, defaultValue: T): T => {
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T>(key: string, value: T): void => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

// Gera IDs únicos e curtos
const generateId = () => Math.random().toString(36).substring(2, 10);

// --- ESTADO INICIAL (Semente de Dados) ---
const seedDatabase = () => {
  const user = getStorage("demo_user", {
    id: "demo-user-id",
    email: "demo@demo.com",
    name: "Visitante",
  });
  // Forçamos o ID do utilizador ativo na demo
  user.id = "demo-user-id";

  let classrooms = getStorage<any[]>("demo_classrooms", []);

  if (classrooms.length === 0) {
    classrooms = [
      {
        id: "turma-1",
        name: "Lógica de Programação (A Sua Turma)",
        code: "LOG2024",
        subject: "PROGRAMMING",
        owner: { id: user.id, email: user.email, name: user.name }, // Você é o professor
        students: [{ id: "s1", name: "Ana Silva", email: "ana@escola.com" }],
        isArchived: false,
        _count: { students: 1, problems: 1 },
      },
      {
        id: "turma-2",
        name: "Química Orgânica (Visão de Aluno)",
        code: "QUI101",
        subject: "CHEMISTRY",
        owner: {
          id: "outro-professor",
          email: "roberto@escola.com",
          name: "Prof. Roberto",
        }, // Outro professor
        students: [{ id: user.id, name: user.name, email: user.email }], // Você é o aluno
        isArchived: false,
        _count: { students: 30, problems: 0 },
      },
    ];
    setStorage("demo_classrooms", classrooms);

    // Semear um problema inicial na Turma 1
    setStorage("demo_problems_turma-1", [
      {
        id: "prob-1",
        classroomId: "turma-1",
        title: "Calculadora de Bhaskara",
        type: "EXERCISE",
        description:
          "Escreva um programa que calcule as raízes de uma equação do segundo grau.\n\n**Fórmula:** $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
        allowedLanguages: ["python", "javascript", "cpp", "java"],
        testCases: [
          { input: "1 -5 6", expectedOutput: "3 2", isHidden: false },
        ],
        createdAt: new Date().toISOString(),
      },
    ]);
  }
};

seedDatabase();

// ==========================================
// MOCK DE ROTAS DA API
// ==========================================

// 1. Listar Turmas (GET /classrooms e GET /classrooms/archived)
mock.onGet("/classrooms").reply(() => {
  const classrooms = getStorage<any[]>("demo_classrooms", []);
  return [200, classrooms.filter((c) => !c.isArchived)];
});

mock.onGet("/classrooms/archived").reply(() => {
  const classrooms = getStorage<any[]>("demo_classrooms", []);
  return [200, classrooms.filter((c) => c.isArchived)];
});

// 2. Criar Nova Turma (POST /classrooms)
mock.onPost("/classrooms").reply((config) => {
  const body = JSON.parse(config.data);
  const user = getStorage<any>("demo_user", { id: "demo-user-id" });

  const newClassroom = {
    id: generateId(),
    name: body.name,
    subject: body.subject || "PROGRAMMING",
    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    owner: { id: user.id, email: user.email, name: user.name },
    students: [],
    isArchived: false,
    _count: { students: 0, problems: 0 },
    createdAt: new Date().toISOString(),
  };

  const classrooms = getStorage<any[]>("demo_classrooms", []);
  setStorage("demo_classrooms", [newClassroom, ...classrooms]);

  return [201, newClassroom];
});

// 3. Obter Detalhes de uma Turma Específica (GET /classrooms/:id)
mock.onGet(/\/classrooms\/[a-zA-Z0-9-]+$/).reply((config) => {
  const id = config.url!.split("/").pop()!;
  const classrooms = getStorage<any[]>("demo_classrooms", []);
  const classroom = classrooms.find((c) => c.id === id);

  if (!classroom) return [404, { message: "Turma não encontrada" }];

  // Injetar Problemas e Anúncios dinamicamente
  classroom.problems = getStorage<any[]>(`demo_problems_${id}`, []);
  classroom.announcements = getStorage<any[]>(`demo_announcements_${id}`, []);

  return [200, classroom];
});

// 4. Criar um Exercício (POST /problems)
mock.onPost("/problems").reply((config) => {
  const body = JSON.parse(config.data);
  const classroomId = body.classroomId; // A sua API original provavelmente envia o ID da turma no body

  const newProblem = {
    ...body,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const problems = getStorage<any[]>(`demo_problems_${classroomId}`, []);
  setStorage(`demo_problems_${classroomId}`, [...problems, newProblem]);

  // Atualiza a contagem na turma
  const classrooms = getStorage<any[]>("demo_classrooms", []);
  const classIndex = classrooms.findIndex((c) => c.id === classroomId);
  if (classIndex > -1) {
    classrooms[classIndex]._count.problems += 1;
    setStorage("demo_classrooms", classrooms);
  }

  return [201, newProblem];
});

// 5. Postar no Mural (POST /announcements)
mock.onPost("/announcements").reply((config) => {
  const body = JSON.parse(config.data);
  const user = getStorage<any>("demo_user", {});
  const classroomId = body.classroomId; // Assumindo que envia o ID da turma no request

  const newAnnouncement = {
    ...body,
    id: generateId(),
    author: { id: user.id, email: user.email, name: user.name },
    createdAt: new Date().toISOString(),
  };

  const announcements = getStorage<any[]>(
    `demo_announcements_${classroomId}`,
    [],
  );
  setStorage(`demo_announcements_${classroomId}`, [
    newAnnouncement,
    ...announcements,
  ]);

  return [201, newAnnouncement];
});

// 6. Submissões e Estatísticas (Respostas Vazias/Simuladas para evitar erros)
mock.onGet(/\/submissions\/problem\/[a-zA-Z0-9-]+/).reply(() => [200, []]);
mock.onGet(/\/submissions\/stats.*/).reply(() => [200, []]);

// Fallback geral (evita que a app quebre se esquecermos alguma rota)
mock.onAny().reply((config) => {
  console.warn(
    `[Mock] Rota não intercetada, a devolver 200 OK: ${config.method?.toUpperCase()} ${config.url}`,
  );
  return [200, {}];
});

console.log(
  "🚀 [AutoCore Demo] Backend Fantasma Inicializado! (Interceptação via axios-mock-adapter)",
);
