import { Locker } from "../types/lockerParams";

export interface LockerRepository {
  getAll(): Locker[];
  findById(id: number): Locker | undefined;
}
