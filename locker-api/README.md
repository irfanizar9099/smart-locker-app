# Locker API Refactor Notes

## Approach

- Applied a layered structure to separate concerns:
  - `repositories/` for locker data access
  - `services/` for business logic and domain rules
  - `controllers/` for HTTP input validation and response mapping
- Introduced class-based services with dependency injection:
  - `LockerService`
  - `TieredStorageChargeCalculator`
  - `RandomPickupCodeGenerator`
- Kept compatibility wrapper exports in `locker.service.ts` so existing routes/controllers continue working without endpoint changes.
- Added focused backend tests in `src/tests/locker.service.test.ts` to lock key behavior:
  - selected locker assignment
  - smallest-fit fallback
  - occupied locker rejection
  - tiered charge calculation

## Tradeoffs

- Chose in-memory repository (`InMemoryLockerRepository`) for simplicity and low setup cost.
- Kept mutable locker state in memory to preserve current runtime behavior; this is not durable across process restarts.
- Kept controller shape mostly unchanged for low migration risk, at the cost of still using lightweight request typing.
- Added abstractions now to make future DB/storage migration easier, even though it introduces a bit more file count and indirection.

## Assumptions

- This project is currently single-process and does not require distributed locking.
- Existing API contracts should remain stable for the current UI.
- Tiered pricing rules are fixed as:
  - Days 1-5: RM 5/day
  - Days 6-10: RM 10/day
  - Days 11+: RM 15/day
- Locker selection from UI should be honored when `lockerId` is provided in store requests.
