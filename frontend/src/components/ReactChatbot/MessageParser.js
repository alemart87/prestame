export const createMessageParser = () => {
  return class MessageParser {
    constructor(actionProvider, state) {
      this.actionProvider = actionProvider;
      this.state = state;
    }

    parse(message) {
      const cleanMessage = message.trim();
      
      if (cleanMessage) {
        // Agregar pequeño delay para simular procesamiento natural
        setTimeout(() => {
          this.actionProvider.handleUserMessage(cleanMessage);
        }, 300);
      }
    }
  }
}; 