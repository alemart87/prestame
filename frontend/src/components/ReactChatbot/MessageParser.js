export const createMessageParser = () => {
  return class MessageParser {
    constructor(actionProvider, state) {
      this.actionProvider = actionProvider;
      this.state = state;
    }

    parse(message) {
      if (message) {
        this.actionProvider.handleUserMessage(message);
      }
    }
  }
}; 