# Locker API Refactor Notes

## Approach

- Split the API into small parts so each file has a clear job.
- Kept the main locker logic in service files and data handling in repository files.
- Left the route and controller flow mostly the same so the existing UI can keep working.
- Added tests for key cases like locker choice, full locker checks, and storage charge rules.

## Tradeoffs

- Used in-memory storage because it is simple and quick to set up.
- Locker data is lost when the server restarts because there is no database yet.
- Kept most controller code close to the old flow to reduce breakage.
- Added more structure now to make future changes easier, even if it means a few extra files.

## Assumptions

- The app runs in one server only.
- The current API responses should stay the same so the UI keeps working.
- Storage charges are fixed at RM 5 for days 1 to 5, RM 10 for days 6 to 10, and RM 15 after that.
- If the UI sends a locker ID, the API should use that locker when possible.
