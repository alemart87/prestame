import { createChatBotMessage } from 'react-chatbot-kit';
import { FiCpu, FiUser } from 'react-icons/fi';

const botName = 'Katupyry-IA';

const config = {
  botName: botName,
  initialMessages: [
    createChatBotMessage(`¡Hola! Soy ${botName}, tu asistente financiero. Estoy aquí para ayudarte a analizar tu perfil. ¿Comenzamos?`)
  ],
  customComponents: {
    header: () => (
      <div className="p-4 border-b border-white/10 bg-black/30 text-xl font-semibold text-white flex items-center">
        <FiCpu className="mr-3 text-indigo-400" />
        Asistente IA
      </div>
    ),
    botAvatar: (props) => (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
        <FiCpu className="text-white" />
      </div>
    ),
    userAvatar: (props) => (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
        <FiUser className="text-white" />
      </div>
    ),
  },
  customStyles: {
    // Contenedor principal
    outerContainer: {
      width: '100%',
      height: '100%',
      minHeight: '700px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '1rem',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    // Contenedor del chat
    chatContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      borderRadius: '1rem',
      display: 'flex',
      flexDirection: 'column',
    },
    // Contenedor de mensajes
    messageContainer: {
      flex: '1 1 auto',
      backgroundColor: 'rgba(0,0,0,0.1)',
      padding: '20px',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255,255,255,0.2) transparent',
    },
    // Mensaje del bot
    botMessageBox: {
      backgroundColor: 'rgba(79, 70, 229, 0.4)', // Indigo-600 con opacidad
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      maxWidth: '80%',
      marginBottom: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    // Mensaje del usuario
    userMessageBox: {
      backgroundColor: 'rgba(37, 99, 235, 0.4)', // Blue-600 con opacidad
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      maxWidth: '80%',
      marginBottom: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    // Formulario de entrada
    chatInputForm: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: '1rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    // Input
    chatInput: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      width: '100%',
      fontSize: '16px',
    },
    // Botón de envío
    chatButton: {
      backgroundColor: '#6366f1',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#4f46e5',
        transform: 'scale(1.05)',
      }
    },
  },
};

export default config; 