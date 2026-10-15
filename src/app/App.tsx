"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronLeft, ChevronRight, Circle, CircleHelp, Clock3, Copy, Crown, Eye, EyeOff, Flag, Gamepad2, LayoutGrid, ListChecks, LockKeyhole, LogIn, LogOut, Mail, Pencil, Play, Plus, RotateCcw, ShieldCheck, Sparkles, Square, Trash2, Triangle, Trophy, Users, X, Zap } from "lucide-react";

type Question = { id: number; text: string; options: string[]; correct: number; time: number };
type Answer = { player: number; choice: number; elapsed: number };
type Result = { round: number; answers: Answer[]; correct: number; time: number };
type Quiz = { id: string; title: string; questions: Question[]; revealTime: number; scoring: "speed" | "fixed" };
type View = "login" | "library" | "editor" | "lobby" | "game" | "podium" | "guest-pin" | "profile" | "guest-ready";

const initialQuestions: Question[] = [
  { id: 1, text: "¿Cuál es el planeta más grande del sistema solar?", options: ["La Tierra", "Júpiter", "Saturno", "Neptuno"], correct: 1, time: 20 },
  { id: 2, text: "¿Cuántos corazones tiene un pulpo?", options: ["Uno", "Dos", "Tres", "Cuatro"], correct: 2, time: 20 },
  { id: 3, text: "¿Qué elemento químico tiene el símbolo Au?", options: ["Plata", "Aluminio", "Cobre", "Oro"], correct: 3, time: 10 },
];
const basePlayers = [
  { name: "Sol", emoji: "🌞", color: "bg-secondary" },
  { name: "Luna", emoji: "👾", color: "bg-primary" },
  { name: "Nico", emoji: "🦊", color: "bg-destructive" },
  { name: "Vale", emoji: "🐸", color: "bg-accent" },
  { name: "Max", emoji: "🤖", color: "bg-[#c7b6fb]" },
];
const optionColors = ["bg-primary", "bg-secondary", "bg-destructive", "bg-accent"];
const shapes = [Triangle, Square, Circle, LayoutGrid];
const avatars = [{ icon: "😎", name: "Cool" }, { icon: "👾", name: "Alien" }, { icon: "🦊", name: "Zorro" }, { icon: "🐸", name: "Rana" }, { icon: "🤖", name: "Robot" }, { icon: "🐱", name: "Gato" }, { icon: "🦁", name: "León" }, { icon: "🐼", name: "Panda" }, { icon: "🦄", name: "Unicornio" }, { icon: "🐙", name: "Pulpo" }, { icon: "👻", name: "Fantasma" }, { icon: "🚀", name: "Cohete" }];
const button = "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black px-5 py-3 font-bold shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-black";
const panel = "rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0_#000]";
const field = "min-h-11 min-w-0 text-base w-full rounded-xl border-2 border-black bg-white px-4 py-3 outline-none transition-shadow focus:shadow-[3px_3px_0_#00C4CC] sm:min-h-0";

