actor ChatBot {
    // Types must match frontend exactly
    public type Message = {
        role: Text;
        content: Text;
        timestamp: Text;
    };

    public type ChatResponse = {
        response: Text;
        emotion: Text;
        intent: Text;
        persona: Text;
    };

    // Storage for all conversations
    private var conversations: [(Text, [Message])] = [];

    // Minimal chat function that just stores messages
    public shared func chat(
        messages: [Message],
        _ : Text, // language (unused)
        persona: Text,
        _ : { // userProfile (unused)
            recentEmotions: [Text];
            preferredPersona: Text;
        }
    ) : async ChatResponse {
        // Store the conversation (using first message as session ID for simplicity)
        let sessionId = if (messages.size() > 0) { messages[0].content } else { "default" };
        conversations := [(sessionId, messages)];
        
        // Return empty response - frontend will generate its own
        return {
            response = "";
            emotion = "neutral"; 
            intent = "stored";
            persona = persona;
        };
    };

    // Function to fetch stored conversations
    public query func getConversations() : async [(Text, [Message])] {
        conversations
    };
};