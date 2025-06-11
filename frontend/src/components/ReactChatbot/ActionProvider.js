import { aiService } from '../../services/api';

export const createActionProvider = () => {
  return class ActionProvider {
    constructor(createChatBotMessage, setStateFunc, createClientMessage) {
      this.createChatBotMessage = createChatBotMessage;
      this.setState = setStateFunc;
      this.createClientMessage = createClientMessage;
    }

    handleUserMessage = async (message) => {
      try {
        // Inmediatamente después de recibir el mensaje, podrías mostrar un indicador de "escribiendo..."
        // (react-chatbot-kit no tiene uno nativo, pero se puede simular)
        
        const botReply = await aiService.sendMessage(message);
        
        const botMessage = this.createChatBotMessage(botReply);
        this.addMessageToState(botMessage);

      } catch (error) {
        console.error("Error communicating with AI service:", error);
        const errorMessage = this.createChatBotMessage(
          "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.",
          { widget: 'errorWidget' } // Podríamos crear un widget para errores
        );
        this.addMessageToState(errorMessage);
      }
    };

    addMessageToState = (message) => {
      this.setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, message],
      }));
    };
  }
}; 