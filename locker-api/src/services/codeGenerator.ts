export interface PickupCodeGenerator {
  generate(): string;
}

export class RandomPickupCodeGenerator implements PickupCodeGenerator {
  generate(): string {
    const randomChunk = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PU-${Date.now()}-${randomChunk}`;
  }
}
