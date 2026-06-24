import { Locker } from "../types/locker";
import type { CSSProperties } from "react";
import { processingSyntax, syntax } from "./Constant";

interface LockerDashboardProps {
  lockers: Locker[];
  loading: boolean;
  error: string;
  selectedLockerId: number | null;
  onSelectLocker: (lockerId: number) => void;
}

function DashboardSummary({ lockers }: { lockers: Locker[] }) {
  const availableCount = lockers.filter(
    (locker) => locker.status === "AVAILABLE",
  ).length;
  const occupiedCount = lockers.length - availableCount;

  return (
    <section className="hero-panel">
      <p className="eyebrow">{syntax.systemTitle}</p>
      <div className="hero-copy">
        <div>
          <h1>{syntax.systemSubtitle}</h1>
        </div>

        <div className="hero-stats" aria-label="Locker overview">
          <article className="stat-card">
            <span className="stat-label">{syntax.total}</span>
            <strong>{lockers.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">{syntax.available}</span>
            <strong>{availableCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">{syntax.occupied}</span>
            <strong>{occupiedCount}</strong>
          </article>
        </div>
      </div>
    </section>
  );
}

const TOTAL_ROWS = 4;
const LOCKERS_PER_ROW = 3;

const buildLockerMatrix = (lockers: Locker[]): Array<Array<Locker | null>> => {
  const sorted = [...lockers].sort((a, b) => a.id - b.id);

  return Array.from({ length: TOTAL_ROWS }, (_, rowIndex) => {
    return Array.from({ length: LOCKERS_PER_ROW }, (_, colIndex) => {
      return sorted[rowIndex * LOCKERS_PER_ROW + colIndex] ?? null;
    });
  });
};

const getSeatClassName = (
  locker: Locker,
  selectedLockerId: number | null,
): string => {
  const selectedClass =
    locker.id === selectedLockerId ? " locker-seat--selected" : "";
  return `locker-seat locker-seat--${locker.status.toLowerCase()} locker-seat--size-${locker.size.toLowerCase()}${selectedClass}`;
};

export default function LockerDashboard({
  lockers,
  loading,
  error,
  selectedLockerId,
  onSelectLocker,
}: LockerDashboardProps) {
  const lockerMatrix = buildLockerMatrix(lockers);

  return (
    <section className="locker-panel locker-layout-panel">
      <DashboardSummary lockers={lockers} />
      <div className="section-heading locker-header">
        <div>
          <h2>Locker Layout</h2>
        </div>
      </div>

      {loading && (
        <p className="panel-message">{processingSyntax.loadingLockers}</p>
      )}
      {!loading && error && <p className="error panel-message">{error}</p>}
      {!loading && !error && (
        <div className="locker-layout">
          <div
            className="locker-board"
            role="list"
            aria-label="Locker selector"
          >
            {lockerMatrix.map((row, rowIndex) => (
              <div className="locker-row" key={`row-${rowIndex}`}>
                <span className="locker-row-index">{rowIndex + 1}</span>

                <div
                  className="locker-row-seats"
                  style={{ "--locker-cols": LOCKERS_PER_ROW } as CSSProperties}
                >
                  {row.map((locker, lockerIndex) => {
                    if (!locker) {
                      return (
                        <button
                          key={`empty-${rowIndex}-${lockerIndex}`}
                          type="button"
                          className="locker-seat locker-seat--empty"
                          disabled
                          aria-hidden="true"
                        />
                      );
                    }

                    return (
                      <button
                        key={locker.id}
                        type="button"
                        className={getSeatClassName(locker, selectedLockerId)}
                        onClick={() => onSelectLocker(locker.id)}
                        title={`${locker.name} | ${locker.status} | ${locker.size}`}
                        aria-label={`${locker.name}, ${locker.status}, size ${locker.size}`}
                      >
                        <span className="locker-seat__size">
                          {locker.size[0]}
                        </span>
                        <span
                          className="locker-seat__glyph"
                          aria-hidden="true"
                        />
                        <span className="locker-seat__id">{locker.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="locker-legend">
            <span className="locker-legend-item">
              <span className="locker-legend-dot locker-legend-dot--available" />
              {syntax.available}
            </span>
            <span className="locker-legend-item">
              <span className="locker-legend-dot locker-legend-dot--occupied" />
              {syntax.occupied}
            </span>
            <span className="locker-legend-item">
              <span className="locker-legend-dot locker-legend-dot--selected" />
              {syntax.selected}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
