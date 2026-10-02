// Camada de persistência.
// Nesta versão de demonstração os dados ficam no localStorage do navegador.
// Para migrar para Supabase/PostgreSQL basta criar outra implementação de
// `DataRepository` (ex.: SupabaseRepository) e trocar a exportação `repository`.

import type { Database } from '@/types';
import { createSeedDatabase, DB_VERSION } from '@/data/seed';

export interface DataRepository {
  load(): Database;
  save(db: Database): void;
  reset(): Database;
}

export const STORAGE_KEY = 'mansao-maromba:db';

class LocalStorageRepository implements DataRepository {
  load(): Database {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Database;
        if (parsed.version === DB_VERSION) return parsed;
      }
    } catch {
      /* armazenamento indisponível — usa dados de demonstração */
    }
    return this.reset();
  }

  save(db: Database) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      /* ignora — a demonstração continua funcionando em memória */
    }
  }

  reset(): Database {
    const db = createSeedDatabase();
    this.save(db);
    return db;
  }
}

export const repository: DataRepository = new LocalStorageRepository();
