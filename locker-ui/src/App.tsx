import { useCallback, useEffect, useState } from "react";
import "./App.scss";
import { getLockers } from "./api/http";
import LockerDashboard from "./components/LockerDashboard";
import RetrievePackageForm from "./components/RetrievePackageForm";
import StorePackageForm from "./components/StorePackageForm";
import { Locker } from "./types/locker";

function App() {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLockerId, setSelectedLockerId] = useState<number | null>(null);

  const loadLockers = useCallback(async () => {
    try {
      const result = await getLockers();
      setLockers(result.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLockers();
  }, [loadLockers]);

  const refreshAfterStore = useCallback(async () => {
    setSelectedLockerId(null);
    await loadLockers();
  }, [loadLockers]);

  const selectedLocker =
    lockers.find((locker) => locker.id === selectedLockerId) ?? null;

  return (
    <main className="App">
      <section className="app-shell">
        <section className="content-grid">
          <LockerDashboard
            lockers={lockers}
            loading={loading}
            error={error}
            selectedLockerId={selectedLockerId}
            onSelectLocker={setSelectedLockerId}
          />

          <section className="form-grid form-grid--bottom">
            <StorePackageForm
              onSuccess={refreshAfterStore}
              selectedLocker={selectedLocker}
            />
            <RetrievePackageForm
              onSuccess={loadLockers}
              selectedLockerId={selectedLockerId}
            />
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;
