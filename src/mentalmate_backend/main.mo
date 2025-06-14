import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Error "mo:base/Error";
import ExperimentalCycles "mo:base/ExperimentalCycles";

actor ChatBot {
    // Configuration - replace with your OpenAI key
    private let OPENAI_API_KEY = "your api key";
    private let OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    // Message type matching your frontend
    public type Message = {
        role: Text;
        content: Text;
    };

    // Response type matching frontend
    public type ChatResponse = {
        response: Text;
        emotion: Text;
        intent: Text;
        persona: Text;
    };

    // Simple JSON encoder
    module SimpleJSON {
        public func encodeMessage(msg : Message) : Text {
            "{\"role\":\"" # msg.role # "\",\"content\":\"" # escapeText(msg.content) # "\"}"
        };

        public func encodeMessages(msgs : [Message]) : Text {
            "[" # Text.join(",", Iter.map(msgs.vals(), encodeMessage)) # "]"
        };

        func escapeText(t : Text) : Text {
            Text.replace(Text.replace(t, "\"", "\\\""), "\n", "\\n")
        };
    };

    // Main chat function
    public shared func chat(
        messages: [Message],
        language: Text,
        persona: Text,
        userProfile: {
            recentEmotions: [Text];
            preferredPersona: Text;
        }
    ) : async ChatResponse {
        Debug.print("Processing chat request...");

        let requestBody = "{\"model\":\"gpt-4\",\"messages\":" 
            # SimpleJSON.encodeMessages(messages) 
            # ",\"temperature\":0.7}";

        try {
            // Make HTTP request using IC canister with cycles
            let http_request = actor("aaaaa-aa") : actor {
                http_request : HttpRequest -> async HttpResponse
            };
            
            let response = await (system http_request.http_request({
                method = "POST";
                url = OPENAI_URL;
                headers = [
                    {name = "Content-Type"; value = "application/json"},
                    {name = "Authorization"; value = "Bearer " # OPENAI_API_KEY}
                ];
                body = Text.encodeUtf8(requestBody);
                transform = null;
            }) with cycles 10_000_000);
            
            let responseBody = switch (Text.decodeUtf8(response.body)) {
                case (null) { 
                    Debug.print("Error decoding response");
                    return errorResponse(persona);
                };
                case (?text) { text };
            };

            Debug.print("OpenAI response: " # responseBody);

            // Simple response parser
            let content = extractContent(responseBody);
            
            return {
                response = content;
                emotion = "neutral";
                intent = "general";
                persona = persona;
            };

        } catch (e) {
            Debug.print("Error calling OpenAI: " # Error.message(e));
            return errorResponse(persona);
        };
    };

    func extractContent(responseBody : Text) : Text {
        // More robust text parsing
        let parts = Iter.toArray(Text.split(responseBody, #text "\"content\":\""));
        if (parts.size() > 1) {
            let contentPart = parts[1];
            let endQuote = Text.find(contentPart, #char '"');
            switch (endQuote) {
                case (?idx) { Text.substring(contentPart, 0, idx) };
                case null { contentPart };
            };
        } else {
            "No content found in response";
        }
    };

    func errorResponse(persona : Text) : ChatResponse {
        {
            response = "Sorry, I'm having trouble connecting to the AI service. Please try again later.";
            emotion = "neutral";
            intent = "error";
            persona = persona;
        }
    };

    // HTTP types (required for IC canister calls)
    public type HttpRequest = {
        method : Text;
        url : Text;
        headers : [HttpHeader];
        body : Blob;
        transform : ?TransformContext;
    };

    public type HttpResponse = {
        status_code : Nat16;
        headers : [HttpHeader];
        body : Blob;
        streaming_strategy : ?StreamingStrategy;
    };

    public type HttpHeader = {
        name : Text;
        value : Text;
    };

    public type TransformContext = {
        function : shared query TransformArgs -> async HttpResponse;
        context : Blob;
    };

    public type TransformArgs = {
        response : HttpResponse;
        context : Blob;
    };

    public type StreamingCallbackToken = {
        key : Text;
        index : Nat;
        content_encoding : Text;
    };

    public type StreamingCallbackResponse = {
        body : Blob;
        token : ?StreamingCallbackToken;
    };

    public type StreamingStrategy = {
        #Callback : {
            token : StreamingCallbackToken;
            callback : shared query StreamingCallbackToken -> async StreamingCallbackResponse;
        };
    };
};