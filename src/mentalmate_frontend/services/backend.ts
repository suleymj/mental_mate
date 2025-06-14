import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid'; // Required for IDL definition

// Interface for your backend canister
interface BackendCanister extends Record<string, any> {
  addMessage: (user: Principal, msg: string, fromUser: boolean) => Promise<void>;
  getMessages: (user: Principal) => Promise<ChatEntry[]>;
}

// Constants
const LOCAL_HOST = 'http://localhost:4943';
const IC_HOST = 'https://ic0.app';
const IDENTITY_PROVIDER = 'https://identity.ic0.app/#authorize';

let authClient: AuthClient | null = null;
let actor: BackendCanister | null = null;

// Initialize AuthClient
export const initializeAuth = async (): Promise<boolean> => {
  try {
    authClient = await AuthClient.create();
    const authenticated = await authClient.isAuthenticated();

    if (authenticated) {
      await createActor();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Auth initialization failed:', error);
    return false;
  }
};

// Handle login
export const login = async (onSuccess?: () => void): Promise<void> => {
  if (!authClient) {
    await initializeAuth();
  }

  await authClient?.login({
    identityProvider: IDENTITY_PROVIDER,
    onSuccess: async () => {
      await createActor();
      onSuccess?.();
    },
    maxTimeToLive: BigInt(30 * 60 * 1000 * 1000 * 1000), // 30 minutes
  });
};

// Define the IDL manually if no generated declarations
const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    addMessage: IDL.Func([IDL.Principal, IDL.Text, IDL.Bool], [], []),
    getMessages: IDL.Func(
      [IDL.Principal],
      [
        IDL.Vec(
          IDL.Record({
            timestamp: IDL.Nat64,
            message: IDL.Text,
            fromUser: IDL.Bool,
          })
        ),
      ],
      ['query']
    ),
  });

// Create the actor with agent and identity
const createActor = async (): Promise<void> => {
  if (!authClient) throw new Error('Auth client not initialized');

  const identity = authClient.getIdentity();
  const agent = new HttpAgent({
    identity,
    host: process.env.DFX_NETWORK === 'ic' ? IC_HOST : LOCAL_HOST,
  });

  // In development, fetch root key
  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey();
  }

  const canisterId = process.env.CANISTER_ID_MENTALMATE_BACKEND || '';
  if (!canisterId) {
    throw new Error('CANISTER_ID_MENTALMATE_BACKEND is not set');
  }

  actor = Actor.createActor<BackendCanister>(idlFactory, {
    agent,
    canisterId,
  });
};

// Expose the actor
export const getActor = (): BackendCanister => {
  if (!actor) throw new Error('Actor not initialized. Please authenticate first.');
  return actor;
};

// Return current principal
export const getPrincipal = (): Principal | null => {
  return authClient?.getIdentity().getPrincipal() ?? null;
};

// Check if authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  return authClient?.isAuthenticated() ?? false;
};

// Logout
export const logout = async (): Promise<void> => {
  await authClient?.logout();
  actor = null;
};

// Wrapper functions
export const addMessage = async (message: string, fromUser: boolean): Promise<void> => {
  const principal = getPrincipal();
  if (!principal) throw new Error('Not authenticated');
  await getActor().addMessage(principal, message, fromUser);
};

export const fetchMessages = async (): Promise<ChatEntry[]> => {
  const principal = getPrincipal();
  if (!principal) throw new Error('Not authenticated');
  return await getActor().getMessages(principal);
};

// Message structure
export type ChatEntry = {
  timestamp: bigint;
  message: string;
  fromUser: boolean;
};