export default function App() {
  const [view, setView] = useState<View>("login");
  const [hostEmail, setHostEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([{ id: "demo", title: "Un poco de todo", questions: initialQuestions, revealTime: 6, scoring: "speed" }]);
  const [activeQuizId, setActiveQuizId] = useState("demo");
  const activeQuiz = quizzes.find(quiz => quiz.id === activeQuizId)!;
  const questions = activeQuiz.questions;
  const title = activeQuiz.title;
  const [selected, setSelected] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [joined, setJoined] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [pin, setPin] = useState("482691");
  const [round, setRound] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [remaining, setRemaining] = useState(20);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<"answering" | "reveal">("answering");
  const [results, setResults] = useState<Result[]>([]);
  const [notice, setNotice] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [guestPin, setGuestPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [nickname, setNickname] = useState("Quiz Master");
  const [avatar, setAvatar] = useState("😎");
  const [draftName, setDraftName] = useState("Quiz Master");
  const [draftAvatar, setDraftAvatar] = useState("😎");
  const [profileReturn, setProfileReturn] = useState<View>("editor");
  const [profileOrigin, setProfileOrigin] = useState<View>("editor");
  const [countdown, setCountdown] = useState(3);
  const [advanceIn, setAdvanceIn] = useState(6);
  const [customTimeOpen, setCustomTimeOpen] = useState(false);
  const [customTime, setCustomTime] = useState("20");
  const presentCount = joined + (guestMode ? 1 : 0);
  const rosterSize = view === "lobby" ? presentCount : participantCount;
  const players = Array.from({ length: rosterSize }, (_, index) => {
    if (guestMode && index === 0) return { name: nickname, emoji: avatar, color: "bg-secondary" };
    return basePlayers[index] ?? { name: `Jugador ${index + 1}`, emoji: avatars[index % avatars.length].icon, color: optionColors[index % optionColors.length] };
  });
  const botCount = Math.max(0, participantCount - (guestMode ? 1 : 0));
  const question = questions[selected];
  const current = questions[round];
  const valid = title.trim() && questions.every(item => item.text.trim() && item.options.every(option => option.trim()));
  const totalTime = questions.reduce((sum, item) => sum + item.time, 0);
  const ranking = players.map((player, index) => ({ ...player, id: index, score: results.reduce((total, result) => {
    const answer = result.answers.find(item => item.player === index);
    return total + scoreAnswer(answer, result.correct, result.time);
  }, 0), correct: results.filter(result => result.answers.some(answer => answer.player === index && answer.choice === result.correct)).length })).sort((first, second) => second.score - first.score || first.id - second.id);
  const myAnswer = answers.find(answer => answer.player === 0);
  const myRank = ranking.findIndex(player => player.id === 0) + 1;
  const myStats = ranking.find(player => player.id === 0)!;
  const roundPoints = scoreAnswer(myAnswer, current.correct, current.time);

  useEffect(() => {
    if (!guestMode && !hostEmail && view !== "login") setView("login");
  }, [guestMode, hostEmail, view]);

  useEffect(() => {
    setCustomTimeOpen(false); setCustomTime(String(question.time));
  }, [activeQuizId, question.id]);

  useEffect(() => {
    if (view !== "guest-ready") return;
    const timeout = setTimeout(() => {
      if (countdown > 1) setCountdown(previous => previous - 1);
      else beginRound(0);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [view, countdown]);

  useEffect(() => {
    if (view !== "game" || phase !== "reveal") return;
    setAdvanceIn(activeQuiz.revealTime);
    const interval = setInterval(() => setAdvanceIn(previous => Math.max(0, previous - 1)), 1000);
    const timeout = setTimeout(() => {
      if (round + 1 < questions.length) beginRound(round + 1);
      else setView("podium");
    }, activeQuiz.revealTime * 1000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [view, phase, round, questions.length, activeQuiz.revealTime]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 2800);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!showHelp) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setShowHelp(false); };
    window.addEventListener("keydown", handleEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleEscape); };
  }, [showHelp]);

  useEffect(() => {
    if (view !== "lobby" || presentCount >= 2) return;
    const timeout = setTimeout(() => setJoined(count => Math.min(50 - (guestMode ? 1 : 0), count + 1)), 950 + joined * 400);
    return () => clearTimeout(timeout);
  }, [view, joined, presentCount, guestMode]);

  useEffect(() => {
    if (view !== "game" || phase !== "answering") return;
    const interval = setInterval(() => setRemaining(Math.max(0, current.time - (Date.now() - startedAt) / 1000)), 80);
    const timeouts = Array.from({ length: botCount }, (_, index) => {
      const playerId = guestMode ? index + 1 : index;
      const delay = Math.round(1400 + Math.random() * (current.time * 750 - 1400));
      const choice = Math.random() < 0.72 ? current.correct : Math.floor(Math.random() * 4);
      return setTimeout(() => {
        const elapsed = Date.now() - startedAt;
        if (elapsed >= current.time * 1000) return;
        setAnswers(previous => previous.some(answer => answer.player === playerId) ? previous : [...previous, { player: playerId, choice, elapsed }]);
      }, delay);
    });
    return () => { clearInterval(interval); timeouts.forEach(clearTimeout); };
  }, [view, phase, round, startedAt, current.time, current.correct, guestMode, botCount]);

  useEffect(() => {
    if (view !== "game" || phase !== "answering" || participantCount < 2 || (remaining > 0 && answers.length < participantCount)) return;
    setResults(previous => previous.some(result => result.round === round) ? previous : [...previous, { round, answers: [...answers], correct: current.correct, time: current.time }]);
    setPhase("reveal");
  }, [view, phase, remaining, answers, round, current.correct, current.time, participantCount]);

  function updateQuestion(changes: Partial<Question>) {
    setQuestions(previous => previous.map((item, index) => index === selected ? { ...item, ...changes } : item));
  }
  function scoreAnswer(answer: Answer | undefined, correct: number, time: number) {
    if (!answer || answer.choice !== correct) return 0;
    return activeQuiz.scoring === "fixed" ? 1000 : Math.round(500 + 500 * Math.max(0, 1 - answer.elapsed / (time * 1000)));
  }
  function updateQuizSettings(changes: Partial<Pick<Quiz, "revealTime" | "scoring">>) {
    setQuizzes(previous => previous.map(quiz => quiz.id === activeQuizId ? { ...quiz, ...changes } : quiz));
  }
  function setQuestions(value: Question[] | ((previous: Question[]) => Question[])) {
    setQuizzes(previous => previous.map(quiz => quiz.id === activeQuizId ? { ...quiz, questions: typeof value === "function" ? value(quiz.questions) : value } : quiz));
  }
  function setTitle(value: string) {
    setQuizzes(previous => previous.map(quiz => quiz.id === activeQuizId ? { ...quiz, title: value } : quiz));
  }
  function showLibrary() {
    reset(); setEditingTitle(false); setView(hostEmail ? "library" : "login");
  }
  function editQuiz(id: string) {
    reset(); setActiveQuizId(id); setSelected(0); setEditingTitle(false);
  }
  function createQuiz() {
    if (!hostEmail) { setGuestMode(false); setView("login"); return; }
    const id = crypto.randomUUID();
    const quiz: Quiz = { id, title: "Mi nuevo quiz", revealTime: 6, scoring: "speed", questions: [0, 1].map(index => ({ id: index + 1, text: "", options: ["", "", "", ""], correct: 0, time: 20 })) };
    setQuizzes(previous => [...previous, quiz]); editQuiz(id); setEditingTitle(true);
  }
  function duplicateQuiz(quiz: Quiz) {
    const id = crypto.randomUUID();
    setQuizzes(previous => [...previous, { ...quiz, id, title: `${quiz.title || "Sin título"} (copia)`, questions: quiz.questions.map(item => ({ ...item, options: [...item.options] })) }]);
    setNotice("Copia creada. Puedes editarla sin modificar el original.");
  }
  function beginRound(index: number) {
    if (index === 0) {
      if (presentCount < 2 || presentCount > 50) return;
      setParticipantCount(presentCount);
    }
    setRound(index); setAnswers([]); setRemaining(questions[index].time); setStartedAt(Date.now()); setPhase("answering"); setView("game");
  }
  function addDemoPlayers(count: number) {
    if (view !== "lobby") return;
    setJoined(previous => Math.min(50 - (guestMode ? 1 : 0), previous + count));
  }
  function openLobby() {
    if (!valid) { setNotice("Completa el título, las preguntas y sus cuatro respuestas."); return; }
    setJoined(0); setResults([]); setPin(String(Math.floor(100000 + Math.random() * 900000))); setView("lobby");
  }
  function reset() {
    setGuestMode(false); setView(hostEmail ? "editor" : "login"); setResults([]); setAnswers([]); setRound(0); setJoined(0); setPhase("answering");
  }
  function signIn() {
    if (loginEmail.trim().toLowerCase() !== "anfitrion@quizclub.demo" || loginPassword !== "QuizClub2026!") {
      setLoginError("Los datos no coinciden con la cuenta de prueba. Usa las credenciales demo indicadas abajo."); return;
    }
    setHostEmail("anfitrion@quizclub.demo"); setLoginPassword(""); setLoginError(""); setShowPassword(false); setGuestMode(false); setView("library");
  }
  function signOut() {
    reset(); setHostEmail(null); setLoginEmail(""); setLoginPassword(""); setLoginError(""); setShowPassword(false); setParticipantCount(0); setView("login"); setNotice("Sesión demo cerrada.");
  }
  function enterGuest() {
    setGuestMode(true); setView("guest-pin"); setGuestPin(""); setPinError(""); setResults([]); setAnswers([]); setRound(0); setJoined(0);
  }
  function editProfile(destination: View) {
    setDraftName(nickname); setDraftAvatar(avatar); setProfileReturn(destination); setProfileOrigin(view); setView("profile");
  }
  async function copyPin() {
    try { await navigator.clipboard.writeText(String(pin)); setNotice("PIN copiado. ¡Compártelo con tu equipo!"); }
    catch { setNotice(`El PIN de la partida es ${pin}. Puedes copiarlo manualmente.`); }
  }

  return (
    <div className="min-h-screen min-h-dvh bg-background text-foreground selection:bg-secondary max-sm:[overflow-wrap:anywhere]">
      <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-2 border-b-2 border-black bg-white px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:h-[82px] sm:gap-4 sm:px-9 sm:py-0">
        <button onClick={showLibrary} aria-label="Quiz Club, ir a mis quizzes" className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4">
          <span className="flex size-11 -rotate-6 items-center justify-center rounded-xl border-2 border-black bg-primary shadow-[3px_3px_0_#000]"><Zap size={26} fill="black" /></span>
          <span className="hidden font-['Bricolage_Grotesque'] text-[27px] font-extrabold min-[480px]:inline">quiz<span className="text-primary">club</span><span className="text-base">®</span></span>
        </button>
        <div className="hidden items-center gap-2 rounded-full border border-black bg-background px-3 py-1.5 text-xs font-semibold xl:flex"><span className="size-2 rounded-full bg-[#07824e]" /> Tu próxima buena idea empieza jugando.</div>
        <div className="flex min-w-0 items-center gap-1 sm:gap-3"><button onClick={guestMode ? reset : enterGuest} className="min-h-11 rounded-lg border-2 border-black bg-white px-2 py-2 text-xs font-bold transition-colors hover:bg-secondary sm:min-h-0 sm:px-3">{guestMode ? "Modo anfitrión" : "Soy invitado"}</button><button onClick={() => setShowHelp(true)} aria-label="Cómo jugar" className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-background sm:size-auto sm:p-2"><CircleHelp size={22} /></button><button disabled={view === "login" || view === "game" || view === "guest-ready" || view === "profile"} onClick={() => editProfile(view)} aria-label="Personalizar mi perfil" className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-black bg-secondary text-lg transition-transform sm:size-10 enabled:hover:scale-110 disabled:cursor-default">{avatar}</button></div>
      </header>

      {!guestMode && hostEmail && ["library", "editor", "profile"].includes(view) && <nav aria-label="Navegación móvil" className="flex items-center justify-between gap-3 border-b-2 border-black bg-white px-3 py-2 lg:hidden"><button onClick={showLibrary} aria-current={view === "library" ? "page" : undefined} className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-bold ${view === "library" ? "bg-primary" : "bg-background"}`}><LayoutGrid size={17} /> Mis quizzes <span className="rounded border border-black bg-white px-1.5">{quizzes.length}</span></button><button onClick={createQuiz} className="flex min-h-11 items-center gap-2 rounded-lg border-2 border-black bg-secondary px-3 text-xs font-bold"><Plus size={17} /> Nuevo quiz</button></nav>}

      <div className="flex min-h-[calc(100vh-82px)]">
        <aside className={`${guestMode || !hostEmail ? "hidden" : "hidden lg:flex"} w-[232px] shrink-0 flex-col border-r-2 border-black bg-white p-6`}>
          <p className="mb-5 mt-3 text-[10px] font-extrabold tracking-[0.18em] text-muted-foreground">TU ESPACIO DE JUEGO</p>
          <button onClick={showLibrary} className={`flex items-center gap-3 rounded-xl border-2 border-black p-3 text-sm font-bold ${view === "library" || view === "editor" ? "bg-primary shadow-[3px_3px_0_#000]" : "border-transparent hover:bg-background"}`}><LayoutGrid size={19} /> Mis quizzes <span className="ml-auto rounded-md border border-black bg-white px-1.5 text-xs">{quizzes.length}</span></button>
          <div className="mt-10 border-t-2 border-black pt-6"><p className="mb-5 text-[10px] font-extrabold tracking-[0.18em] text-muted-foreground">ASÍ DE FÁCIL</p>
            {[{ label: "Crea tu quiz", icon: Pencil }, { label: "Reúne al equipo", icon: Users }, { label: "¡A jugar!", icon: Gamepad2 }, { label: "Celebra el podio", icon: Trophy }].map((step, index) => {
              const active = ["editor", "lobby", "game", "podium"].indexOf(view) === index;
              return <div key={step.label} className={`mb-5 flex items-center gap-3 text-xs ${active ? "font-bold" : "text-muted-foreground"}`}><span className={`flex size-8 items-center justify-center rounded-lg border ${active ? "border-black bg-secondary" : "border-black/20 bg-white"}`}><step.icon size={15} /></span>{step.label}{active && <span className="ml-auto size-1.5 rounded-full bg-black" />}</div>;
            })}
          </div>
          <div className="mt-auto pt-16"><div className="mt-5 flex items-center gap-2 text-[10px] font-medium text-muted-foreground"><ShieldCheck size={14} /> Sin cuentas. Sin complicaciones.</div></div>
        </aside>

        <main className="min-w-0 flex-1 px-3 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-7 xl:px-12 xl:py-9">
          <div className="mx-auto max-w-[1230px]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs sm:mb-7"><div className="flex min-w-0 flex-wrap items-center gap-2 text-muted-foreground"><span>{guestMode ? "Zona de jugadores" : "Mi espacio"}</span><ChevronRight size={13} /><span className="font-semibold text-black">{view === "login" ? "Acceso del anfitrión" : view === "library" ? "Mis quizzes" : view === "editor" ? "Editor de quiz" : view === "lobby" ? "Sala de espera" : view === "game" ? "Partida en directo" : view === "profile" ? "Mi perfil" : view === "guest-pin" ? "Unirse a una partida" : view === "guest-ready" ? "¡Prepárate!" : "Resultados"}</span></div><span className="flex items-center gap-1.5 text-[11px]"><span className="size-1.5 rounded-full bg-[#07824e]" />{view === "editor" || view === "library" ? "Guardado en esta sesión" : "Modo demo · sin backend"}</span></div>

            {view === "login" && <div className="mx-auto max-w-5xl py-4 sm:py-10"><div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14"><section><span className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-secondary px-3 py-1 text-[10px] font-extrabold tracking-wider"><ShieldCheck size={14} /> SOLO PARA ANFITRIONES</span><h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">Las buenas<br />partidas empiezan<br />contigo<span className="text-primary">.</span></h1><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Tu espacio para crear quizzes, preparar retos y reunir a tu equipo. Tú diriges, ellos se llevan la corona.</p><div className="mt-7 hidden max-w-sm space-y-4 sm:block">{[{ icon: Pencil, text: "Crea y organiza tus quizzes", color: "bg-primary" }, { icon: Users, text: "Reúne de 2 a 50 jugadores", color: "bg-secondary" }, { icon: Trophy, text: "Dirige la partida, sin competir", color: "bg-accent" }].map(item => <div key={item.text} className="flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-xl border-2 border-black shadow-[2px_2px_0_#000] ${item.color}`}><item.icon size={19} /></span><span className="text-xs font-bold">{item.text}</span></div>)}</div></section>
                <section className={`${panel} overflow-hidden`}><div className="border-b-2 border-black bg-primary p-5 sm:p-6"><div className="mb-3 flex size-11 items-center justify-center rounded-xl border-2 border-black bg-white"><LockKeyhole size={23} /></div><h2 className="text-2xl font-extrabold">Entra a tu espacio</h2><p className="mt-2 text-xs">Acceso exclusivo para crear y gestionar quizzes.</p></div><div className="p-5 sm:p-7"><form onSubmit={event => { event.preventDefault(); signIn(); }} className="space-y-5"><div><label htmlFor="host-email" className="mb-2 flex items-center gap-2 text-xs font-bold"><Mail size={15} /> Correo electrónico</label><input id="host-email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254} value={loginEmail} onChange={event => { setLoginEmail(event.target.value); setLoginError(""); }} placeholder="anfitrion@quizclub.demo" aria-invalid={!!loginError} aria-describedby={loginError ? "login-error" : "login-demo-hint"} className={field} /></div><div><label htmlFor="host-password" className="mb-2 flex items-center gap-2 text-xs font-bold"><LockKeyhole size={15} /> Contraseña</label><div className="relative"><input id="host-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required maxLength={128} value={loginPassword} onChange={event => { setLoginPassword(event.target.value); setLoginError(""); }} placeholder="Tu contraseña demo" aria-invalid={!!loginError} aria-describedby={loginError ? "login-error" : "login-demo-hint"} className={`${field} pr-14`} /><button type="button" onClick={() => setShowPassword(previous => !previous)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword} className="absolute inset-y-0 right-1 flex min-h-11 w-11 items-center justify-center rounded-lg hover:bg-background">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>{loginError && <p id="login-error" role="alert" className="rounded-lg border border-[#a11920] bg-destructive/10 p-3 text-xs font-semibold leading-relaxed text-[#a11920]">{loginError}</p>}<button type="submit" className={`${button} w-full bg-primary`}><LogIn size={18} /> Iniciar sesión <ArrowRight size={17} /></button></form>
                  <div id="login-demo-hint" className="mt-6 rounded-xl border-2 border-dashed border-black/40 bg-background p-4"><p className="flex items-center gap-2 text-xs font-bold"><Sparkles size={15} /> Cuenta de demostración</p><p className="mt-3 break-all text-xs">anfitrion@quizclub.demo</p><p className="mt-1 font-['JetBrains_Mono'] text-xs">QuizClub2026!</p><button type="button" onClick={() => { setLoginEmail("anfitrion@quizclub.demo"); setLoginPassword("QuizClub2026!"); setLoginError(""); }} className="mt-2 min-h-11 text-xs font-bold underline underline-offset-4">Rellenar datos de prueba</button><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Acceso simulado, sin autenticación ni base de datos real. No uses tu correo o contraseña personales. La sesión termina al recargar.</p></div>
                  <div className="mt-6 border-t border-black/20 pt-5 text-center"><p className="text-xs font-bold">¿Vienes a jugar?</p><p className="mt-1 text-[11px] text-muted-foreground">Los invitados no necesitan cuenta.</p><button onClick={enterGuest} className={`${button} mt-4 w-full bg-secondary text-sm`}><Gamepad2 size={18} /> Entrar con un PIN</button></div>
                </div></section></div></div>}

            {view === "guest-pin" && <div className="mx-auto max-w-lg py-6 text-center sm:py-12">
              <span className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-secondary px-3 py-1 text-xs font-bold"><Gamepad2 size={15} /> SE BUSCAN MENTES INQUIETAS</span>
              <h1 className="mt-5 text-3xl font-extrabold sm:text-5xl">Tu sitio está<br />en la partida<span className="text-primary">.</span></h1><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Pide el código al anfitrión.<br />Nosotros ponemos el pique, tú las respuestas.</p>
              <form onSubmit={event => { event.preventDefault(); if (!/^\d{6}$/.test(guestPin)) { setPinError("Introduce los 6 dígitos del PIN para continuar."); return; } setPin(guestPin); setPinError(""); editProfile("lobby"); }} className={`${panel} mt-8 p-6 text-left sm:p-8`}>
                <label htmlFor="guest-pin" className="mb-3 block text-xs font-bold">PIN de la partida</label><input id="guest-pin" autoFocus inputMode="numeric" autoComplete="off" maxLength={6} value={guestPin} onChange={event => { setGuestPin(event.target.value.replace(/\D/g, "").slice(0, 6)); setPinError(""); }} placeholder="000000" aria-invalid={!!pinError} aria-describedby="pin-hint" className={`${field} py-5 text-center font-['JetBrains_Mono'] text-3xl tracking-[0.25em] placeholder:text-black/25`} />
                <p id="pin-hint" role={pinError ? "alert" : undefined} className={`mt-3 text-xs leading-relaxed ${pinError ? "font-bold text-[#a11920]" : "text-muted-foreground"}`}>{pinError || "Prototipo: cualquier código de 6 dígitos abre la sala de demostración."}</p><button type="submit" className={`${button} mt-6 w-full bg-primary`}>Entrar al club <ArrowRight size={18} /></button>
              </form><button onClick={() => { setGuestPin("482691"); setPinError(""); }} className="mt-6 text-xs font-bold underline underline-offset-4">Usar el código de ejemplo: 482691</button><p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15} /> Sin registro. Solo ganas de jugar.</p>
            </div>}

            {view === "profile" && <div className="mx-auto max-w-3xl py-5">
              <div className="text-center"><span className="rounded-lg border-2 border-black bg-secondary px-3 py-1 text-xs font-bold">TU PERSONALIDAD, EN JUEGO</span><h1 className="mt-5 text-3xl font-extrabold sm:text-5xl">Que sepan quién gana<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Un icono, un apodo y toda tu actitud. Nada más.</p></div>
              <form onSubmit={event => { event.preventDefault(); if (!draftName.trim()) return; setNickname(draftName.trim()); setAvatar(draftAvatar); setView(profileReturn); }} className={`${panel} mt-8 overflow-hidden`}>
                <div className="grid sm:grid-cols-[220px_1fr]"><div className="flex flex-col items-center justify-center border-b-2 border-black bg-background p-7 sm:border-b-0 sm:border-r-2"><span className="mb-5 text-[10px] font-bold tracking-[0.18em]">ASÍ TE VERÁN</span><span className="flex size-24 -rotate-3 items-center justify-center rounded-2xl border-2 border-black bg-secondary text-6xl shadow-[5px_5px_0_#000]">{draftAvatar}</span><p className="mt-6 max-w-full break-words text-center font-['Bricolage_Grotesque'] text-xl font-extrabold">{draftName.trim() || "Tu apodo"}</p><span className="mt-2 rounded-full border border-black bg-white px-3 py-1 text-[10px] font-bold">Futuro rival a batir</span></div>
                  <div className="p-6 sm:p-8"><label htmlFor="nickname" className="mb-2 block text-xs font-bold">¿Cómo te llamamos?</label><input id="nickname" autoFocus required maxLength={18} value={draftName} onChange={event => setDraftName(event.target.value)} placeholder="Tu apodo legendario" className={field} /><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>Visible para el resto del equipo</span><span>{draftName.length}/18</span></div><fieldset className="mt-6"><legend className="mb-3 text-xs font-bold">Elige tu icono</legend><div className="grid grid-cols-4 gap-3">{avatars.map(item => <button key={item.icon} type="button" aria-label={item.name} aria-pressed={draftAvatar === item.icon} onClick={() => setDraftAvatar(item.icon)} className={`relative flex aspect-square items-center justify-center rounded-xl border-2 border-black text-3xl transition-all hover:-translate-y-0.5 ${draftAvatar === item.icon ? "bg-primary shadow-[3px_3px_0_#000]" : "bg-white hover:bg-background"}`}>{item.icon}{draftAvatar === item.icon && <span className="absolute -right-1.5 -top-1.5 rounded-full border border-black bg-black p-0.5 text-white"><Check size={11} /></span>}</button>)}</div></fieldset></div></div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-black px-6 py-5"><button type="button" onClick={() => setView(profileOrigin)} className="flex items-center gap-1 text-xs font-bold"><ChevronLeft size={15} /> Volver</button><button disabled={!draftName.trim()} className={`${button} bg-primary text-sm`}>{profileOrigin === "guest-pin" && profileReturn === "lobby" ? "¡Este soy yo! Entrar" : "Guardar mi perfil"}<ArrowRight size={17} /></button></div>
              </form>
            </div>}

            {view === "guest-ready" && <div className="mx-auto max-w-lg py-16 text-center"><span className="rounded-lg border-2 border-black bg-secondary px-3 py-1 text-xs font-bold">EL ANFITRIÓN HA INICIADO LA PARTIDA</span><h1 className="mt-6 text-4xl font-extrabold">¡A por la corona,<br />{nickname}!</h1><div key={countdown} role="status" className="mx-auto my-10 flex size-40 rotate-3 items-center justify-center rounded-3xl border-2 border-black bg-primary font-['Bricolage_Grotesque'] text-8xl font-extrabold shadow-[8px_8px_0_#000]">{countdown}</div><p className="text-sm text-muted-foreground">Responde bien. Responde rápido. Disfruta el pique.</p></div>}

            {view === "library" && <>
              <div className="mb-7 flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-black bg-white p-4"><div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-accent"><ShieldCheck size={21} /></span><div className="min-w-0"><p className="text-xs font-bold">Tu sesión de anfitrión · demo</p><p className="mt-1 break-all text-[11px] text-muted-foreground">{hostEmail}</p></div></div><button onClick={signOut} className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-black px-3 py-2 text-xs font-bold transition-colors hover:bg-secondary"><LogOut size={16} /> Cerrar sesión</button></div>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><span className="rounded-md border border-black bg-secondary px-2 py-1 text-[10px] font-extrabold tracking-wider">TU COLECCIÓN DE BUENOS PIQUES</span><h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">Mis quizzes<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">Tus ideas, tus preguntas. Siempre hay espacio para un reto más.</p></div><button onClick={createQuiz} className={`${button} w-full bg-primary sm:w-auto`}><Plus size={19} /> Crear nuevo quiz</button></div>
              <div className="mb-6 flex items-center justify-between border-b border-black/20 pb-4"><h2 className="text-base font-bold">Todos los quizzes <span className="ml-1 rounded-md border border-black bg-white px-2 py-0.5 text-xs">{quizzes.length}</span></h2></div>
              <div className="grid items-stretch gap-6 md:grid-cols-2 2xl:grid-cols-3">{quizzes.map((quiz, index) => {
                const ready = quiz.title.trim() && quiz.questions.every(item => item.text.trim() && item.options.every(option => option.trim()));
                const completed = quiz.questions.filter(item => item.text.trim() && item.options.every(option => option.trim())).length;
                return <article key={quiz.id} className={`${panel} flex min-w-0 flex-col overflow-hidden`}><div className={`flex items-start justify-between border-b-2 border-black p-6 ${optionColors[index % optionColors.length]}`}><span className="flex size-16 -rotate-3 items-center justify-center rounded-xl border-2 border-black bg-white text-4xl shadow-[3px_3px_0_#000]">{["🧠", "🚀", "⚡", "🏆"][index % 4]}</span><span className="rounded-full border border-black bg-white px-3 py-1 text-[10px] font-bold">{quiz.id === "demo" ? "QUIZ DE EJEMPLO" : ready ? "LISTO PARA JUGAR" : "BORRADOR"}</span></div><div className="flex flex-1 flex-col p-6"><h2 className="break-words text-2xl font-extrabold">{quiz.title.trim() || "Sin título"}</h2><div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><ListChecks size={15} /> {quiz.questions.length} preguntas</span><span className="flex items-center gap-1.5"><Clock3 size={15} /> {quiz.questions.reduce((sum, item) => sum + item.time, 0)} s</span></div><p className="mb-6 mt-4 text-xs leading-relaxed text-muted-foreground">{ready ? "Todo listo. Abre el editor para presentar tu próxima partida." : `${completed} de ${quiz.questions.length} preguntas completas. Sigue dando forma a tu próximo reto.`}</p><div className="mt-auto flex items-center gap-3"><button onClick={() => editQuiz(quiz.id)} className={`${button} flex-1 bg-white px-3 text-sm`}><Pencil size={16} /> Editar quiz</button><button onClick={() => duplicateQuiz(quiz)} aria-label={`Duplicar ${quiz.title || "quiz sin título"}`} title="Duplicar quiz" className={`${button} bg-background px-3`}><Copy size={17} /></button></div></div></article>;
              })}<button onClick={createQuiz} className="flex min-h-[240px] flex-col sm:min-h-[320px] items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-black/50 bg-white/40 p-8 text-center transition-all hover:border-black hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-4"><span className="flex size-16 items-center justify-center rounded-2xl border-2 border-black bg-secondary shadow-[3px_3px_0_#000]"><Plus size={30} /></span><span className="font-['Bricolage_Grotesque'] text-xl font-extrabold">Una nueva idea, un nuevo quiz</span><span className="text-xs text-muted-foreground">Empieza desde cero. Tú pones las preguntas.</span></button></div>
              <p className="mt-8 flex items-start gap-2 rounded-xl border-2 border-black bg-[#d5f0eb] p-4 text-xs leading-relaxed text-muted-foreground"><ShieldCheck size={17} className="shrink-0" />Tus quizzes y sus cambios se conservan mientras navegas por esta sesión. Recargar la página restablece la colección de ejemplo.</p>
            </>}

            {view === "editor" && <>
              <button onClick={showLibrary} className="mb-5 flex items-center gap-1 text-xs font-bold underline underline-offset-4"><ChevronLeft size={15} /> Volver a mis quizzes ({quizzes.length})</button>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                <div><div className="mb-2 flex items-center gap-2"><span className="rounded-md border border-black bg-secondary px-2 py-0.5 text-[10px] font-extrabold tracking-wider">EL CONOCIMIENTO SE COMPARTE</span></div><h1 className="text-[32px] font-extrabold leading-tight sm:text-[40px]">Pequeñas preguntas.<br className="sm:hidden" /> Grandes piques<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-muted-foreground">Crea, invita y descubre quién se lleva la corona.</p></div>
                <button onClick={openLobby} className={`${button} w-full bg-primary sm:w-auto`}>Crear partida <ArrowUpRight size={19} /></button>
              </div>
              <section className={`${panel} mb-7 flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6`}>
                <div className="flex min-w-0 items-center gap-4"><span className="flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#eee8fc] text-3xl">🧠</span><div className="min-w-0"><span className="mb-1 block text-[10px] font-bold tracking-[0.13em] text-muted-foreground">TU QUIZ</span>{editingTitle ? <input aria-label="Título del quiz" className={`${field} max-w-80 py-1`} autoFocus value={title} onChange={event => setTitle(event.target.value)} onBlur={() => setEditingTitle(false)} onKeyDown={event => { if (event.key === "Enter") setEditingTitle(false); }} /> : <button onClick={() => setEditingTitle(true)} className="flex items-center gap-3 min-h-11 min-w-0 text-left font-['Bricolage_Grotesque'] text-xl font-bold [overflow-wrap:anywhere] sm:min-h-0 sm:text-2xl">{title || "Ponle un nombre"}<Pencil size={15} className="shrink-0" /></button>}</div></div>
                <div className="flex items-center gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><ListChecks size={17} />{questions.length} preguntas</span><span className="flex items-center gap-2"><Clock3 size={17} />{totalTime} s de juego</span><span className="hidden rounded-full border border-black bg-background px-3 py-1.5 text-[10px] font-bold text-black sm:block">Cultura general</span></div>
              </section>
              <details className={`${panel} mb-7 overflow-hidden`}><summary className="cursor-pointer px-5 py-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-[-4px] sm:px-6">Ajustes de partida <span className="ml-2 text-xs font-normal text-muted-foreground">Pausas y puntuación</span></summary><div className="grid gap-6 border-t-2 border-black bg-background/40 p-5 sm:grid-cols-2 sm:p-6"><fieldset><legend className="mb-2 flex items-center gap-2 text-xs font-bold"><Clock3 size={16} /> Pausa de corrección</legend><p className="mb-3 text-xs leading-relaxed text-muted-foreground">Tiempo para ver los aciertos y la clasificación antes de avanzar automáticamente.</p><div className="flex flex-wrap gap-2">{[3, 6, 10].map(time => <button key={time} aria-pressed={activeQuiz.revealTime === time} onClick={() => updateQuizSettings({ revealTime: time })} className={`min-h-11 rounded-lg border-2 border-black px-4 py-2 text-xs font-bold ${activeQuiz.revealTime === time ? "bg-secondary shadow-[2px_2px_0_#000]" : "bg-white hover:bg-background"}`}>{time} s</button>)}</div></fieldset><div><label htmlFor="quiz-scoring" className="mb-2 flex items-center gap-2 text-xs font-bold"><Trophy size={16} /> Cómo se ganan los puntos</label><select id="quiz-scoring" value={activeQuiz.scoring} onChange={event => updateQuizSettings({ scoring: event.target.value as Quiz["scoring"] })} className={`${field} text-base`}><option value="speed">Acierto + velocidad</option><option value="fixed">Solo aciertos · 1.000 puntos</option></select><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{activeQuiz.scoring === "speed" ? "Entre 500 y 1.000 puntos por acierto. Responder antes suma más." : "1.000 puntos por respuesta correcta, sin importar la velocidad."} Fallar o no responder siempre da 0.</p></div><p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2">Estos ajustes se guardan solo en este quiz. Cada pregunta termina al responder todos o agotarse su tiempo; el anfitrión no puede adelantarla.</p></div></details>
              <div className="grid items-start gap-6 xl:grid-cols-[245px_minmax(0,1fr)]">
                <section className="min-w-0"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-bold">Preguntas <span className="ml-1 text-xs text-muted-foreground">({questions.length})</span></h2><span className="text-[10px] font-bold tracking-widest text-muted-foreground">TU SECUENCIA</span></div>
                  <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 pr-2 xl:flex-col xl:overflow-visible xl:pb-2 xl:pr-0">
                    {questions.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} className={`relative flex min-w-[205px] shrink-0 snap-start items-start gap-3 rounded-xl border-2 border-black p-4 text-left transition-all xl:w-full ${selected === index ? "bg-primary shadow-[3px_3px_0_#000]" : "bg-white hover:bg-background"}`}><span className={`flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-black text-xs font-bold ${selected === index ? "bg-white" : "bg-background"}`}>{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="line-clamp-2 text-xs font-bold leading-relaxed">{item.text || "Tu nueva pregunta"}</p><p className="mt-3 flex items-center gap-1 text-[10px]"><Clock3 size={11} /> {item.time} segundos <span className="ml-2">4 opciones</span></p></div></button>)}
                  </div>
                  <button onClick={() => { setQuestions(previous => [...previous, { id: Date.now(), text: "", options: ["", "", "", ""], correct: 0, time: 20 }]); setSelected(questions.length); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/50 bg-transparent p-3.5 text-xs font-bold transition-colors hover:border-black hover:bg-white"><Plus size={17} /> Añadir pregunta</button>
                  <p className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground"><Sparkles size={15} className="mt-0.5 shrink-0" />Las mejores partidas empiezan con una pregunta inesperada.</p>
                </section>

                <section className={`${panel} overflow-hidden`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black px-5 py-4 sm:px-6"><div className="flex items-center gap-2"><span className="rounded-md border border-black bg-secondary px-2 py-1 text-xs font-bold">{String(selected + 1).padStart(2, "0")}</span><h2 className="text-base font-bold">Edita tu pregunta</h2></div><div className="flex items-center gap-2"><button title="Duplicar pregunta" aria-label="Duplicar pregunta" onClick={() => { setQuestions(previous => [...previous, { ...question, id: Date.now(), options: [...question.options] }]); setSelected(questions.length); }} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 hover:bg-background sm:min-h-0 sm:min-w-0"><Copy size={16} /></button><button title="Eliminar pregunta" aria-label="Eliminar pregunta" disabled={questions.length <= 2} onClick={() => { setQuestions(previous => previous.filter((_, index) => index !== selected)); setSelected(Math.max(0, selected - 1)); }} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 hover:bg-destructive/20 disabled:opacity-25 sm:min-h-0 sm:min-w-0"><Trash2 size={17} /></button></div></div>
                  <div className="p-5 sm:p-6"><label htmlFor="question" className="mb-2.5 block text-xs font-bold">¿Qué quieres preguntar?</label><textarea id="question" value={question.text} onChange={event => updateQuestion({ text: event.target.value })} maxLength={180} placeholder="Escribe una pregunta que despierte la curiosidad…" className={`${field} min-h-[105px] resize-y text-lg font-semibold leading-relaxed sm:text-xl`} /><div className="mb-6 mt-1 text-right text-[10px] text-muted-foreground">{question.text.length}/180</div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-bold">Las cuatro posibilidades</label><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><CheckCheck size={14} /> Marca el círculo de la respuesta correcta</span></div>
                    <div className="grid gap-3 sm:grid-cols-2">{question.options.map((option, index) => {
                      const Shape = shapes[index];
                      return <div key={index} className={`flex items-center gap-3 rounded-xl border-2 border-black p-3.5 ${optionColors[index]}`}><Shape size={19} strokeWidth={2.5} className="shrink-0" /><input aria-label={`Alternativa ${index + 1}`} className="min-h-11 w-full min-w-0 bg-transparent text-base font-semibold sm:min-h-0 sm:text-sm outline-none placeholder:text-black/60" placeholder={`Alternativa ${index + 1}`} value={option} maxLength={80} onChange={event => updateQuestion({ options: question.options.map((text, optionIndex) => optionIndex === index ? event.target.value : text) })} /><button aria-label={`Marcar alternativa ${index + 1} como correcta`} aria-pressed={question.correct === index} onClick={() => updateQuestion({ correct: index })} className={`flex size-11 shrink-0 items-center justify-center rounded-full sm:size-6 border-2 border-black transition-transform hover:scale-110 ${question.correct === index ? "bg-black text-white" : "bg-white"}`}>{question.correct === index && <Check size={15} strokeWidth={3} />}</button></div>;
                    })}</div>
                    <div className="mt-6 border-t border-black/15 pt-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-bold"><Clock3 size={17} /> Tiempo para responder</div><span className="rounded-md border border-black bg-background px-2 py-1 text-xs font-bold">Actual: {question.time} s</span></div>
                      <div className="flex flex-wrap gap-2">{[10, 20, 30].map(time => <button key={time} onClick={() => { updateQuestion({ time }); setCustomTimeOpen(false); setCustomTime(String(time)); }} aria-pressed={question.time === time} className={`min-h-11 rounded-lg border-2 border-black px-4 py-2 text-xs font-bold transition-all active:translate-y-0.5 ${question.time === time ? "bg-secondary shadow-[2px_2px_0_#000]" : "bg-white hover:bg-background"}`}>{time} s</button>)}<button onClick={() => { setCustomTimeOpen(previous => !previous); setCustomTime(String(question.time)); }} aria-expanded={customTimeOpen} aria-controls="custom-time-form" className={`flex min-h-11 items-center gap-2 rounded-lg border-2 border-black px-3 py-2 text-xs font-bold ${customTimeOpen || ![10, 20, 30].includes(question.time) ? "bg-primary shadow-[2px_2px_0_#000]" : "bg-white hover:bg-background"}`}><Pencil size={14} /> Personalizar</button></div>
                      {customTimeOpen && <form id="custom-time-form" onSubmit={event => { event.preventDefault(); const time = Number(customTime); if (!Number.isInteger(time) || time < 5 || time > 180) return; updateQuestion({ time }); setCustomTimeOpen(false); setNotice(`Tiempo actualizado: ${time} segundos.`); }} className="mt-4 rounded-xl border-2 border-black bg-background p-4"><label htmlFor="custom-time" className="mb-2 block text-xs font-bold">Tu tiempo, en segundos</label><div className="flex flex-wrap gap-3"><input id="custom-time" autoFocus type="number" inputMode="numeric" min={5} max={180} step={1} required value={customTime} onChange={event => setCustomTime(event.target.value)} aria-describedby="custom-time-hint" className={`${field} min-w-0 flex-1 basis-24`} /><button type="submit" className={`${button} bg-primary px-4 text-sm`}>Aplicar <Check size={16} /></button></div><p id="custom-time-hint" className="mt-2 text-[11px] text-muted-foreground">Entre 5 y 180 segundos, sin decimales. Solo cambia esta pregunta.</p></form>}
                      <button onClick={() => { setQuestions(previous => previous.map(item => ({ ...item, time: question.time }))); setNotice(`Todas las preguntas de este quiz tienen ahora ${question.time} segundos.`); }} className="mt-3 inline-flex min-h-11 items-center gap-2 text-left text-xs font-bold underline underline-offset-4"><CheckCheck size={15} className="shrink-0" /> Aplicar {question.time} s a todas las preguntas</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black bg-background/60 px-5 py-3.5 text-[10px] sm:px-6"><span className="flex items-center gap-1.5"><Check size={13} /> Los cambios se guardan automáticamente</span><span className="font-bold">¡Haz que cuente!</span></div>
                </section>
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-xl border-2 border-black bg-[#d5f0eb] px-5 py-4"><Gamepad2 size={23} className="shrink-0" /><p className="text-xs leading-relaxed"><strong>Tú diriges. Ellos compiten.</strong> Puedes reunir entre 2 y 50 jugadores en la sala de demostración. Como anfitrión, controlarás las preguntas y la clasificación sin participar.</p><ArrowRight size={20} className="ml-auto hidden shrink-0 sm:block" /></div>
            </>}

            {view === "lobby" && <div className="mx-auto max-w-4xl py-5 text-center">
              <span className="rounded-lg border-2 border-black bg-secondary px-3 py-1 text-xs font-bold">{guestMode ? "ESTÁS DENTRO DEL CLUB" : "QUE EMPIECE EL PIQUE"}</span><h1 className="mt-5 text-3xl font-extrabold sm:text-5xl">{guestMode ? `¡Ya tienes sitio, ${nickname}!` : "La buena compañía está llegando"}<span className="text-primary">.</span></h1><p className="mt-4 text-sm text-muted-foreground">{guestMode ? "Espera a que el anfitrión dé la señal. " : ""}{title} · {questions.length} preguntas · De 2 a 50 jugadores</p>
              <div className={`${panel} mx-auto mt-8 max-w-lg p-5 sm:p-7`}><p className="text-xs font-bold tracking-[0.16em]">PIN DE LA PARTIDA</p><button onClick={copyPin} className="mx-auto mt-3 flex max-w-full items-center gap-2 rounded-lg p-1 sm:gap-4 sm:p-2 font-['JetBrains_Mono'] text-3xl font-bold tracking-[0.08em] hover:bg-background sm:text-5xl sm:tracking-[0.12em]" title="Copiar PIN">{pin}<Copy size={21} /></button><p className="mt-3 text-xs text-muted-foreground">Sala local de demostración · los bots se unen solos</p></div>
              <div className="mb-5 mt-10 flex items-center justify-between"><h2 className="text-lg font-bold">El equipo</h2><span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold">{presentCount}/50 dentro</span></div>
              <div className="grid max-h-[50dvh] grid-cols-2 gap-4 overflow-y-auto overscroll-contain pb-2 pr-2 sm:grid-cols-3 md:grid-cols-5">{players.map((player, index) => <div key={index} className={`min-w-0 rounded-xl border-2 p-3 transition-all sm:p-5 ${index < presentCount ? "border-black bg-white shadow-[3px_3px_0_#000]" : "border-dashed border-black/30 bg-white/40"}`}><span className={`mx-auto flex size-14 items-center justify-center rounded-xl border-2 ${index < presentCount ? `${player.color} border-black` : "border-black/20 bg-background"} text-3xl`}>{index < presentCount ? player.emoji : "…"}</span><p className="mt-3 break-words text-sm font-bold">{index < presentCount ? player.name : "Esperando"}</p><p className="mt-1 text-[10px] text-muted-foreground">{guestMode && index === 0 ? "Tú · listo para jugar" : index < presentCount ? "Bot · listo para jugar" : "Conectando…"}</p></div>)}</div>
              <p className="mb-5 mt-8 text-xs text-muted-foreground" aria-live="polite">{presentCount >= 2 ? guestMode ? "Ya hay suficientes jugadores. Esperando al anfitrión…" : "¡Puedes iniciar! No hace falta llenar la sala; tú eliges cuándo empezar." : `Faltan ${2 - presentCount} jugadores para alcanzar el mínimo de 2.`}</p>
              <div className="mx-auto mb-6 max-w-xl rounded-xl border-2 border-dashed border-black/40 bg-white/50 p-4"><p className="text-xs font-bold">Prueba la sala con el tamaño de tu equipo</p><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Conexión simulada, sin backend. Se unen automáticamente los jugadores necesarios para llegar a 2. Puedes añadir más hasta 50 antes de iniciar.</p><div className="mt-4 flex flex-wrap justify-center gap-3"><button disabled={presentCount >= 50} onClick={() => addDemoPlayers(1)} className={`${button} bg-white px-3 text-xs`}><Plus size={15} /> 1 jugador</button><button disabled={presentCount >= 50} onClick={() => addDemoPlayers(10)} className={`${button} bg-white px-3 text-xs`}><Plus size={15} /> 10 jugadores</button><button disabled={presentCount >= 50} onClick={() => addDemoPlayers(50)} className={`${button} bg-secondary px-3 text-xs`}>Completar 50</button></div>{presentCount >= 50 && <p role="status" className="mt-4 text-xs font-bold">Sala llena · 50 de 50 jugadores</p>}</div>
              {guestMode && <p className="mb-5 text-xs text-muted-foreground">El botón de abajo simula la señal de inicio del anfitrión.</p>}
              <button disabled={presentCount < 2} onClick={() => { if (guestMode) { setCountdown(3); setView("guest-ready"); } else beginRound(0); }} className={`${button} w-full bg-primary px-3 sm:w-auto sm:px-6`}><Play size={18} fill="black" /> {guestMode ? "Demo: el anfitrión inicia" : "Comenzar partida"}</button>
              {guestMode && <button onClick={() => editProfile("lobby")} className="mx-auto mt-5 flex items-center gap-2 text-xs font-bold underline underline-offset-4"><Pencil size={14} /> Cambiar icono o apodo</button>}
              <button onClick={guestMode ? enterGuest : reset} className="mx-auto mt-5 flex items-center gap-1 text-xs font-bold underline underline-offset-4"><ChevronLeft size={14} /> {guestMode ? "Salir de la sala" : "Volver al editor"}</button>
            </div>}

            {view === "game" && !guestMode && <div className="py-3">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><span className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-secondary px-3 py-1 text-xs font-bold"><ShieldCheck size={15} /> PANEL DEL ANFITRIÓN</span><h1 className="mt-4 text-3xl font-extrabold">Tú llevas el juego<span className="text-primary">.</span></h1><p className="mt-2 text-xs text-muted-foreground">Supervisa al equipo. El avance es automático; no participas ni sumas puntos.</p></div><span className="rounded-lg border-2 border-black bg-white px-4 py-2 text-xs font-bold">Pregunta {round + 1} de {questions.length}</span></div>
              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(330px,0.85fr)]">
                <section className={`${panel} overflow-hidden`}><div className="flex items-center justify-between border-b-2 border-black bg-background p-5"><span className="flex items-center gap-2 text-xs font-bold"><Users size={17} /> {answers.length}/{participantCount} respuestas recibidas</span><span className={`flex items-center gap-2 rounded-lg border-2 border-black px-3 py-2 font-['JetBrains_Mono'] text-lg font-bold ${phase === "reveal" ? "bg-accent" : remaining <= 5 ? "bg-destructive" : "bg-secondary"}`}><Clock3 size={17} />{phase === "reveal" ? "Cerrada" : `${Math.ceil(remaining)} s`}</span></div><div className="p-5 sm:p-6"><h2 className="text-2xl font-extrabold leading-snug">{current.text}</h2><p className="mb-5 mt-3 text-xs text-muted-foreground">{phase === "reveal" ? "Distribución final de respuestas. La correcta está marcada." : "Los jugadores están respondiendo. La solución se revelará al cerrar la pregunta."}</p><div className="space-y-3">{current.options.map((option, index) => { const Shape = shapes[index]; const count = answers.filter(answer => answer.choice === index).length; return <div key={index} className={`flex items-center gap-3 rounded-xl border-2 border-black p-4 ${optionColors[index]} ${phase === "reveal" && index !== current.correct ? "opacity-60" : ""}`}><Shape size={19} className="shrink-0" /><span className="flex-1 text-sm font-bold">{option}</span>{phase === "reveal" && index === current.correct && <Check size={20} aria-label="Respuesta correcta" />}<span className="flex min-w-8 justify-center rounded-md border border-black bg-white px-2 py-1 text-xs font-bold" aria-label={`${count} respuestas`}>{count}</span></div>; })}</div></div><div className="border-t-2 border-black p-5">{phase === "answering" ? <p className="flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground"><Clock3 size={17} className="shrink-0" />La pregunta termina cuando todos responden o se agota el tiempo.</p> : <><p className="mb-4 text-center text-xs font-bold">{answers.filter(answer => answer.choice === current.correct).length} de {participantCount} acertaron · Puntos actualizados</p><p role="status" className="flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-primary p-4 text-sm font-bold"><Clock3 size={17} />{round + 1 < questions.length ? "Siguiente pregunta" : "Podio final"} en {advanceIn} s</p></>}</div></section>
                <section className={`${panel} overflow-hidden`} aria-label="Clasificación de jugadores"><div className="border-b-2 border-black bg-secondary p-5"><h2 className="flex items-center gap-2 text-lg font-extrabold"><Trophy size={21} /> Tabla de posiciones</h2><p className="mt-2 text-xs">{phase === "reveal" ? `Actualizada tras la pregunta ${round + 1}` : "Puntos acumulados de las preguntas cerradas"}</p></div><div className="max-h-[65dvh] overflow-auto overscroll-contain" tabIndex={0} role="region" aria-label="Tabla de posiciones con desplazamiento horizontal"><table className="w-full text-left text-xs"><thead className="border-b border-black/20 bg-background"><tr><th scope="col" className="p-3">#</th><th scope="col" className="p-3">Jugador</th><th scope="col" className="p-3">Estado</th><th scope="col" className="p-3 text-right">Puntos</th></tr></thead><tbody>{ranking.map((player, index) => { const answer = answers.find(item => item.player === player.id); return <tr key={player.id} className={`border-b border-black/15 last:border-0 ${index === 0 ? "bg-secondary/15" : "bg-white"}`}><td className="p-3 font-bold">{index + 1}</td><th scope="row" className="p-3"><span className="flex items-center gap-2"><span className={`flex size-8 shrink-0 items-center justify-center rounded-lg border border-black text-lg ${player.color}`}>{player.emoji}</span>{player.name}</span></th><td className="p-3"><span className={`inline-flex items-center gap-1 rounded-md border border-black px-2 py-1 text-[10px] font-semibold ${phase === "reveal" ? answer?.choice === current.correct ? "bg-accent" : "bg-secondary" : answer ? "bg-primary" : "bg-background"}`}>{phase === "reveal" ? answer ? answer.choice === current.correct ? "Acertó" : "Falló" : "Sin respuesta" : answer ? "Respondió" : "Pensando…"}</span></td><td className="p-3 text-right font-['JetBrains_Mono'] font-bold">{player.score.toLocaleString("es-ES")}</td></tr>; })}</tbody></table></div><div className="flex items-start gap-2 border-t-2 border-black bg-background p-4 text-[11px] leading-relaxed text-muted-foreground"><ShieldCheck size={16} className="shrink-0" />Solo los jugadores aparecen en esta tabla. Tu rol es presentar y dirigir la partida.</div></section>
              </div>
            </div>}

            {view === "game" && guestMode && <div className="mx-auto max-w-4xl py-3">
              <div className="mb-7 flex items-center justify-between"><span className="rounded-lg border-2 border-black bg-secondary px-3 py-2 text-xs font-bold">PREGUNTA {round + 1} DE {questions.length}</span><span className="flex items-center gap-2 text-xs font-bold"><Users size={17} /> {answers.length}/{participantCount} respuestas</span></div>
              <div className="mb-6 flex gap-2">{questions.map((item, index) => <span key={item.id} className={`h-2 flex-1 rounded-full border border-black ${index <= round ? "bg-primary" : "bg-white"}`} />)}</div>
              <section className={`${panel} p-4 text-center sm:p-10`}><div className={`mx-auto mb-3 flex size-14 sm:mb-6 sm:size-[76px] items-center justify-center rounded-full border-2 border-black font-['JetBrains_Mono'] text-3xl font-bold shadow-[3px_3px_0_#000] ${phase === "reveal" ? "bg-accent" : remaining <= 5 ? "bg-destructive" : "bg-secondary"}`} aria-label={`${Math.ceil(remaining)} segundos restantes`}>{phase === "reveal" ? <Check size={32} /> : Math.ceil(remaining)}</div><h1 className="text-xl font-extrabold leading-snug sm:text-4xl">{current.text}</h1><p className="mt-4 text-xs text-muted-foreground">{phase === "reveal" ? "¡Respuestas reveladas! Cada segundo cuenta." : "Una respuesta correcta. Confía en lo que sabes."}</p></section>
              {guestMode && phase === "answering" && myAnswer ? <section role="status" className={`${panel} mt-6 p-8 text-center`}><span className="mx-auto flex size-16 items-center justify-center rounded-2xl border-2 border-black bg-primary shadow-[3px_3px_0_#000]"><CheckCheck size={32} /></span><h2 className="mt-5 text-2xl font-extrabold">¡Respuesta enviada!</h2><p className="mt-3 text-sm">Elegiste <strong>{current.options[myAnswer.choice]}</strong></p><p className="mt-2 text-xs text-muted-foreground">Ya hiciste tu jugada. Espera a que el resto termine.</p><div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-black bg-background px-4 py-2 text-xs font-bold"><Clock3 size={14} /> {answers.length}/{participantCount} han respondido</div></section> : <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">{current.options.map((option, index) => {
                const Shape = shapes[index]; const mine = answers.find(answer => answer.player === 0); const isCorrect = phase === "reveal" && current.correct === index;
                return <button key={index} disabled={phase === "reveal" || !!mine || remaining <= 0} onClick={() => { const elapsed = Date.now() - startedAt; if (elapsed >= current.time * 1000) return; setAnswers(previous => previous.some(answer => answer.player === 0) ? previous : [...previous, { player: 0, choice: index, elapsed }]); }} className={`flex min-h-[88px] min-w-0 flex-col items-start gap-2 rounded-xl border-2 border-black p-3 text-left sm:min-h-[100px] sm:flex-row sm:items-center sm:gap-4 sm:p-5 shadow-[4px_4px_0_#000] transition-all enabled:hover:-translate-y-1 enabled:active:translate-y-0 enabled:active:shadow-none ${optionColors[index]} ${phase === "reveal" && !isCorrect ? "opacity-45" : ""} ${mine?.choice === index ? "ring-3 ring-black ring-offset-4 ring-offset-background" : ""}`}><Shape size={25} className="shrink-0" /><span className="min-w-0 flex-1 break-words text-sm font-bold sm:text-base">{option}</span>{isCorrect ? <Check size={25} /> : mine?.choice === index ? <span className="rounded-md border border-black bg-white px-2 py-1 text-[10px] font-bold">TU ELECCIÓN</span> : null}</button>;
              })}</div>}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><div className="flex min-w-0 flex-wrap items-center gap-2">{players.slice(0, 8).map((player, index) => <span key={index} title={`${player.name}: ${answers.some(answer => answer.player === index) ? "respondió" : "pensando"}`} className={`flex size-9 items-center justify-center rounded-full border-2 border-black text-lg ${answers.some(answer => answer.player === index) ? player.color : "bg-white opacity-40"}`}>{player.emoji}</span>)}{participantCount > 8 && <span className="text-xs font-bold">+{participantCount - 8}</span>}<span className="ml-2 text-xs font-semibold">{answers.length}/{participantCount}</span></div><div className="text-xs font-semibold" aria-live="polite">{phase === "answering" ? answers.some(answer => answer.player === 0) ? "¡Recibida! Esperando al equipo…" : "Tu turno. ¡El tiempo vuela!" : `${answers.filter(answer => answer.choice === current.correct).length} de ${participantCount} acertaron`}</div></div>
              {phase === "reveal" && (guestMode ? <section role="status" className={`${panel} mt-7 overflow-hidden`}><div className={`flex flex-wrap items-center justify-between gap-4 border-b-2 border-black p-5 ${roundPoints > 0 ? "bg-accent" : "bg-secondary"}`}><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl border-2 border-black bg-white">{roundPoints > 0 ? <Check size={25} /> : myAnswer ? <X size={25} /> : <Clock3 size={25} />}</span><div><h2 className="text-xl font-extrabold">{roundPoints > 0 ? "¡La clavaste!" : myAnswer ? "Esta se escapó" : "¡Se acabó el tiempo!"}</h2><p className="mt-1 text-xs">{roundPoints > 0 ? activeQuiz.scoring === "speed" ? "Saber está bien. Saber rápido está mejor." : "Un acierto, mil puntos. Así de sencillo." : "Una pregunta no define la partida. ¡Sigue jugando!"}</p></div></div><span className="font-['JetBrains_Mono'] text-2xl font-bold">+{roundPoints} pts</span></div><div className="p-5"><p className="text-sm">La correcta: <strong>{current.options[current.correct]}</strong></p><div className="mt-4 flex flex-wrap gap-3"><span className="rounded-lg border border-black bg-background px-3 py-2 text-xs font-bold"><Trophy size={14} className="mr-1 inline" /> Posición {myRank}.ª</span><span className="rounded-lg border border-black bg-background px-3 py-2 text-xs font-bold">{myStats.score.toLocaleString("es-ES")} puntos totales</span>{myAnswer && <span className="rounded-lg border border-black bg-background px-3 py-2 text-xs font-bold">{(myAnswer.elapsed / 1000).toFixed(1)} s en responder</span>}</div><p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 size={14} /> {round + 1 < questions.length ? `Siguiente pregunta en ${advanceIn} s…` : `El podio llega en ${advanceIn} s…`}</p></div></section> : <div className={`${panel} mt-7 flex flex-wrap items-center justify-between gap-4 p-5`}><div><p className="font-bold">{answers.find(answer => answer.player === 0)?.choice === current.correct ? "¡Eso es! Una respuesta de campeón." : answers.some(answer => answer.player === 0) ? "¡Casi! La próxima es tuya." : "¡Se acabó el tiempo!"}</p><p className="mt-1 text-xs text-muted-foreground">Vas {ranking.findIndex(player => player.id === 0) + 1}.º · {ranking.find(player => player.id === 0)?.score.toLocaleString("es-ES")} puntos acumulados</p></div><button onClick={() => round + 1 < questions.length ? beginRound(round + 1) : setView("podium")} className={`${button} bg-primary text-sm`}>{round + 1 < questions.length ? "Siguiente pregunta" : "Ver el podio"}<ArrowRight size={17} /></button></div>)}
            </div>}

            {view === "podium" && <div className="mx-auto max-w-3xl py-4 text-center"><span className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-secondary px-3 py-1 text-xs font-bold"><Flag size={14} /> PARTIDA COMPLETADA</span><h1 className="mt-5 text-3xl font-extrabold sm:text-5xl">Aquí hay mucho nivel<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">{title} · El conocimiento gana. La diversión, también.</p>
              {guestMode && <div className={`${panel} mt-7 flex flex-wrap items-center gap-4 p-5 text-left`}><span className="flex size-14 items-center justify-center rounded-xl border-2 border-black bg-secondary text-3xl">{avatar}</span><div className="flex-1"><h2 className="text-lg font-extrabold">{myRank === 1 ? `¡La corona es tuya, ${nickname}!` : `¡Bien jugado, ${nickname}!`}</h2><p className="mt-1 text-xs text-muted-foreground">{myStats.correct} de {questions.length} aciertos · {Math.round(myStats.correct / questions.length * 100)} % de precisión</p></div><div className="text-right"><p className="font-['JetBrains_Mono'] text-xl font-bold">{myStats.score.toLocaleString("es-ES")} pts</p><p className="mt-1 text-xs font-bold">Puesto {myRank} de {participantCount}</p></div></div>}
              <div className="mx-auto mt-10 flex max-w-lg items-end justify-center gap-2 px-0 sm:gap-3 sm:px-2">{[1, 0, 2].filter(rank => rank < ranking.length).map((rank, position) => <div key={rank} className="flex min-w-0 flex-1 flex-col items-center"><div className="relative mb-4"><span className={`flex size-16 items-center justify-center rounded-2xl border-2 border-black ${ranking[rank].color} text-4xl shadow-[3px_3px_0_#000]`}>{ranking[rank].emoji}</span>{rank === 0 && <Crown size={30} className="absolute -right-3 -top-6 -rotate-12 fill-secondary" />}</div><p className="w-full break-words text-xs font-bold [overflow-wrap:anywhere] sm:text-sm">{ranking[rank].name}</p><p className="mb-3 mt-1 text-xs font-semibold">{ranking[rank].score.toLocaleString("es-ES")} pts</p><div className={`flex w-full justify-center rounded-t-xl border-2 border-b-0 border-black pt-5 font-['Bricolage_Grotesque'] text-4xl font-extrabold ${position === 1 ? "h-36 bg-secondary" : position === 0 ? "h-24 bg-primary" : "h-18 bg-accent"}`}>{rank + 1}</div></div>)}</div>
              <section className={`${panel} relative max-h-[70dvh] overflow-y-auto overscroll-contain text-left`}><h2 className="border-b-2 border-black bg-background px-6 py-4 text-base font-bold">La clasificación completa</h2>{ranking.map((player, index) => <div key={player.id} className={`flex items-center gap-2 border-b border-black/15 px-3 py-4 last:border-0 sm:gap-4 sm:px-5 ${guestMode && player.id === 0 ? "bg-secondary/20" : "bg-white"}`}><span className="w-5 text-sm font-bold">{index + 1}</span><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-black text-xl ${player.color}`}>{player.emoji}</span><span className="min-w-0 flex-1 break-words text-sm font-bold">{player.name}{guestMode && player.id === 0 && <span className="ml-2 rounded border border-black px-1.5 py-0.5 text-[9px]">TÚ</span>}</span><span className="hidden text-xs text-muted-foreground sm:block">{player.correct}/{questions.length} aciertos</span><span className="min-w-20 text-right font-['JetBrains_Mono'] text-sm font-bold">{player.score.toLocaleString("es-ES")} <span className="text-[10px]">pts</span></span></div>)}</section><div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap"><button onClick={guestMode ? () => { setResults([]); setAnswers([]); setJoined(0); setRound(0); setView("lobby"); } : openLobby} className={`${button} bg-primary`}><RotateCcw size={18} /> {guestMode ? "Volver a la sala" : "La revancha"}</button><button onClick={guestMode ? enterGuest : reset} className={`${button} bg-white`}>{guestMode ? <Gamepad2 size={17} /> : <Pencil size={17} />} {guestMode ? "Unirme a otra partida" : "Volver al editor"}</button></div>
            </div>}

            <footer className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-black/20 pt-5 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><Zap size={12} /> Hecho para aprender, jugar y compartir un momento agradable</span><span>De 2 a 50 jugadores · 1 corona</span></footer>
          </div>
        </main>
      </div>
      {notice && <div role="status" className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-max max-w-[90vw] -translate-x-1/2 rounded-xl border-2 border-black bg-secondary px-5 py-4 text-sm font-semibold shadow-[4px_4px_0_#000]">{notice}</div>}
      {showHelp && <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/40 p-3 sm:p-5" onClick={() => setShowHelp(false)}><section role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={event => event.stopPropagation()} className={`${panel} max-h-[85dvh] w-full max-w-md overflow-y-auto overscroll-contain p-5 sm:p-7`}><div className="flex items-center justify-between"><h2 id="help-title" className="text-2xl font-extrabold">Las reglas del club</h2><button autoFocus onClick={() => setShowHelp(false)} aria-label="Cerrar ayuda" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 hover:bg-background sm:min-h-0 sm:min-w-0"><X size={22} /></button></div><ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-relaxed"><li>El anfitrión crea el quiz, inicia la partida y supervisa el juego. No responde ni aparece en la clasificación.</li><li>La sala admite de 2 a 50 jugadores, sin contar al anfitrión. Puedes comenzar con cualquier cantidad dentro de ese rango. En esta demo los demás jugadores son bots. El PIN es ilustrativo: todo sucede en este dispositivo.</li><li>Los jugadores responden antes de que termine el tiempo. {activeQuiz.scoring === "speed" ? "Cada acierto da entre 500 y 1.000 puntos: cuanto más rápido, mejor." : "Cada respuesta correcta suma 1.000 puntos, sin bonus por velocidad."} Fallar o no responder da 0.</li><li>El anfitrión ve el estado de las respuestas y la tabla de posiciones. Cada pregunta termina al responder todos o agotarse el tiempo. Tras {activeQuiz.revealTime} segundos de corrección, el juego avanza automáticamente. En caso de empate, prevalece el orden de entrada.</li></ol><p className="mt-5 text-xs text-muted-foreground">Puedes elegir 10, 20 o 30 segundos por pregunta o personalizar entre 5 y 180. Los ajustes y quizzes viven en memoria y se restablecen al recargar.</p><button onClick={() => setShowHelp(false)} className={`${button} mt-6 w-full bg-primary`}>¡Entendido! <Zap size={16} /></button></section></div>}
    </div>
  );
}
