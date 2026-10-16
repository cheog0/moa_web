/**
 * Local-first recording persistence (ClovaNote-style).
 * Prefer OPFS (append-to-file). Fall back to IndexedDB chunk store.
 */

const DB_NAME = "raple-recording-draft";
const DB_VERSION = 2;
const META_STORE = "meta";
const CHUNK_STORE = "chunks";
const META_KEY = "active";
const OPFS_FILE = "raple-active-recording.bin";

type DraftMeta = {
  id: string;
  mimeType: string;
  liveMemo: string;
  chunkCount: number;
  byteLength: number;
  storage: "opfs" | "idb";
  updatedAt: number;
};

export type RecordingDraft = {
  id: string;
  mimeType: string;
  chunks: Blob[];
  liveMemo: string;
  updatedAt: number;
};

type OpfsSession = {
  handle: FileSystemFileHandle;
  writable: FileSystemWritableFileStream;
  offset: number;
};

let opfsSession: OpfsSession | null = null;
let writeChain: Promise<void> = Promise.resolve();

function supportsOpfs() {
  return typeof navigator !== "undefined" && !!navigator.storage?.getDirectory;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB open failed"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
      if (!db.objectStoreNames.contains(CHUNK_STORE)) {
        db.createObjectStore(CHUNK_STORE, { keyPath: "index" });
      }
      if (db.objectStoreNames.contains("drafts")) {
        db.deleteObjectStore("drafts");
      }
    };
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function txDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB aborted"));
  });
}

async function putMeta(meta: DraftMeta) {
  const db = await openDb();
  const tx = db.transaction(META_STORE, "readwrite");
  tx.objectStore(META_STORE).put(meta, META_KEY);
  await txDone(tx);
  db.close();
}

async function getMeta(): Promise<DraftMeta | null> {
  const db = await openDb();
  const meta = (await idbRequest(
    db.transaction(META_STORE, "readonly").objectStore(META_STORE).get(META_KEY),
  )) as DraftMeta | undefined;
  db.close();
  return meta ?? null;
}

async function clearIdbChunks() {
  const db = await openDb();
  const tx = db.transaction(CHUNK_STORE, "readwrite");
  tx.objectStore(CHUNK_STORE).clear();
  await txDone(tx);
  db.close();
}

async function closeOpfsSession() {
  if (!opfsSession) return;
  try {
    await opfsSession.writable.close();
  } catch {
    // already closed
  }
  opfsSession = null;
}

async function deleteOpfsFile() {
  await closeOpfsSession();
  if (!supportsOpfs()) return;
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(OPFS_FILE);
  } catch {
    // missing file is fine
  }
}

export async function clearRecordingDraft() {
  writeChain = Promise.resolve();
  try {
    await deleteOpfsFile();
    const db = await openDb();
    const metaTx = db.transaction(META_STORE, "readwrite");
    metaTx.objectStore(META_STORE).delete(META_KEY);
    await txDone(metaTx);
    db.close();
    await clearIdbChunks();
  } catch {
    // best-effort
  }
}

export async function startRecordingDraft(mimeType: string) {
  await clearRecordingDraft();
  const meta: DraftMeta = {
    id: `draft-${Date.now()}`,
    mimeType,
    liveMemo: "",
    chunkCount: 0,
    byteLength: 0,
    storage: "idb",
    updatedAt: Date.now(),
  };

  if (supportsOpfs()) {
    try {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle(OPFS_FILE, { create: true });
      const writable = await handle.createWritable({ keepExistingData: false });
      opfsSession = { handle, writable, offset: 0 };
      meta.storage = "opfs";
    } catch {
      opfsSession = null;
      meta.storage = "idb";
    }
  }

  try {
    await putMeta(meta);
  } catch {
    // ignore
  }
  return meta.id;
}

