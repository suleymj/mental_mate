// This is a generated Motoko binding.
// Please use `import service "ic:canister_id"` instead to call canisters on the IC if possible.

module {
  public type assistant_message = {
    content : ?Text;
    tool_calls : [
      {
        id : Text;
        function : { name : Text; arguments : [tool_call_argument] };
      }
    ];
  };
  public type backend_config = {
    #worker;
    #ollama;
    #openrouter : { api_key : Text };
  };
  public type chat_message_v0 = {
    content : Text;
    role : { #user; #assistant; #system_ };
  };
  public type chat_message_v1 = {
    #tool : { content : Text; tool_call_id : Text };
    #user : { content : Text };
    #assistant : assistant_message;
    #system_ : { content : Text };
  };
  public type chat_request_v0 = { model : Text; messages : [chat_message_v0] };
  public type chat_request_v1 = {
    model : Text;
    tools : ?[tool];
    messages : [chat_message_v1];
  };
  public type chat_response_v1 = { message : assistant_message };
  public type config = {
    workers_whitelist : { #all; #some : [Principal] };
    api_disabled : Bool;
  };
  public type parameter = {
    type_ : Text;
    properties : ?[property];
    required : ?[Text];
  };
  public type property = { enum : ?[Text]; type_ : Text; description : ?Text };
  public type tool = {
    #function : { name : Text; parameters : ?[parameter]; description : ?Text };
  };
  public type tool_call_argument = { value : Text; name : Text };
  public type Self = actor {
    v0_chat : shared chat_request_v0 -> async Text;
    v1_chat : shared chat_request_v1 -> async chat_response_v1;
  }
}
