import React, { useState, useEffect, useId, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Timer, Compass, HeartPulse, ArrowLeft, Play, Pause, RotateCcw,
  CheckCircle2, Volume2, X, Lock, Trophy, Bell, Calendar, Clock, Flame, ChevronDown, BookOpen,
  Headphones, Users, MessageSquare, Send, CornerDownRight, Circle, Star, User, Award, ShieldCheck
} from 'lucide-react';
import logoImage from './logo.png';
import fondoImage from './fondo-meditacion.png';
import primerosPasosBg from './Primeros pasos.jpg';
import gongBg from './Gong.jpg';

// Importaciones directas de Firebase para evitar errores
import { auth, loginWithGoogle, db } from './firebase';
import { ref, onValue, set, remove, onDisconnect } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const SECCIONES = [
  {
    id: 'pasos',
    number: '01',
    title: 'Primeros pasos',
    subtitle: 'INICIO • FUNDAMENTOS',
    icon: Sparkles,
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
  },
  {
    id: 'timer',
    number: '02',
    title: 'Temporizador',
    subtitle: 'TIEMPO • SILENCIO',
    icon: Timer,
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    id: 'guiadas',
    number: '03',
    title: 'Meditaciones',
    subtitle: 'VOZ • GUÍA INTERIOR',
    icon: Compass,
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
  },
  {
    id: 'calma',
    number: '04',
    title: 'Calma y claridad',
    subtitle: 'PAZ • EQUILIBRIO',
    icon: HeartPulse,
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
  },
  {
    id: 'comunidad',
    number: '05',
    title: 'Comunidad',
    subtitle: 'SANGHA • EN VIVO',
    icon: Users,
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.45)',
  },
];

const LECCIONES_INICIALES = [
  { id: 1, titulo: '01. La postura y el espacio', duracion: 3, completado: false, frase: 'La postura firme y cómoda sostiene la quietud de la mente.' },
  { id: 2, titulo: '02. La respiración consciente', duracion: 5, completado: false, frase: 'Cada inhalación trae presencia; cada exhalación, serenidad.' },
  { id: 3, titulo: '03. Observar los pensamientos', duracion: 7, completado: false, frase: 'Los pensamientos son como nubes en el cielo: déjalos pasar.' },
  { id: 4, titulo: '04. Calmar la mente ansiosa', duracion: 8, completado: false, frase: 'En el centro de la tormenta habita un refugio de calma interior.' },
  { id: 5, titulo: '05. Anclar la presencia', duracion: 10, completado: false, frase: 'El presente es el único momento donde la vida realmente sucede.' },
];

const CATALOGO_MEDITACIONES = [
  { id: 'cuerpo', titulo: 'Atención Corporal', eje: 'Anclaje en las Sensaciones', color: '#EC4899', descripcion: 'Recorrido consciente del cuerpo para liberar tensiones y enraizar la presencia.' },
  { id: 'respiracion', titulo: 'Respiración Consciente', eje: 'Calma y Enfoque', color: '#3B82F6', descripcion: 'Cultivo de la concentración continua siguiendo la inhalación y exhalación.' },
  { id: 'impermanencia', titulo: 'Observación de la Impermanencia', eje: 'Claridad y Perspectiva', color: '#A855F7', descripcion: 'Reconocer el flujo natural de los pensamientos y sensaciones sin apego.' },
  { id: 'metta', titulo: 'Bondad Amorosa (Metta)', eje: 'Apertura del Corazón', color: '#10B981', descripcion: 'Cultivo de deseos sinceros de bienestar hacia uno mismo y hacia los demás.' },
];

const CRONOGRAMA_DEFAULT = {
  0: { id: 'cuerpo', duracion: 15 },
  1: { id: 'respiracion', duracion: 20 },
  2: { id: 'impermanencia', duracion: 20 },
  3: { id: 'respiracion', duracion: 15 },
  4: { id: 'cuerpo', duracion: 20 },
  5: { id: 'metta', duracion: 30 },
  6: { id: 'metta', duracion: 30 },
};

const ARTICULOS_CALMA = [
  {
    id: 'impermanencia-diaria',
    categoria: 'Reflexión',
    tipo: 'lectura',
    titulo: 'Comprender la impermanencia en la vida cotidiana',
    duracionLectura: '3 min de lectura',
    resumen: 'Aceptar que las situaciones, emociones y pensamientos son transitorios libera a la mente de la resistencia inútil.',
    contenido: [
      'Cuando nos oponemos al cambio, generamos una tensión silenciosa pero constante. La enseñanza tradicional sobre la impermanencia (Anicca) no invita a la apatía, sino a una profunda apreciación del instante presente.',
      'Al observar cómo una emoción intensa surge, alcanza su punto máximo y luego se disuelve de forma natural, aprendemos a no identificarnos ciegamente con ella.',
      'Sugerencia de práctica cotidiana: La próxima vez que experimentes impaciencia o incomodidad, recuerda en silencio: "Esto también pasará". Permítete habitar el espacio sin reaccionar de inmediato.'
    ],
    cita: 'La paz no surge al controlar las olas del mar, sino al aprender a navegar en ellas.'
  },
  {
    id: 'respiracion-ancla',
    categoria: 'Fundamentos',
    tipo: 'lectura',
    titulo: 'Por qué la respiración es el ancla principal',
    duracionLectura: '4 min de lectura',
    resumen: 'La respiración sucede siempre en el tiempo presente. Volver a ella es la forma más directa de regresar al cuerpo.',
    contenido: [
      'Nuestra mente tiende a vagar entre recuerdos del pasado y proyecciones del futuro. Sin embargo, el cuerpo solo puede respirar en este preciso momento.',
      'Al prestar atención a las sensaciones físicas del aire entrando y saliendo por las fosas nasales o el vientre, creamos un puente inmediato entre el pensamiento y la realidad física.',
      'No se trata de forzar el aire, sino de observar el ritmo natural del cuerpo tal como es.'
    ],
    cita: 'Respirar es el acto más simple y transformador que realizamos a cada segundo.'
  },
  {
    id: 'charla-reactividad',
    categoria: 'Charla Contemplativa',
    tipo: 'audio',
    titulo: 'Del impulso a la pausa consciente',
    duracionLectura: '6 min de audio',
    resumen: 'Charla breve sobre el espacio que existe entre un estímulo y nuestra respuesta.',
    contenido: [
      'Entre el estímulo que recibimos del entorno y nuestra respuesta posterior existe un breve espacio de libertad. Es en ese espacio donde reside nuestra capacidad de elegir la ecuanimidad.',
      'Escucha esta breve reflexión guiada para cultivar la pausa consciente antes de reaccionar ante situaciones desafiantes.'
    ],
    cita: 'En la pausa habita nuestra verdadera libertad.'
  }
];

const USUARIOS_CONECTADOS = [];
const COMENTARIOS_INICIALES = [];

const RECONOCIMIENTOS_LOGROS = [
  { id: 1, titulo: 'Constancia', desc: '1 semana meditando de forma continua', icono: Star, desbloqueado: false, color: '#F59E0B' },
  { id: 2, titulo: 'Mente Constante', desc: '4 semanas consecutivas acumuladas', icono: Trophy, desbloqueado: false, color: '#EC4899' },
  { id: 3, titulo: 'Guardián del Silencio', desc: '100 minutos meditando en quietud', icono: ShieldCheck, desbloqueado: false, color: '#3B82F6' },
  { id: 4, titulo: 'Sendero Completo', desc: '3 meses cultivando la práctica diaria', icono: Award, desbloqueado: false, color: '#A855F7' },
];

const SONIDOS_OPCIONES = [
  { id: 'cuenco', nombre: 'Cuenco Tibetano (432Hz)', freq: 432, tipo: 'sine' },
  { id: 'campana', nombre: 'Campana Zen (528Hz)', freq: 528, tipo: 'sine' },
  { id: 'gong', nombre: 'Gong Profundo (108Hz)', freq: 108, tipo: 'triangle' },
  { id: 'ninguno', nombre: 'Silencio', freq: 0, tipo: 'none' },
];

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const CAPAS_PETALOS = [
  { cantidad: 12, escala: 1.1, offsetRot: 0 },
  { cantidad: 12, escala: 0.85, offsetRot: 15 },
  { cantidad: 8, escala: 0.6, offsetRot: 22.5 },
];

