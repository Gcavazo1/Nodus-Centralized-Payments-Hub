import coinbase from 'coinbase-commerce-node';
import type { Charge, Event } from 'coinbase-commerce-node';

const Client = coinbase.Client;

const apiKey = process.env.COINBASE_COMMERCE_API_KEY;

let isCoinbaseConfigured = false;

if (apiKey) {
  try {
    Client.init(apiKey);
    isCoinbaseConfigured = true;
    console.log("Coinbase Commerce client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Coinbase Commerce client:", error);
    isCoinbaseConfigured = false;
  }
} else {
  console.warn("Coinbase Commerce API key (COINBASE_COMMERCE_API_KEY) is not set. Coinbase functionality will be disabled.");
  isCoinbaseConfigured = false;
}

export { isCoinbaseConfigured };
export type { Charge, Event };
