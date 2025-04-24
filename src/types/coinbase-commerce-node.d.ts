// Type definitions for coinbase-commerce-node v1.0
// Project: https://github.com/coinbase/coinbase-commerce-node
// Definitions by: Your Name <your_email_or_github>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// Based on observed usage and typical SDK patterns, as official types are missing.

declare module 'coinbase-commerce-node' {

  // Define interfaces for resource data structures based on API responses
  interface BaseResourceData {
    id: string;
    resource: string;
    // Add other common fields like created_at, updated_at if needed
  }

  export interface ChargeData extends BaseResourceData {
    hosted_url: string;
    // Add other known properties of a Charge object
    // e.g., code, name, description, pricing, addresses, timeline, metadata etc.
  }

  export interface EventData extends BaseResourceData {
    type: string;
    api_version: string;
    created_at: string;
    data: ChargeData | unknown; // Event data usually contains the associated resource
    // Add other known properties of an Event object
  }
  
  // Define the structure for resource classes with static methods
  class ChargeResource {
    static create(data: unknown, callback?: (error: unknown, response: ChargeData) => void): Promise<ChargeData>;
    static retrieve(chargeId: string, callback?: (error: unknown, response: ChargeData) => void): Promise<ChargeData>;
    static list(paginationOptions?: unknown, callback?: (error: unknown, response: ChargeData[], pagination: unknown) => void): Promise<[ChargeData[], unknown]>;
    // Add other methods like cancel if needed
  }

  class EventResource {
      static retrieve(eventId: string, callback?: (error: unknown, response: EventData) => void): Promise<EventData>;
      static list(paginationOptions?: unknown, callback?: (error: unknown, response: EventData[], pagination: unknown) => void): Promise<[EventData[], unknown]>;
  }

  // Define the Client class interface
  export class Client {
    static init(apiKey: string): void; // init likely returns void, just sets config
  }
  
  // Export the resources object containing the resource classes
  export const resources: {
    Charge: typeof ChargeResource;
    Event: typeof EventResource;
    // Add other resources if needed
  };
  
  // Export the Webhook namespace
  export namespace Webhook {
    function verifyEventBody(rawBody: string | Buffer, signature: string | Buffer, sharedSecret: string): EventData;
    function verifySigHeader(rawBody: string | Buffer, signature: string | Buffer, sharedSecret: string): boolean; // Older alias
  }
  
  // Export types using original names for convenience
  export type Charge = ChargeData;
  export type Event = EventData;

  // Default export might not be needed if named exports work
  // const mainExport = { Client, resources, Webhook };
  // export default mainExport;
}

// Remove submodule declarations as they are likely incorrect
// declare module 'coinbase-commerce-node/lib/resources/Charge' { ... }
// declare module 'coinbase-commerce-node/lib/resources/Event' { ... } 