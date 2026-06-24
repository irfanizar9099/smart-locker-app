import lockers from "../data/lockers";
import { Locker } from "../types/lockerParams";
import { LockerRepository } from "./lockerRepository";

export class InMemoryLockerRepository implements LockerRepository {
  constructor(private readonly data: Locker[] = lockers) {}

  getAll(): Locker[] {
    return this.data;
  }

  findById(id: number): Locker | undefined {
    return this.data.find((locker) => locker.id === id);
  }
}
