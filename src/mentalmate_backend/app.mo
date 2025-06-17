import llm "canister:llm";
import LLM "canister:llm";
//import LLM "./llm";
import Array "mo:base/Array";

actor SimpleChatBot {
    public type Message = {
        role : Text; // "user" or "assistant"
        content : Text;
    };

    public type ChatResponse = {
        response : Text;
    };

    // Stores conversation history
    var conversationHistory : [LLM.chat_message_v0] = [];

    public shared func v0_chat(message : Text, _persona: Text) : async ChatResponse {
        // Create user message
        let userMessage : LLM.chat_message_v0 = {
            role = #user;
            content = message;
        };

        // Add to conversation history
        conversationHistory := Array.append(conversationHistory, [userMessage]);

        try {
            // Call LLM with conversation history
            let response = await llm.v0_chat({
                model = "llama3";
                messages = conversationHistory;
            });

            // Add assistant response to history
            let assistantMessage : LLM.chat_message_v0 = {
                role = #assistant;
                content = response;
            };
            conversationHistory := Array.append(conversationHistory, [assistantMessage]);

            // Return the response
            { response = response };
        } catch (_) {
            // Return error message if LLM call fails
            { response = "Sorry, I'm having trouble responding right now." };
        }
    };

    // Reset conversation history
    public shared func reset() : async () {
        conversationHistory := [];
    };
};