const reproducirSonido = (tipoSonidoId = 'cuenco', repeticiones = 1) => {
  if (tipoSonidoId === 'ninguno') return;
  const config = SONIDOS_OPCIONES.find(s => s.id === tipoSonidoId) || SONIDOS_OPCIONES[0];

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    for (let r = 0; r < repeticiones; r++) {
      const startTime = ctx.currentTime + r * 2.5; 
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = config.tipo;
      osc.frequency.setValueAtTime(config.freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.4, startTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 6.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 6.0);
    }
  } catch (e) {
    console.log("Audio Web no disponible:", e);
  }
};

const PetaloLotoAnimado = memo(({ anguloBase, color, escalaCapas, delay }) => {
  const gradId = `grad-${useId().replace(/:/g, '')}`;

  return (
    <motion.div
      className="absolute origin-bottom pointer-events-none"
      style={{
        width: 32,
        height: 90,
        bottom: '50%',
        willChange: 'transform',
      }}
      initial={{ rotate: anguloBase * 0.4, scale: escalaCapas * 0.15, opacity: 0 }}
      animate={{ rotate: anguloBase, scale: escalaCapas, opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <svg viewBox="0 0 54 145" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.05" />
            <stop offset="50%" stopColor={color} stopOpacity="0.55" />
            <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M 27,145 C 2,100 -2,60 14,20 C 20,5 25,0 27,0 C 29,0 34,5 40,20 C 56,60 52,100 27,145 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5"
        />
      </svg>
    </motion.div>
  );
});

const FlorLoto = memo(({ color }) => {
  return (
    <motion.div
      className="absolute w-48 h-48 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      style={{ willChange: 'transform, opacity' }}
    >
      {CAPAS_PETALOS.map((capa, idxCapa) =>
        Array.from({ length: capa.cantidad }).map((_, i) => (
          <PetaloLotoAnimado
            key={`petalo-${idxCapa}-${i}`}
            anguloBase={i * (360 / capa.cantidad) + capa.offsetRot}
            color={color}
            escalaCapas={capa.escala}
            delay={idxCapa * 0.1 + i * 0.015}
          />
        ))
      )}

      <motion.div
        animate={{ scale: [0.9, 1.2, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-8 h-8 rounded-full opacity-90"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 25px ${color}`,
          willChange: 'transform',
        }}
      />
    </motion.div>
  );
});

const LotoIconoNodo = ({ completado, bloqueado }) => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 transition-all duration-500">
    {completado ? (
      <g>
        <circle cx="50" cy="50" r="38" fill="rgba(236,72,153,0.18)" />
        <path d="M 50 68 C 28 68 15 58 12 48 C 25 45 42 55 50 68 Z" fill="#DB2777" opacity="0.8" />
        <path d="M 50 68 C 72 68 85 58 88 48 C 75 45 58 55 50 68 Z" fill="#DB2777" opacity="0.8" />
        <path d="M 50 65 C 30 62 20 42 24 30 C 38 35 46 50 50 65 Z" fill="#F472B6" />
        <path d="M 50 65 C 70 62 80 42 76 30 C 62 35 54 50 50 65 Z" fill="#F472B6" />
        <path d="M 50 20 C 40 32 38 52 50 65 C 62 52 60 32 50 20 Z" fill="#FDF2F8" />
        <circle cx="50" cy="55" r="4.5" fill="#FBBF24" />
      </g>
    ) : bloqueado ? (
      <g fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
        <circle cx="50" cy="50" r="30" fill="rgba(0,0,0,0.3)" />
      </g>
    ) : (
      <g fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
        <path d="M 50 22 C 35 38 32 60 50 78 C 68 60 65 38 50 22 Z" fill="rgba(255,255,255,0.08)" />
        <path d="M 50 35 C 38 48 36 62 50 78 C 64 62 62 48 50 35 Z" />
        <circle cx="50" cy="74" r="2.5" fill="rgba(255,255,255,0.6)" />
      </g>
    )}
  </svg>
);

const SelectorSonidoZen = ({ titulo, seleccionadoId, onChangeSonido }) => {
  const [abierto, setAbierto] = useState(false);
  const sonidoActual = SONIDOS_OPCIONES.find(s => s.id === seleccionadoId) || SONIDOS_OPCIONES[0];

  return (
    <div className="relative flex flex-col gap-1.5 w-full">
      <span className="text-[10px] font-mono text-white/60 uppercase flex items-center gap-1.5">
        <Bell className="w-3.5 h-3.5 text-blue-400" /> {titulo}
      </span>

      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full bg-slate-900/90 border border-white/20 hover:border-blue-400/50 text-white text-xs rounded-xl p-3 flex items-center justify-between transition-all backdrop-blur-md cursor-pointer"
      >
        <span className="font-medium truncate">{sonidoActual.nombre}</span>
        <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform duration-300 ${abierto ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0b0f1d]/95 border border-blue-500/30 rounded-2xl p-1.5 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1 overflow-hidden"
          >
            {SONIDOS_OPCIONES.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChangeSonido(option.id);
                  setAbierto(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  option.id === seleccionadoId
                    ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span>{option.nombre}</span>
                {option.id === seleccionadoId && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [enInicio, setEnInicio] = useState(true);
  const [seccionAbierta, setSeccionAbierta] = useState(null);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [seArrastro, setSeArrastro] = useState(false);

  const [user, setUser] = useState(null);

const [usuariosPracticando, setUsuariosPracticando] = useState([]);

  // Escuchar en tiempo real quiénes están practicando
  useEffect(() => {
    const statusRef = ref(db, 'practicantes_activos');
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listaUsuarios = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setUsuariosPracticando(listaUsuarios);
      } else {
        setUsuariosPracticando([]);
      }
    });
  }, []);

  const registrarPracticaActiva = (estaPracticando) => {
    if (!user) return;
    const userStatusRef = ref(db, `practicantes_activos/${user.uid}`);
    
    if (estaPracticando) {
      set(userStatusRef, {
        email: user.email,
        nombre: user.displayName || "Practicante",
        foto: user.photoURL || logoImage,
        estado: 'Meditando',
        timestamp: Date.now()
      });
      onDisconnect(userStatusRef).remove();
    } else {
      remove(userStatusRef);
    }
  };

  const [diasPracticados, setDiasPracticados] = useState(() => {
    const guardado = localStorage.getItem('armoniosa_dias_practicados');
    return guardado !== null ? JSON.parse(guardado) : [];
  });

  const [rachaSemanas, setRachaSemanas] = useState(() => {
    const guardado = localStorage.getItem('armoniosa_racha_semanas');
    return guardado !== null ? JSON.parse(guardado) : 0;
  });

  const [cronogramaSemanal, setCronogramaSemanal] = useState(() => {
    const guardado = localStorage.getItem('armoniosa_cronograma');
    return guardado !== null ? JSON.parse(guardado) : CRONOGRAMA_DEFAULT;
  });

  const [comentarios, setComentarios] = useState(() => {
    const guardado = localStorage.getItem('armoniosa_comentarios');
    return guardado !== null ? JSON.parse(guardado) : COMENTARIOS_INICIALES;
  });

  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);
  const [fraseInspiradora, setFraseInspiradora] = useState(null);
  const [abrirPerfilModal, setAbrirPerfilModal] = useState(false);

  // ESTADOS DEL TEMPORIZADOR
  const [minutosSeleccionados, setMinutosSeleccionados] = useState(10);
  const [tiempoRestante, setTiempoRestante] = useState(10 * 60);
  const [corriendoTimer, setCorriendoTimer] = useState(false);
  const [sonidoInicio, setSonidoInicio] = useState('cuenco');
  const [repeticionesInicio, setRepeticionesInicio] = useState(1);
  const [sonidoFin, setSonidoFin] = useState('cuenco');
  const [repeticionesFin, setRepeticionesFin] = useState(2);
  const [modoManual, setModoManual] = useState(false);

  // ESTADOS DE MEDITACIONES GUIADAS
  const [meditacionGuiadaActiva, setMeditacionGuiadaActiva] = useState(null);
  const [reproduciendoGuiada, setReproduciendoGuiada] = useState(false);
  const [tiempoGuiadaRestante, setTiempoGuiadaRestante] = useState(0);
  const [editandoDiaIdx, setEditandoDiaIdx] = useState(null);
  const [tecnicaPreSeleccionada, setTecnicaPreSeleccionada] = useState(null);

  // ESTADOS DE CALMA Y CLARIDAD
  const [filtroCalma, setFiltroCalma] = useState('Todos');
  const [articuloLecturaActivo, setArticuloLecturaActivo] = useState(null);

  // ESTADOS DE COMUNIDAD
  const [nuevoComentarioTexto, setNuevoComentarioTexto] = useState('');
  const [respondiendoAId, setRespondiendoAId] = useState(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');

  // GUARDADO AUTOMÁTICO EN LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('armoniosa_lecciones', JSON.stringify(lecciones));
  }, [lecciones]);

  useEffect(() => {
    localStorage.setItem('armoniosa_minutos_totales', JSON.stringify(minutosTotales));
  }, [minutosTotales]);

  useEffect(() => {
    localStorage.setItem('armoniosa_dias_practicados', JSON.stringify(diasPracticados));
  }, [diasPracticados]);

  useEffect(() => {
    localStorage.setItem('armoniosa_racha_semanas', JSON.stringify(rachaSemanas));
  }, [rachaSemanas]);

  useEffect(() => {
    localStorage.setItem('armoniosa_cronograma', JSON.stringify(cronogramaSemanal));
  }, [cronogramaSemanal]);

  useEffect(() => {
    localStorage.setItem('armoniosa_comentarios', JSON.stringify(comentarios));
  }, [comentarios]);

  const activa = SECCIONES[indiceActivo];
  const CARD_WIDTH = 145;

  const completadasCount = lecciones.filter(l => l.completado).length;
  const porcentajeProgreso = Math.round((completadasCount / lecciones.length) * 100);

  // Lógica del Temporizador Libres
  useEffect(() => {
    let intervalo = null;
    if (corriendoTimer && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        setTiempoRestante(prev => prev - 1);
      }, 1000);
    } else if (corriendoTimer && tiempoRestante === 0) {
      setCorriendoTimer(false);
      reproducirSonido(sonidoFin, repeticionesFin);
      
      const hoyIdx = (new Date().getDay() + 6) % 7;
      setMinutosTotales(prev => prev + minutosSeleccionados);
      setDiasPracticados(prev => prev.includes(hoyIdx) ? prev : [...prev, hoyIdx]);
      setFraseInspiradora("Práctica de meditación completada. Tu mente se encuentra en serenidad.");
    }
    return () => clearInterval(intervalo);
  }, [corriendoTimer, tiempoRestante, minutosSeleccionados, sonidoFin, repeticionesFin]);

  // Lógica de Reproducción de Meditaciones Guiadas
  useEffect(() => {
    let intervalo = null;
    if (reproduciendoGuiada && tiempoGuiadaRestante > 0) {
      intervalo = setInterval(() => {
        setTiempoGuiadaRestante(prev => prev - 1);
      }, 1000);
    } else if (reproduciendoGuiada && tiempoGuiadaRestante === 0) {
      setReproduciendoGuiada(false);
      reproducirSonido('cuenco', 2);

      if (meditacionGuiadaActiva) {
        const hoyIdx = (new Date().getDay() + 6) % 7;
        setMinutosTotales(prev => prev + meditacionGuiadaActiva.duracion);
        setDiasPracticados(prev => prev.includes(hoyIdx) ? prev : [...prev, hoyIdx]);
        setFraseInspiradora(`Has completado la práctica de ${meditacionGuiadaActiva.titulo}. Cultiva esta atención a lo largo de tu día.`);
      }
    }
    return () => clearInterval(intervalo);
  }, [reproduciendoGuiada, tiempoGuiadaRestante, meditacionGuiadaActiva]);

  const iniciarTimer = () => {
    if (!corriendoTimer) {
      if (tiempoRestante === 0) setTiempoRestante(minutosSeleccionados * 60);
      reproducirSonido(sonidoInicio, repeticionesInicio);
      setCorriendoTimer(true);
    }
  };

  const pausarTimer = () => setCorriendoTimer(false);

  const reiniciarTimer = () => {
    setCorriendoTimer(false);
    setTiempoRestante(minutosSeleccionados * 60);
  };

  const cambiarTiempo = (mins) => {
    const minsVal = Math.max(1, parseInt(mins) || 10);
    setMinutosSeleccionados(minsVal);
    setTiempoRestante(minsVal * 60);
    setCorriendoTimer(false);
  };

  const cambiarSonidoInicio = (id) => {
    setSonidoInicio(id);
    reproducirSonido(id, 1);
  };

  const cambiarSonidoFin = (id) => {
    setSonidoFin(id);
    reproducirSonido(id, 1);
  };

  const iniciarGuiadaConDuracion = (meditacion, duracionMins) => {
    const medObjFinal = { ...meditacion, duracion: duracionMins };
    setMeditacionGuiadaActiva(medObjFinal);
    setTiempoGuiadaRestante(duracionMins * 60);
    setTecnicaPreSeleccionada(null);
    setReproduciendoGuiada(true);
    reproducirSonido('cuenco', 1);
  };

  const agregarNuevoComentario = (e) => {
    e.preventDefault();
    if (!nuevoComentarioTexto.trim()) return;

    const nuevoCom = {
      id: Date.now(),
      autor: 'Tú (Practicante)',
      foto: logoImage,
      tiempo: 'Ahora mismo',
      texto: nuevoComentarioTexto,
      respuestas: []
    };

    setComentarios([nuevoCom, ...comentarios]);
    setNuevoComentarioTexto('');
    reproducirSonido('cuenco', 1);
  };

  const agregarRespuestaComentario = (comentarioId) => {
    if (!respuestaTexto.trim()) return;

    const nuevaResp = {
      id: Date.now(),
      autor: 'Tú (Practicante)',
      foto: logoImage,
      tiempo: 'Ahora mismo',
      texto: respuestaTexto
    };

    setComentarios(prev => prev.map(c => {
      if (c.id === comentarioId) {
        return { ...c, respuestas: [...c.respuestas, nuevaResp] };
      }
      return c;
    }));

    setRespondiendoAId(null);
    setRespuestaTexto('');
    reproducirSonido('cuenco', 1);
  };

  const formatearTiempo = (segs) => {
    const m = Math.floor(segs / 60);
    const s = segs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDragStart = () => setSeArrastro(false);
  const handleDrag = (e, info) => { if (Math.abs(info.offset.x) > 5) setSeArrastro(true); };
  const handleDragEnd = (e, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    let nuevoIndice = indiceActivo;

    if ((offset < -35 || velocity < -200) && indiceActivo < SECCIONES.length - 1) {
      nuevoIndice = indiceActivo + 1;
    } else if ((offset > 35 || velocity > 200) && indiceActivo > 0) {
      nuevoIndice = indiceActivo - 1;
    }

    setIndiceActivo(nuevoIndice);
    setTimeout(() => setSeArrastro(false), 50);
  };

  const alternarCompletado = (id) => {
    const leccionObj = lecciones.find(l => l.id === id);
    const estariaCompletando = !leccionObj.completado;

    setLecciones(prev => prev.map(l => l.id === id ? { ...l, completado: !l.completado } : l));
    setLeccionSeleccionada(null);

    if (estariaCompletando) {
      reproducirSonido('cuenco', 1);
      setMinutosTotales(prev => prev + leccionObj.duracion);
      const hoyIdx = (new Date().getDay() + 6) % 7;
      setDiasPracticados(prev => prev.includes(hoyIdx) ? prev : [...prev, hoyIdx]);
      setFraseInspiradora(leccionObj.frase);
    }
  };

  const hoyIndexSemana = (new Date().getDay() + 6) % 7;
  const configPracticaHoy = cronogramaSemanal[hoyIndexSemana];
  const practicaHoyBase = CATALOGO_MEDITACIONES.find(m => m.id === configPracticaHoy.id) || CATALOGO_MEDITACIONES[0];
  const practicaHoyObj = { ...practicaHoyBase, duracion: configPracticaHoy.duracion };

  const articulosFiltrados = ARTICULOS_CALMA.filter(art => {
    if (filtroCalma === 'Todos') return true;
    if (filtroCalma === 'Lecturas') return art.tipo === 'lectura';
    if (filtroCalma === 'Charlas') return art.tipo === 'audio';
    return art.categoria === filtroCalma;
  });

  return (
    <div className="relative h-screen w-full bg-[#030305] text-white select-none font-sans overflow-hidden">
      
      {/* PANTALLA DE BIENVENIDA / SPLASH */}
      <AnimatePresence>
        {enInicio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 z-50 bg-[#030305] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            <div 
              className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-50 scale-105"
              style={{ backgroundImage: `url(${fondoImage})` }}
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#030305]/40 via-[#030305]/60 to-[#030305]/85" />

            <div className="relative z-10 flex flex-col items-center max-w-xs w-full gap-4 my-auto">
              <span className="text-[11px] font-mono tracking-[0.3em] text-pink-400/80 uppercase">
                ArmoniosaMnte
              </span>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
                transition={{ 
                  scale: { duration: 0.8, ease: 'easeOut' },
                  opacity: { duration: 0.8 },
                  y: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="w-full flex justify-center my-1"
              >
                <img
                  src={logoImage}
                  alt="Meditación ArmoniosaMnte"
                  className="w-48 h-48 object-contain drop-shadow-[0_15px_35px_rgba(59,130,246,0.3)]"
                />
              </motion.div>

              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-1"
              >
                <h1 className="text-xl font-light tracking-wide text-slate-100">Encuentra tu paz interior</h1>
                <p className="text-[11px] text-slate-200 leading-relaxed px-2 drop-shadow-md">
                  Un espacio de calma, respiración y claridad diseñado para ti.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-full flex flex-col gap-2.5 mt-2"
              >
                <button
                 onClick={loginWithGoogle}
                  className="w-full py-3 px-4 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium tracking-wide transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] cursor-pointer"
                >
                  Iniciar sesión con Google
                </button>

                <button
                  onClick={() => setEnInicio(false)}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium tracking-wide transition-all backdrop-blur-md cursor-pointer"
                >
                  Continuar como invitado
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-1"
              >
                <p className="text-[11px] text-slate-200 drop-shadow-md">
                  ¿Eres usuario nuevo?{' '}
                  <button 
                    onClick={() => setEnInicio(false)}
                    className="text-[#3B82F6] hover:text-blue-400 font-medium underline underline-offset-4 cursor-pointer"
                  >
                    Suscríbete aquí
                  </button>
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VISTA DETALLADA: SECCIÓN 01 "PRIMEROS PASOS" */}
      <AnimatePresence>
        {seccionAbierta === 'pasos' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-40 bg-[#03050c] flex flex-col justify-between items-center overflow-hidden"
          >
            <div 
              className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-65 scale-105"
              style={{ backgroundImage: `url(${primerosPasosBg})` }}
            />

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020307]/70 via-[#03050c]/40 to-[#020307]/85" />

            <header className="relative z-20 w-full max-w-md flex flex-col gap-3 px-6 pt-10 pb-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSeccionAbierta(null)}
                  className="flex items-center gap-2 text-xs text-white/90 hover:text-white bg-black/40 hover:bg-black/60 px-3.5 py-2 rounded-full border border-white/20 transition-all backdrop-blur-md cursor-pointer shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Menú</span>
                </button>

                <div className="text-right">
                  <h3 className="text-xs font-light tracking-widest uppercase text-pink-400 drop-shadow">Primeros pasos</h3>
                  <p className="text-[9px] text-white/60 tracking-wider">SENDERO DE APRENDIZAJE</p>
                </div>
              </div>

              <div className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 backdrop-blur-md flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/70 font-medium flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-pink-400" /> Progreso del Sendero
                  </span>
                  <span className="text-pink-300 font-mono font-semibold">{completadasCount} de {lecciones.length} completadas ({porcentajeProgreso}%)</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentajeProgreso}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </header>

            <main className="relative z-10 w-full max-w-md flex-1 overflow-y-auto px-6 py-4 scrollbar-none flex flex-col items-center">
              <div className="relative w-full max-w-[280px] my-auto py-6 flex flex-col items-center gap-11">
                
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0 stroke-pink-500/40 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" strokeWidth="2.5" strokeDasharray="6 6">
                  <path d="M 70 50 Q 210 120 210 180 T 70 310 T 210 440 T 140 560" fill="none" />
                </svg>

                {lecciones.map((leccion, i) => {
                  const estaDesbloqueado = i === 0 || lecciones[i - 1].completado;
                  const estaBloqueado = !estaDesbloqueado;

                  const posicionesClass = [
                    'self-start ml-4',
                    'self-end mr-4',
                    'self-start ml-8',
                    'self-end mr-8',
                    'self-center'
                  ];

                  const posicion = posicionesClass[i % posicionesClass.length];

                  return (
                    <motion.div
                      key={leccion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`relative z-10 flex flex-col items-center group ${
                        estaBloqueado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                      } ${posicion}`}
                      onClick={() => {
                        if (estaDesbloqueado) {
                          setLeccionSeleccionada(leccion);
                          reproducirSonido('cuenco', 1);
                        }
                      }}
                    >
                      <div className="relative flex items-center justify-center">
                        <div 
                          className={`absolute w-20 h-20 rounded-full transition-all duration-700 ${
                            leccion.completado
                              ? 'bg-pink-500/30 blur-md animate-pulse'
                              : estaDesbloqueado
                              ? 'bg-cyan-500/10 blur-sm'
                              : 'transparent'
                          }`} 
                        />

                        <div 
                          className={`relative p-3.5 rounded-full transition-all duration-500 backdrop-blur-md ${
                            leccion.completado
                              ? 'bg-gradient-to-b from-pink-900/80 to-pink-950/90 border-2 border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.7)] scale-105'
                              : estaDesbloqueado
                              ? 'bg-slate-900/80 border border-white/20 hover:border-pink-400/50 shadow-lg'
                              : 'bg-black/60 border border-white/10'
                          }`}
                        >
                          <LotoIconoNodo completado={leccion.completado} bloqueado={estaBloqueado} />

                          {leccion.completado && (
                            <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full p-0.5 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}

                          {estaBloqueado && (
                            <div className="absolute -top-1 -right-1 bg-black/80 text-white/50 rounded-full p-1 border border-white/20">
                              <Lock className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>

                      <span className={`text-[10px] tracking-wider mt-2.5 font-medium px-3 py-1 rounded-full border backdrop-blur-md shadow-lg ${
                        leccion.completado
                          ? 'text-pink-100 bg-pink-950/70 border-pink-500/40'
                          : estaDesbloqueado
                          ? 'text-white/80 bg-black/60 border-white/15'
                          : 'text-white/30 bg-black/80 border-white/5'
                      }`}>
                        {leccion.titulo}
                      </span>
                    </motion.div>
                  );
                })}

              </div>
            </main>

            <AnimatePresence>
              {fraseInspiradora && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                >
                  <div className="bg-[#0b0f1d] border border-pink-500/40 p-6 rounded-3xl max-w-xs text-center flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
                    <div className="p-3 bg-pink-500/20 text-pink-400 rounded-full">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono text-pink-400 tracking-widest uppercase">Reflexión Zen</h4>
                      <p className="text-sm font-light text-white italic mt-2 leading-relaxed">
                        "{fraseInspiradora}"
                      </p>
                    </div>
                    <button
                      onClick={() => setFraseInspiradora(null)}
                      className="w-full py-2.5 rounded-xl bg-pink-600 text-white text-xs font-medium hover:bg-pink-500 transition-all cursor-pointer shadow-md"
                    >
                      Continuar el camino
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {leccionSeleccionada && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute bottom-0 left-0 right-0 z-50 bg-[#080b14]/95 border-t border-pink-500/30 p-6 rounded-t-[32px] backdrop-blur-xl flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.9)]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-pink-400 uppercase">INSTRUCCIÓN DE MEDITACIÓN</span>
                      <h3 className="text-base font-light text-white mt-0.5">{leccionSeleccionada.titulo}</h3>
                    </div>
                    <button 
                      onClick={() => setLeccionSeleccionada(null)}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/90 font-medium">Audio guiado</p>
                        <p className="text-[10px] text-white/40">{leccionSeleccionada.duracion} min</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => reproducirSonido('cuenco', 1)}
                      className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_15px_rgba(236,72,153,0.4)]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Reproducir</span>
                    </button>
                  </div>

                  <button
                    onClick={() => alternarCompletado(leccionSeleccionada.id)}
                    className={`w-full py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      leccionSeleccionada.completado
                        ? 'bg-pink-950/40 border-pink-500/50 text-pink-300'
                        : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/15'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{leccionSeleccionada.completado ? 'Marcado como completado' : 'Marcar como completado'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VISTA DETALLADA: SECCIÓN 02 "TEMPORIZADOR" */}
      <AnimatePresence>
        {seccionAbierta === 'timer' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-40 bg-[#03050c] flex flex-col justify-between items-center overflow-hidden"
          >
            <div 
              className={`absolute inset-0 pointer-events-none bg-cover bg-center transition-all duration-1000 ${
                corriendoTimer ? 'opacity-30 scale-100' : 'opacity-85 scale-105'
              }`}
              style={{ backgroundImage: `url(${gongBg})` }}
            />
            
            <div 
              className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
                corriendoTimer 
                  ? 'bg-black/85' 
                  : 'bg-gradient-to-b from-[#020307]/80 via-[#03050c]/30 to-[#020307]/90'
              }`} 
            />

            {!corriendoTimer && (
              <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative z-20 w-full max-w-md flex flex-col gap-3 px-6 pt-10 pb-2 shrink-0"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSeccionAbierta(null)}
                    className="flex items-center gap-2 text-xs text-white/90 hover:text-white bg-black/40 hover:bg-black/60 px-3.5 py-2 rounded-full border border-white/20 transition-all backdrop-blur-md cursor-pointer shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Menú</span>
                  </button>

                  <div className="text-right">
                    <h3 className="text-xs font-light tracking-widest uppercase text-blue-400 drop-shadow">Temporizador</h3>
                    <p className="text-[9px] text-white/60 tracking-wider">TIEMPO • SILENCIO</p>
                  </div>
                </div>

                <div className="w-full bg-black/60 border border-blue-500/20 rounded-2xl p-3.5 backdrop-blur-md flex flex-col gap-2.5 shadow-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-blue-300 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" /> Meditación Semanal
                    </span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-white/70 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> {diasPracticados.length} días
                      </span>
                      <span className="text-white/70 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> {minutosTotales} min
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-2 pt-1">
                    {DIAS_SEMANA.map((dia, idx) => {
                      const praticoHoy = diasPracticados.includes(idx);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <span className="text-[9px] font-mono text-white/50">{dia}</span>
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                              praticoHoy 
                                ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.9)] scale-110 font-bold' 
                                : 'bg-white/5 border border-white/10 text-white/30'
                            }`}
                          >
                            {praticoHoy ? <CheckCircle2 className="w-3.5 h-3.5" /> : '•'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.header>
            )}

            <main className="relative z-10 w-full max-w-md flex-1 overflow-y-auto px-6 py-2 scrollbar-none flex flex-col items-center justify-start gap-8">
              
              <div className="relative flex flex-col items-center justify-center py-4 my-auto shrink-0">
                <motion.div 
                  className={`relative w-56 h-56 rounded-full flex flex-col items-center justify-center border transition-all duration-700 ${
                    corriendoTimer 
                      ? 'border-blue-400/50 shadow-[0_0_70px_rgba(59,130,246,0.35)] bg-black/40' 
                      : 'border-white/20 bg-black/40 backdrop-blur-md'
                  }`}
                  animate={corriendoTimer ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="text-5xl font-extralight tracking-wider font-mono text-white drop-shadow-lg">
                    {formatearTiempo(tiempoRestante)}
                  </span>
                  <span className="text-[10px] text-blue-300 font-mono tracking-widest uppercase mt-2">
                    {corriendoTimer ? 'En meditación' : 'En pausa'}
                  </span>
                </motion.div>

                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={reiniciarTimer}
                    className="p-3.5 rounded-full bg-white/10 border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur-md"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={corriendoTimer ? pausarTimer : iniciarTimer}
                    className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-[0_4px_25px_rgba(59,130,246,0.5)] transition-all cursor-pointer"
                  >
                    {corriendoTimer ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{corriendoTimer ? 'Pausar' : 'Iniciar Práctica'}</span>
                  </button>
                </div>
              </div>

              {!corriendoTimer && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full bg-black/60 border border-white/15 rounded-3xl p-4.5 backdrop-blur-xl flex flex-col gap-4 mb-6 shadow-2xl shrink-0"
                >
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-blue-300 uppercase block mb-2.5">
                      Duración de la práctica
                    </label>

                    <div className="grid grid-cols-5 gap-2">
                      {[10, 15, 20, 30].map(mins => (
                        <button
                          key={mins}
                          onClick={() => {
                            setModoManual(false);
                            cambiarTiempo(mins);
                          }}
                          className={`py-3 rounded-2xl text-xs font-mono font-medium transition-all cursor-pointer border ${
                            !modoManual && minutosSeleccionados === mins
                              ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] font-bold scale-105'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}

                      <button
                        onClick={() => setModoManual(true)}
                        className={`py-3 rounded-2xl text-xs font-mono font-medium transition-all cursor-pointer border flex items-center justify-center ${
                          modoManual 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] font-bold scale-105' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        +Manual
                      </button>
                    </div>

                    {modoManual && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-3 mt-3 p-3 rounded-2xl bg-slate-900/80 border border-blue-400/40"
                      >
                        <span className="text-xs text-blue-300 font-mono">Ingresar minutos:</span>
                        <input 
                          type="number" 
                          min="1"
                          max="240"
                          value={minutosSeleccionados}
                          onChange={(e) => cambiarTiempo(e.target.value)}
                          className="w-20 bg-black/60 border border-white/20 text-center text-white text-sm font-mono rounded-xl py-1.5 focus:outline-none focus:border-blue-400"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3.5 pt-3 border-t border-white/10">
                    
                    <SelectorSonidoZen
                      titulo="Sonido de Inicio"
                      seleccionadoId={sonidoInicio}
                      onChangeSonido={cambiarSonidoInicio}
                    />

                    <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] text-white/60 font-mono">Toques al Iniciar:</span>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(n => (
                          <button
                            key={n}
                            onClick={() => setRepeticionesInicio(n)}
                            className={`w-8 h-7 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                              repeticionesInicio === n 
                                ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md' 
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                            }`}
                          >
                            {n}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <SelectorSonidoZen
                      titulo="Sonido de Cierre"
                      seleccionadoId={sonidoFin}
                      onChangeSonido={cambiarSonidoFin}
                    />

                    <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] text-white/60 font-mono">Toques al Finalizar:</span>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(n => (
                          <button
                            key={n}
                            onClick={() => setRepeticionesFin(n)}
                            className={`w-8 h-7 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                              repeticionesFin === n 
                                ? 'bg-blue-600 border-blue-400 text-white font-bold shadow-md' 
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                            }`}
                          >
                            {n}x
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                </motion.div>
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VISTA DETALLADA: SECCIÓN 03 "MEDITACIONES GUIADAS" */}
      <AnimatePresence>
        {seccionAbierta === 'guiadas' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-40 bg-[#03050c] flex flex-col justify-between items-center overflow-hidden"
          >
            <div 
              className={`absolute inset-0 pointer-events-none bg-cover bg-center transition-all duration-1000 ${
                reproduciendoGuiada ? 'opacity-30 scale-100' : 'opacity-70 scale-105'
              }`}
              style={{ backgroundImage: `url(${fondoImage})` }}
            />

            <div 
              className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
                reproduciendoGuiada 
                  ? 'bg-black/90' 
                  : 'bg-gradient-to-b from-[#020307]/80 via-[#03050c]/40 to-[#020307]/90'
              }`} 
            />

            {!reproduciendoGuiada && (
              <header className="relative z-20 w-full max-w-md flex items-center justify-between px-6 pt-10 pb-2 shrink-0">
                <button
                  onClick={() => setSeccionAbierta(null)}
                  className="flex items-center gap-2 text-xs text-white/90 hover:text-white bg-black/40 hover:bg-black/60 px-3.5 py-2 rounded-full border border-white/20 transition-all backdrop-blur-md cursor-pointer shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Menú</span>
                </button>

                <div className="text-right">
                  <h3 className="text-xs font-light tracking-widest uppercase text-purple-400 drop-shadow">Meditaciones</h3>
                  <p className="text-[9px] text-white/60 tracking-wider">VOZ • GUÍA INTERIOR</p>
                </div>
              </header>
            )}

            <main className="relative z-10 w-full max-w-md flex-1 overflow-y-auto px-6 py-3 scrollbar-none flex flex-col gap-5">
              
              {reproduciendoGuiada ? (
                <div className="my-auto flex flex-col items-center justify-center text-center gap-6">
                  <motion.div 
                    className="w-56 h-56 rounded-full border-2 border-purple-500/50 flex flex-col items-center justify-center bg-purple-950/20 backdrop-blur-md shadow-[0_0_60px_rgba(168,85,247,0.35)]"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="text-5xl font-extralight font-mono text-white tracking-wider">
                      {formatearTiempo(tiempoGuiadaRestante)}
                    </span>
                    <span className="text-[10px] text-purple-300 font-mono tracking-widest uppercase mt-2">
                      {meditacionGuiadaActiva?.titulo}
                    </span>
                  </motion.div>

                  <div className="flex flex-col gap-1 max-w-xs">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">EJE GRADUAL</span>
                    <p className="text-xs text-white/70 italic">{meditacionGuiadaActiva?.eje}</p>
                  </div>

                  <button
                    onClick={() => {
                      setReproduciendoGuiada(false);
                      reproducirSonido('cuenco', 1);
                    }}
                    className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-[0_4px_25px_rgba(168,85,247,0.5)] transition-all cursor-pointer mt-2"
                  >
                    Finalizar Sesión
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-b from-purple-900/40 to-black/70 border border-purple-500/30 rounded-3xl p-5 backdrop-blur-xl shadow-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Práctica para hoy
                      </span>
                      <span className="text-[10px] font-mono text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                        {DIAS_SEMANA[hoyIndexSemana]}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white">{practicaHoyObj.titulo}</h3>
                      <p className="text-[11px] text-purple-200/80 font-mono mt-0.5">{practicaHoyObj.eje} • {practicaHoyObj.duracion} min</p>
                      <p className="text-xs text-white/70 mt-2 leading-relaxed">{practicaHoyObj.descripcion}</p>
                    </div>

                    <button
                      onClick={() => setTecnicaPreSeleccionada(practicaHoyObj)}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer mt-1"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Iniciar Práctica de Hoy</span>
                    </button>
                  </div>

                  <div className="bg-black/60 border border-white/15 rounded-3xl p-4.5 backdrop-blur-xl flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" /> Mi Plan Semanal
                      </span>
                      <span className="text-[9px] text-white/40">Toca un día para cambiarlo</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {DIAS_SEMANA.map((dia, idx) => {
                        const configSem = cronogramaSemanal[idx];
                        const medObj = CATALOGO_MEDITACIONES.find(m => m.id === configSem.id) || CATALOGO_MEDITACIONES[0];
                        const esHoy = idx === hoyIndexSemana;

                        return (
                          <button
                            key={idx}
                            onClick={() => setEditandoDiaIdx(editandoDiaIdx === idx ? null : idx)}
                            className={`flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer ${
                              esHoy 
                                ? 'bg-purple-900/60 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)] scale-105' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-[9px] font-mono text-white/60 mb-1">{dia}</span>
                            <div 
                              className="w-3 h-3 rounded-full mb-1" 
                              style={{ backgroundColor: medObj.color }} 
                            />
                            <span className="text-[7px] font-mono text-white/90 truncate w-full text-center">
                              {configSem.duracion}m
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {editandoDiaIdx !== null && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-900/95 border border-purple-500/30 rounded-2xl p-3 flex flex-col gap-2.5 mt-1"
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-purple-300 font-mono">
                              Configurar para el {DIAS_SEMANA[editandoDiaIdx]}:
                            </span>
                            <button onClick={() => setEditandoDiaIdx(null)} className="text-white/50 hover:text-white">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {CATALOGO_MEDITACIONES.map(m => (
                              <div
                                key={m.id}
                                className={`p-2 rounded-xl border flex flex-col gap-2 transition-all ${
                                  cronogramaSemanal[editandoDiaIdx].id === m.id
                                    ? 'bg-purple-600/30 border-purple-400 text-white'
                                    : 'bg-white/5 border-white/10 text-white/70'
                                }`}
                              >
                                <span className="text-[10px] font-medium leading-tight">{m.titulo}</span>
                                
                                <div className="flex gap-1">
                                  {[15, 20, 30].map(dur => (
                                    <button
                                      key={dur}
                                      onClick={() => {
                                        setCronogramaSemanal(prev => ({
                                          ...prev,
                                          [editandoDiaIdx]: { id: m.id, duracion: dur }
                                        }));
                                        setEditandoDiaIdx(null);
                                      }}
                                      className={`flex-1 py-1 rounded text-[8px] font-mono transition-all cursor-pointer border ${
                                        cronogramaSemanal[editandoDiaIdx].id === m.id && cronogramaSemanal[editandoDiaIdx].duracion === dur
                                          ? 'bg-purple-500 text-white font-bold border-purple-300'
                                          : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
                                      }`}
                                    >
                                      {dur}m
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-mono tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Todas las Meditaciones
                    </span>

                    <div className="flex flex-col gap-2.5 pb-6">
                      {CATALOGO_MEDITACIONES.map(m => (
                        <div 
                          key={m.id}
                          className="bg-black/50 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between gap-3 hover:border-purple-500/40 transition-all"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                              <h4 className="text-xs font-semibold text-white">{m.titulo}</h4>
                            </div>
                            <p className="text-[10px] text-purple-300/80 font-mono">{m.eje}</p>
                            <p className="text-[11px] text-white/60 leading-tight mt-0.5">{m.descripcion}</p>
                          </div>

                          <button
                            onClick={() => setTecnicaPreSeleccionada(m)}
                            className="p-3 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer shrink-0"
                            title="Seleccionar duración"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </main>

            <AnimatePresence>
              {tecnicaPreSeleccionada && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 10 }}
                    className="bg-[#0c0d1a] border border-purple-500/40 p-6 rounded-3xl max-w-xs w-full text-center flex flex-col gap-4 shadow-[0_0_50px_rgba(168,85,247,0.3)]"
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div className="text-left">
                        <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">SELECCIONAR DURACIÓN</span>
                        <h4 className="text-sm font-semibold text-white leading-tight">{tecnicaPreSeleccionada.titulo}</h4>
                      </div>
                      <button 
                        onClick={() => setTecnicaPreSeleccionada(null)}
                        className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-white/70 italic leading-relaxed">
                      Elige el tiempo de tu práctica de hoy:
                    </p>

                    <div className="grid grid-cols-3 gap-2.5 my-1">
                      {[15, 20, 30].map(mins => (
                        <button
                          key={mins}
                          onClick={() => iniciarGuiadaConDuracion(tecnicaPreSeleccionada, mins)}
                          className="py-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 hover:bg-purple-600 hover:border-purple-400 text-white font-mono font-bold text-sm shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                        >
                          <span>{mins}</span>
                          <span className="text-[8px] font-normal text-purple-200">min</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* VISTA DETALLADA: SECCIÓN 04 "CALMA Y CLARIDAD" */}
      <AnimatePresence>
        {seccionAbierta === 'calma' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-40 bg-[#03050c] flex flex-col justify-between items-center overflow-hidden"
          >
            <div 
              className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-60 scale-105"
              style={{ backgroundImage: `url(${fondoImage})` }}
            />

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020307]/80 via-[#03050c]/50 to-[#020307]/90" />

            <header className="relative z-20 w-full max-w-md flex items-center justify-between px-6 pt-10 pb-2 shrink-0">
              <button
                onClick={() => setSeccionAbierta(null)}
                className="flex items-center gap-2 text-xs text-white/90 hover:text-white bg-black/40 hover:bg-black/60 px-3.5 py-2 rounded-full border border-white/20 transition-all backdrop-blur-md cursor-pointer shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Menú</span>
              </button>

              <div className="text-right">
                <h3 className="text-xs font-light tracking-widest uppercase text-emerald-400 drop-shadow">Calma y claridad</h3>
                <p className="text-[9px] text-white/60 tracking-wider">PAZ • EQUILIBRIO</p>
              </div>
            </header>

            <main className="relative z-10 w-full max-w-md flex-1 overflow-y-auto px-6 py-3 scrollbar-none flex flex-col gap-4">
              
              <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                {['Todos', 'Lecturas', 'Fundamentos', 'Charlas'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltroCalma(f)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                      filtroCalma === f
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : 'bg-black/50 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 pb-8">
                {articulosFiltrados.map(art => (
                  <motion.div
                    key={art.id}
                    layout
                    onClick={() => {
                      setArticuloLecturaActivo(art);
                      if (art.tipo === 'audio') reproducirSonido('cuenco', 1);
                    }}
                    className="bg-black/60 border border-white/15 rounded-3xl p-5 backdrop-blur-xl hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col gap-2.5 group shadow-xl"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        {art.tipo === 'audio' ? <Headphones className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                        {art.categoria}
                      </span>
                      <span className="text-white/40">{art.duracionLectura}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                      {art.titulo}
                    </h3>

                    <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                      {art.resumen}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[10px] text-emerald-400 font-medium">
                      <span>{art.tipo === 'audio' ? 'Escuchar charla' : 'Leer artículo completo'}</span>
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </main>

            <AnimatePresence>
              {articuloLecturaActivo && (
                <motion.div
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute inset-0 z-50 bg-[#060a12] flex flex-col justify-between overflow-hidden"
                >
                  <header className="relative z-20 w-full max-w-md mx-auto flex items-center justify-between px-6 pt-10 pb-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      {articuloLecturaActivo.tipo === 'audio' ? <Headphones className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      {articuloLecturaActivo.categoria}
                    </span>

                    <button
                      onClick={() => setArticuloLecturaActivo(null)}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </header>

                  <main className="relative z-10 w-full max-w-md mx-auto flex-1 overflow-y-auto px-6 py-6 scrollbar-none flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-light text-white leading-snug">{articuloLecturaActivo.titulo}</h2>
                      <p className="text-[10px] font-mono text-white/40 mt-2">{articuloLecturaActivo.duracionLectura}</p>
                    </div>

                    <div className="p-4 bg-emerald-950/30 border-l-2 border-emerald-400 rounded-r-2xl italic text-xs text-emerald-200/90 leading-relaxed">
                      "{articuloLecturaActivo.cita}"
                    </div>

                    <div className="flex flex-col gap-4 text-xs text-white/80 leading-relaxed font-light">
                      {articuloLecturaActivo.contenido.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>

                    {articuloLecturaActivo.tipo === 'audio' && (
                      <div className="mt-4 p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <Headphones className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs text-white font-medium">Charla Contemplativa</p>
                            <p className="text-[10px] text-white/50">Sonido ambiente de serenidad</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => reproducirSonido('cuenco', 1)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Escuchar</span>
                        </button>
                      </div>
                    )}
                  </main>

                  <footer className="relative z-20 w-full max-w-md mx-auto p-4 border-t border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-center">
                    <button
                      onClick={() => setArticuloLecturaActivo(null)}
                      className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-all cursor-pointer shadow-lg"
                    >
                      Volver a Calma y claridad
                    </button>
                  </footer>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* VISTA DETALLADA: SECCIÓN 05 "COMUNIDAD" */}
      <AnimatePresence>
        {seccionAbierta === 'comunidad' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-40 bg-[#03050c] flex flex-col justify-between items-center overflow-hidden"
          >
            <div 
              className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-60 scale-105"
              style={{ backgroundImage: `url(${fondoImage})` }}
            />

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020307]/80 via-[#03050c]/50 to-[#020307]/90" />

            <header className="relative z-20 w-full max-w-md flex items-center justify-between px-6 pt-10 pb-2 shrink-0">
              <button
                onClick={() => setSeccionAbierta(null)}
                className="flex items-center gap-2 text-xs text-white/90 hover:text-white bg-black/40 hover:bg-black/60 px-3.5 py-2 rounded-full border border-white/20 transition-all backdrop-blur-md cursor-pointer shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Menú</span>
              </button>

              <div className="text-right">
                <h3 className="text-xs font-light tracking-widest uppercase text-amber-400 drop-shadow">Comunidad</h3>
                <p className="text-[9px] text-white/60 tracking-wider">SANGHA • EN VIVO</p>
              </div>
            </header>

            <main className="relative z-10 w-full max-w-md flex-1 overflow-y-auto px-6 py-3 scrollbar-none flex flex-col gap-4.5">
              
              <div className="bg-gradient-to-b from-amber-950/40 to-black/70 border border-amber-500/30 rounded-3xl p-4.5 backdrop-blur-xl shadow-xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">
                      Practicando en este momento
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/60">{usuariosPracticando.length} meditando ahora</span>
                </div>

                {usuariosPracticando.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                    {usuariosPracticando.map(u => (
                      <div key={u.id} className="relative flex flex-col items-center shrink-0 group">
                        <div className="relative">
                          <img 
                            src={u.foto} 
                            alt={u.nombre}
                            className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/40 shadow-md" 
                          />
                          <Circle 
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full fill-current ${
                              u.estado === 'Meditando' ? 'text-emerald-400 stroke-black' : 'text-blue-400 stroke-black'
                            }`} 
                          />
                        </div>
                        <span className="text-[9px] font-mono text-white/70 mt-1">{u.nombre}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={agregarNuevoComentario} className="bg-black/60 border border-white/15 rounded-3xl p-4 backdrop-blur-xl flex flex-col gap-2.5 shadow-lg">
                <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Compartir una vivencia
                </span>

                <textarea
                  value={nuevoComentarioTexto}
                  onChange={(e) => setNuevoComentarioTexto(e.target.value)}
                  placeholder="¿Cómo fue tu práctica de hoy? Comparte tus sensaciones con la comunidad..."
                  rows="2"
                  className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar</span>
                  </button>
                </div>
              </form>

              <div className="flex flex-col gap-3 pb-8">
                {comentarios.map(c => (
                  <div key={c.id} className="bg-black/50 border border-white/10 rounded-3xl p-4 backdrop-blur-md flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={c.foto} alt={c.autor} className="w-8 h-8 rounded-full object-cover border border-amber-500/30" />
                        <div>
                          <h4 className="text-xs font-semibold text-white">{c.autor}</h4>
                          <span className="text-[9px] font-mono text-white/40">{c.tiempo}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setRespondiendoAId(respondiendoAId === c.id ? null : c.id)}
                        className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>Responder</span>
                      </button>
                    </div>

                    <p className="text-xs text-white/80 leading-relaxed pl-1">{c.texto}</p>

                    {c.respuestas.length > 0 && (
                      <div className="pl-4 border-l-2 border-amber-500/20 flex flex-col gap-2.5 mt-1">
                        {c.respuestas.map(r => (
                          <div key={r.id} className="flex flex-col gap-1 bg-white/5 p-2.5 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <img src={r.foto} alt={r.autor} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                              <span className="text-[11px] font-medium text-amber-200">{r.autor}</span>
                              <span className="text-[8px] font-mono text-white/30">{r.tiempo}</span>
                            </div>
                            <p className="text-[11px] text-white/70 pl-8">{r.texto}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {respondiendoAId === c.id && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                        <input
                          type="text"
                          value={respuestaTexto}
                          onChange={(e) => setRespuestaTexto(e.target.value)}
                          placeholder="Escribe una respuesta fraternal..."
                          className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
                        />
                        <button
                          onClick={() => agregarRespuestaComentario(c.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium cursor-pointer transition-all"
                        >
                          Enviar
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE MI PROGRESO / PERFIL */}
      <AnimatePresence>
        {abrirPerfilModal && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-[#060812] flex flex-col justify-between overflow-hidden"
          >
            <header className="relative z-20 w-full max-w-md mx-auto flex items-center justify-between px-6 pt-10 pb-4 border-b border-white/10 bg-black/50 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Nahuel Antu Tavora</h3>
                  <span className="text-[9px] font-mono text-pink-300">CULTIVADOR DE LA PRESENCIA</span>
                </div>
              </div>

              <button
                onClick={() => setAbrirPerfilModal(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <main className="relative z-10 w-full max-w-md mx-auto flex-1 overflow-y-auto px-6 py-5 scrollbar-none flex flex-col gap-5">
              
              {/* METRICAS PRINCIPALES */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold font-mono text-pink-400">{diasPracticados.length}</span>
                  <span className="text-[8px] font-mono text-white/50 uppercase mt-0.5">Días seguidos</span>
                </div>
                <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold font-mono text-blue-400">{minutosTotales}</span>
                  <span className="text-[8px] font-mono text-white/50 uppercase mt-0.5">Minutos acum.</span>
                </div>
                <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold font-mono text-amber-400">{rachaSemanas}</span>
                  <span className="text-[8px] font-mono text-white/50 uppercase mt-0.5">Semanas racha</span>
                </div>
              </div>

              {/* RECONOCIMIENTOS DE ESTRELLAS Y LOGROS */}
              <div className="bg-black/60 border border-white/15 rounded-3xl p-4.5 backdrop-blur-xl flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-pink-300 uppercase flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> Reconocimientos
                  </span>
                  <span className="text-[9px] font-mono text-white/40">
                    {RECONOCIMIENTOS_LOGROS.filter(l => l.desbloqueado).length} de {RECONOCIMIENTOS_LOGROS.length} completados
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {RECONOCIMIENTOS_LOGROS.map(l => {
                    const IconoLogro = l.icono;
                    return (
                      <div 
                        key={l.id}
                        className={`p-3 rounded-2xl border flex flex-col gap-1.5 transition-all ${
                          l.desbloqueado
                            ? 'bg-slate-900/80 border-white/20 shadow-md'
                            : 'bg-black/40 border-white/5 opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-1.5 rounded-lg text-white"
                            style={{ backgroundColor: l.desbloqueado ? `${l.color}33` : 'rgba(255,255,255,0.05)', color: l.color }}
                          >
                            <IconoLogro className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-white leading-tight">{l.titulo}</span>
                        </div>
                        <p className="text-[9px] text-white/60 leading-tight">{l.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CALENDARIO DE PRACTICA SEMANAL */}
              <div className="bg-black/60 border border-white/15 rounded-3xl p-4.5 backdrop-blur-xl flex flex-col gap-3">
                <span className="text-[10px] font-mono tracking-widest text-blue-300 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Registro de esta semana
                </span>

                <div className="flex justify-between items-center px-1 pt-1">
                  {DIAS_SEMANA.map((dia, idx) => {
                    const praticoHoy = diasPracticados.includes(idx);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-mono text-white/50">{dia}</span>
                        <div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                            praticoHoy 
                              ? 'bg-gradient-to-tr from-pink-500 to-amber-400 text-white shadow-[0_0_12px_rgba(236,72,153,0.8)] scale-105 font-bold' 
                              : 'bg-white/5 border border-white/10 text-white/30'
                          }`}
                        >
                          {praticoHoy ? <CheckCircle2 className="w-4 h-4" /> : '•'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </main>

            <footer className="relative z-20 w-full max-w-md mx-auto p-4 border-t border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-center">
              <button
                onClick={() => setAbrirPerfilModal(false)}
                className="w-full py-3 rounded-xl bg-pink-600 text-white text-xs font-medium hover:bg-pink-500 transition-all cursor-pointer shadow-lg"
              >
                Cerrar Mi Progreso
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APLICACIÓN PRINCIPAL (MENÚ / CARRIL DE TARJETAS) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: enInicio ? 0 : 1 }}
        className="h-full w-full flex flex-col justify-between items-center py-6"
      >
        {SECCIONES.map((s, i) => (
          <motion.div
            key={s.id}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${s.glowColor} 0%, rgba(3,3,5,0.98) 70%)`,
            }}
            initial={false}
            animate={{ opacity: i === indiceActivo ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        ))}

        {/* CABECERA SUPERIOR CON MI PROGRESO */}
        <header className="z-20 w-full max-w-md px-6 pt-2 flex items-center justify-between">
          <button
            onClick={() => setEnInicio(true)}
            className="text-[10px] font-mono tracking-widest text-white/40 hover:text-white uppercase transition-opacity cursor-pointer"
            title="Volver al inicio"
          >
            <span>ArmoniosaMnte</span>
          </button>

          <button
            onClick={() => {
              setAbrirPerfilModal(true);
            }}
            className="flex items-center gap-2 bg-black/50 hover:bg-black/70 border border-pink-500/30 hover:border-pink-400 px-3 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md group"
          >
            <div className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-400/40">
              <User className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-mono text-white/90 group-hover:text-pink-200">Mi Progreso</span>
            <Star className="w-3 h-3 text-amber-400 fill-current" />
          </button>
        </header>

        {/* ÁREA CENTRAL TÁCTIL */}
        <main className="relative w-full max-w-4xl my-auto flex items-center justify-center min-h-[340px]">

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <AnimatePresence>
              {!enInicio && !seccionAbierta && <FlorLoto key={activa.id} color={activa.color} />}
            </AnimatePresence>
          </div>

          {/* CARRIL TÁCTIL DE TARJETAS */}
          <div className="relative z-20 w-full flex items-center justify-center overflow-hidden h-72">
            <motion.div 
              className="flex items-center justify-center absolute cursor-grab active:cursor-grabbing touch-pan-y"
              drag="x"
              dragConstraints={{ left: -(SECCIONES.length - 1) * CARD_WIDTH, right: 0 }}
              dragElastic={0.15}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              animate={{ x: -indiceActivo * CARD_WIDTH }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              {SECCIONES.map((item, index) => {
                const Icono = item.icon;
                const esActiva = index === indiceActivo;
                const distancia = index - indiceActivo;

                const scale = esActiva ? 1 : 0.75;
                const opacity = esActiva ? 1 : Math.abs(distancia) === 1 ? 0.45 : 0;
                const pointerEvents = esActiva || Math.abs(distancia) === 1 ? 'auto' : 'none';

                return (
                  <motion.div
                    key={item.id}
                    onClick={() => {
                      if (!seArrastro) {
                        if (esActiva) {
                          setSeccionAbierta(item.id);
                        } else {
                          setIndiceActivo(index);
                        }
                      }
                    }}
                    className={`absolute w-32 h-60 rounded-[40px] px-3 py-5 flex flex-col justify-between items-center cursor-pointer border ${
                      esActiva
                        ? 'border-white/40 shadow-[0_15px_30px_rgba(0,0,0,0.5)]'
                        : 'border-white/10 bg-[#08080e]'
                    }`}
                    style={{
                      x: index * CARD_WIDTH,
                      background: esActiva
                        ? `linear-gradient(180deg, ${item.color}66 0%, rgba(8, 8, 14, 0.95) 100%)`
                        : 'rgba(6, 6, 10, 0.85)',
                      pointerEvents,
                      willChange: 'transform, opacity',
                    }}
                    animate={{ scale, opacity }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  >
                    <span className="text-[9px] font-mono tracking-widest text-white/40">{item.number}</span>

                    <div className="flex flex-col items-center justify-center my-auto gap-2">
                      <div className="p-2.5 rounded-full bg-white/10 border border-white/20 shadow-inner">
                        <Icono className="w-5 h-5 text-white" />
                      </div>

                      <div className="text-center">
                        <h2 className="text-sm font-semibold tracking-wide text-white leading-tight">{item.title}</h2>
                        <p className="text-[7px] font-bold tracking-widest text-white/40 mt-1 uppercase">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="w-4 h-1 rounded-full bg-white/20" />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </main>

        <footer className="z-10 text-center pb-2">
          <p className="text-[11px] text-white/20 tracking-widest">TOCA LA TARJETA CENTRAL PARA ENTRAR</p>
        </footer>
      </motion.div>
    </div>
  );
}