/**
 * SimulationContext — État partagé entre les modules
 *
 * Permet de transmettre les logs générés depuis SimulationPage
 * vers EventLogPage et ProcessMonitorPage sans fichier intermédiaire.
 */
import React, { createContext, useContext, useState } from 'react';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [sharedLogs, setSharedLogs] = useState([]);
  const [sharedSource, setSharedSource] = useState(null); // 'simulation' | 'etl' | null
  const [sharedProcessKey, setSharedProcessKey] = useState(null); // clé du processus simulé

  function publishLogs(logs, source, processKey = null) {
    setSharedLogs(logs);
    setSharedSource(source);
    setSharedProcessKey(processKey);
  }

  function clearLogs() {
    setSharedLogs([]);
    setSharedSource(null);
    setSharedProcessKey(null);
  }

  return (
    <SimulationContext.Provider value={{ sharedLogs, sharedSource, sharedProcessKey, publishLogs, clearLogs }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used inside SimulationProvider');
  return ctx;
}
