import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../src/declarations/mentalmate_backend';

// Configure agent
export async function getChatbotActor() {
  const agent = new HttpAgent({ 
    host: process.env.NODE_ENV === 'production'
      ? 'https://ic0.app'
      : 'http://localhost:8000'
  });

  // Fetch root key for local development
  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey();
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId: process.env.NEXT_PUBLIC_CHATBOT_CANISTER_ID!
  });
}