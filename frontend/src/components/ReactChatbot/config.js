import { createChatBotMessage } from 'react-chatbot-kit';
import { FiCpu, FiUser } from 'react-icons/fi';

const botName = 'Katupyry-IA';

const config = {
  botName: botName,
  initialMessages: [
    createChatBotMessage(`¡Hola! Soy Katupyry-IA, tu asistente financiero inteligente. Estoy aquí para conocerte mejor y ayudarte con tu análisis de fiabilidad. ¿Comenzamos?`)
  ],
  customComponents: {
    header: () => (
      <div className="p-4 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shadow-lg">
              <FiCpu className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Asistente IA</h3>
              <p className="text-indigo-200 text-xs">Análisis financiero inteligente</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">En línea</span>
          </div>
        </div>
      </div>
    ),
    botAvatar: (props) => (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-1 ring-black/20">
        <FiCpu className="text-white text-sm" />
      </div>
    ),
    userAvatar: (props) => (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg ring-1 ring-black/20">
        <FiUser className="text-white text-sm" />
      </div>
    ),
  },
  // Dejamos que el CSS controle todos los estilos para máxima flexibilidad.
  customStyles: {
    chatContainer: {
      backgroundColor: 'transparent',
    }
  }
};

export default config; 