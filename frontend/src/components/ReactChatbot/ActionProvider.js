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
        // Mostrar indicador de escritura
        const typingMessage = this.createChatBotMessage("", {
          loading: true,
          terminateLoading: true,
          withAvatar: true,
        });
        this.addMessageToState(typingMessage);
        
        const botReply = await aiService.sendMessage(message);
        
        // Remover mensaje de carga y agregar respuesta real
        this.setState((prevState) => ({
          ...prevState,
          messages: prevState.messages.slice(0, -1), // Remover último mensaje (loading)
        }));
        
        const botMessage = this.createChatBotMessage(botReply, {
          withAvatar: true,
        });
        this.addMessageToState(botMessage);

      } catch (error) {
        console.error("Error communicating with AI service:", error);
        
        // Remover mensaje de carga si existe
        this.setState((prevState) => ({
          ...prevState,
          messages: prevState.messages.filter(msg => !msg.loading),
        }));
        
        const errorMessage = this.createChatBotMessage(
          "🤖 Disculpa, estoy teniendo dificultades técnicas en este momento. Por favor, inténtalo de nuevo en unos segundos.",
          { 
            withAvatar: true,
            delay: 1000 
          }
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