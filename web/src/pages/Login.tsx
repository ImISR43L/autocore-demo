import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  GraduationCap,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import "../App.css";

// Interface para os requisitos de senha
interface PasswordRequirement {
  id: number;
  label: string;
  regex: RegExp;
  met: boolean;
}

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado de carregamento inicial para a verificação da sessão
  const [checkingSession, setCheckingSession] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  // Estados dos campos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  // Refs para gestão de foco automático
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // Requisitos de segurança de senha
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([
    { id: 1, label: "Mínimo de 6 caracteres", regex: /.{6,}/, met: false },
    {
      id: 2,
      label: "Pelo menos uma letra maiúscula",
      regex: /[A-Z]/,
      met: false,
    },
    {
      id: 3,
      label: "Pelo menos uma letra minúscula",
      regex: /[a-z]/,
      met: false,
    },
    { id: 4, label: "Pelo menos um número", regex: /[0-9]/, met: false },
  ]);

  // Verificação de sessão (Substituindo o Supabase pelo sessionStorage)
  useEffect(() => {
    const user = sessionStorage.getItem("demo_user");
    if (user) {
      navigate("/dashboard");
    } else {
      setCheckingSession(false);
    }
  }, [navigate]);

  // Validação em tempo real da senha
  useEffect(() => {
    if (!isRegister) return;

    setPasswordRequirements((prevReqs) =>
      prevReqs.map((req) => ({
        ...req,
        met: req.regex.test(password),
      })),
    );
  }, [password, isRegister]);

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      if (!isPasswordValid) {
        toast.error("Por favor, atenda a todos os requisitos de senha.");
        return;
      }
      if (!doPasswordsMatch) {
        toast.error("As senhas não coincidem.");
        return;
      }
      if (!name) {
        toast.error("Por favor, insira o seu nome.");
        return;
      }
    }

    setLoading(true);

    // Simulação de tempo de rede (mock do backend)
    setTimeout(() => {
      // 1. Cria o usuário fantasma na sessão
      const demoUser = {
        name: name || (isRegister ? "Novo Usuário" : "Visitante"),
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name || "Visitante",
        )}&background=random`,
      };

      sessionStorage.setItem("demo_user", JSON.stringify(demoUser));

      if (isRegister) {
        toast.success("Conta criada com sucesso!");
      } else {
        toast.success("Login realizado com sucesso!");
      }

      navigate("/dashboard");
      setLoading(false);
    }, 800);
  };

  // Se estiver checando a sessão, não renderiza a tela de login
  if (checkingSession) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-2xl shadow-xl border border-border relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
            <GraduationCap size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            AutoCore
          </h1>
          <p className="text-muted text-sm mt-2 text-center">
            {isRegister
              ? "Junte-se à plataforma de correção automatizada."
              : "Bem-vindo de volta! Acesse sua conta."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome (Exibido no Cadastro, ou opcional no Login para fins da Demo) */}
          {(isRegister || !isRegister) && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">
                {isRegister ? "Nome" : "Nome (Opcional na Demo)"}
              </label>
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  required={isRegister}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 bg-background border border-border rounded-md px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted/50"
                  placeholder={
                    isRegister ? "Seu nome" : "Como quer ser chamado?"
                  }
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">
              Email
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-background border border-border rounded-md px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted/50"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 bg-background border border-border rounded-md pl-4 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted/50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors focus:outline-none bg-transparent border-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-background/50 border border-border rounded-md p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  A senha deve conter:
                </p>
                {passwordRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
                      req.met ? "text-green-500" : "text-muted"
                    }`}
                  >
                    {req.met ? <Check size={14} /> : <X size={14} />}
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 ml-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-11 bg-background border rounded-md pl-4 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted/50 ${
                      confirmPassword.length > 0
                        ? doPasswordsMatch
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500/50"
                          : "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-border"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {confirmPassword.length > 0 && !doPasswordsMatch && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle size={12} /> As senhas não coincidem
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {isRegister ? "Criar Conta" : "Entrar"} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Alternar entre Login / Cadastro */}
        <p className="text-center text-muted text-sm mt-8">
          {isRegister ? "Já possui uma conta?" : "Ainda não tem acesso?"}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setPassword("");
              setConfirmPassword("");
              setName("");
              setShowPassword(false);
            }}
            className="ml-2 text-primary font-semibold hover:underline focus:outline-none bg-transparent border-none cursor-pointer"
          >
            {isRegister ? "Fazer Login" : "Cadastre-se"}
          </button>
        </p>
      </div>
    </div>
  );
}