async function appendOpfs(chunk: Blob, meta: DraftMeta) {
  if (!opfsSession) throw new Error("OPFS session missing");
  const buffer = await chunk.arrayBuffer();
  await opfsSession.writable.write(buffer);
  opfsSession.offset += buffer.byteLength;
  await putMeta({
    ...meta,
    chunkCount: meta.chunkCount + 1,
    byteLength: opfsSession.offset,
    storage: "opfs",
    updatedAt: Date.now(),
  });
}

async function appendIdb(chunk: Blob, meta: DraftMeta) {
  const db = await openDb();
  const index = meta.chunkCount;
  const writeTx = db.transaction([META_STORE, CHUNK_STORE], "readwrite");
  writeTx.objectStore(CHUNK_STORE).put({ index, blob: chunk });
  writeTx.objectStore(META_STORE).put(
    {
      ...meta,
      chunkCount: index + 1,
      byteLength: (meta.byteLength || 0) + chunk.size,
      storage: "idb",
      updatedAt: Date.now(),
    },
    META_KEY,
  );
  await txDone(writeTx);
  db.close();
}

/** Serialize durable writes so finish() can await a consistent file. */
export function appendRecordingChunk(chunk: Blob) {
  writeChain = writeChain
    .then(async () => {
      const meta = await getMeta();
      if (!meta) return;
      if (meta.storage === "opfs" && opfsSession) {
        await appendOpfs(chunk, meta);
        return;
      }
      await appendIdb(chunk, meta);
    })
    .catch(() => {
      // keep chain alive after a failed write
    });
  return writeChain;
}

export async function flushRecordingDraftWrites() {
  await writeChain;
  // Ensure OPFS bytes hit storage before tab freeze/kill when possible.
  if (opfsSession) {
    try {
      // close+reopen keeps a durable checkpoint without losing the file
      await opfsSession.writable.close();
      const writable = await opfsSession.handle.createWritable({
        keepExistingData: true,
      });
      const file = await opfsSession.handle.getFile();
      await writable.seek(file.size);
      opfsSession = {
        handle: opfsSession.handle,
        writable,
        offset: file.size,
      };
    } catch {
      // ignore checkpoint errors
    }
  }
}

export async function updateRecordingDraftMemo(liveMemo: string) {
  try {
    const meta = await getMeta();
    if (!meta) return;
    await putMeta({ ...meta, liveMemo, updatedAt: Date.now() });
  } catch {
    // ignore
  }
}

export async function readRecordingDraft(): Promise<RecordingDraft | null> {
  try {
    await flushRecordingDraftWrites();
    const meta = await getMeta();
    if (!meta) return null;

    if (meta.storage === "opfs" && supportsOpfs()) {
      try {
        await closeOpfsSession();
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle(OPFS_FILE);
        const file = await handle.getFile();
        if (file.size <= 0) return null;
        return {
          id: meta.id,
          mimeType: meta.mimeType,
          chunks: [file],
          liveMemo: meta.liveMemo || "",
          updatedAt: meta.updatedAt,
        };
      } catch {
        // fall through to idb
      }
    }

    if (meta.chunkCount <= 0) return null;
    const db = await openDb();
    const chunks: Blob[] = [];
    const chunkTx = db.transaction(CHUNK_STORE, "readonly");
    const chunkStore = chunkTx.objectStore(CHUNK_STORE);
    for (let i = 0; i < meta.chunkCount; i += 1) {
      const row = (await idbRequest(chunkStore.get(i))) as
        | { index: number; blob: Blob }
        | undefined;
      if (row?.blob) chunks.push(row.blob);
    }
    db.close();
    if (!chunks.length) return null;
    return {
      id: meta.id,
      mimeType: meta.mimeType,
      chunks,
      liveMemo: meta.liveMemo || "",
      updatedAt: meta.updatedAt,
    };
  } catch {
    return null;
  }
}

export function blobFromDraft(draft: RecordingDraft) {
  return new Blob(draft.chunks, {
    type: draft.mimeType || "audio/webm",
  });
}
