export class BlockchainAPIError extends Error {
  message: string;
  constructor(message: string) {
    super('BLOCKCHAIN_API_ERROR');
    this.message = message;
  }
}
