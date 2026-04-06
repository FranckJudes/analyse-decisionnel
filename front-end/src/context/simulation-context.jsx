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

  function publishLogs(logs, source) {
    setSharedLogs(logs);
    setSharedSource(source);
  }

  function clearLogs() {
    setSharedLogs([]);
    setSharedSource(null);
  }

  return (
    <SimulationContext.Provider value={{ sharedLogs, sharedSource, publishLogs, clearLogs }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used inside SimulationProvider');
  return ctx;
}
