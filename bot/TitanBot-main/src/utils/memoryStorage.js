import { logger } from './logger.js';
import fs from 'fs';
import path from 'path';

/**
 * High-Performance Storage Engine with Atomic File Persistence
 * Used for local testing and lightweight deployments, while seamlessly upgrading to PostgreSQL when available.
 */
class MemoryStorage {
    constructor() {
        this.data = new Map();
        this.expirationTimes = new Map();
        this.storageDir = path.resolve(process.cwd(), 'data');
        this.storageFile = path.join(this.storageDir, 'storage.json');
        this.saveTimeout = null;
        this.isSaving = false;
        
        // Initialize and load saved state from disk
        this.initDiskStorage();
    }

    initDiskStorage() {
        try {
            if (!fs.existsSync(this.storageDir)) {
                fs.mkdirSync(this.storageDir, { recursive: true });
            }

            if (fs.existsSync(this.storageFile)) {
                const raw = fs.readFileSync(this.storageFile, 'utf8');
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    for (const [k, v] of Object.entries(parsed.data || {})) {
                        this.data.set(k, v);
                    }
                    for (const [k, v] of Object.entries(parsed.expirations || {})) {
                        if (v > Date.now()) {
                            this.expirationTimes.set(k, v);
                        }
                    }
                    logger.info(`[Storage] Loaded ${this.data.size} persistent keys from local database storage.`);
                }
            }
        } catch (err) {
            logger.warn(`[Storage] Could not load disk cache, starting with clean memory: ${err.message}`);
        }
    }

    scheduleDiskSync() {
        if (this.saveTimeout) return;
        this.saveTimeout = setTimeout(() => {
            this.saveTimeout = null;
            this.flushToDisk();
        }, 1000); // 1-second debounce for ultra-high throughput
    }

    flushToDisk() {
        try {
            if (!fs.existsSync(this.storageDir)) {
                fs.mkdirSync(this.storageDir, { recursive: true });
            }

            const exportObj = {
                data: Object.fromEntries(this.data),
                expirations: Object.fromEntries(this.expirationTimes),
                lastSaved: new Date().toISOString()
            };

            const tempFile = `${this.storageFile}.tmp`;
            fs.writeFileSync(tempFile, JSON.stringify(exportObj, null, 2), 'utf8');
            fs.renameSync(tempFile, this.storageFile);
        } catch (err) {
            logger.error(`[Storage] Error persisting to local disk: ${err.message}`);
        }
    }

    async get(key, defaultValue = null) {
        const value = this.data.get(key);
        
        if (this.expirationTimes.has(key)) {
            const expirationTime = this.expirationTimes.get(key);
            if (Date.now() > expirationTime) {
                this.data.delete(key);
                this.expirationTimes.delete(key);
                this.scheduleDiskSync();
                return defaultValue;
            }
        }
        
        return value !== undefined ? value : defaultValue;
    }

    async set(key, value, ttl = null) {
        this.data.set(key, value);
        
        if (ttl && ttl > 0) {
            this.expirationTimes.set(key, Date.now() + (ttl * 1000));
        } else {
            this.expirationTimes.delete(key);
        }
        
        this.scheduleDiskSync();
        return true;
    }

    async delete(key) {
        this.data.delete(key);
        this.expirationTimes.delete(key);
        this.scheduleDiskSync();
        return true;
    }

    async list(prefix) {
        const keys = [];
        for (const [key] of this.data.keys()) {
            if (key.startsWith(prefix)) {
                if (this.expirationTimes.has(key)) {
                    const expirationTime = this.expirationTimes.get(key);
                    if (Date.now() > expirationTime) {
                        this.data.delete(key);
                        this.expirationTimes.delete(key);
                        continue;
                    }
                }
                keys.push(key);
            }
        }
        return keys;
    }

    async exists(key) {
        const value = this.data.get(key);
        
        if (this.expirationTimes.has(key)) {
            const expirationTime = this.expirationTimes.get(key);
            if (Date.now() > expirationTime) {
                this.data.delete(key);
                this.expirationTimes.delete(key);
                this.scheduleDiskSync();
                return false;
            }
        }
        
        return value !== undefined;
    }

    async increment(key, amount = 1) {
        const current = await this.get(key, 0);
        const newValue = current + amount;
        await this.set(key, newValue);
        return newValue;
    }

    async decrement(key, amount = 1) {
        const current = await this.get(key, 0);
        const newValue = current - amount;
        await this.set(key, newValue);
        return newValue;
    }

    async clear() {
        this.data.clear();
        this.expirationTimes.clear();
        this.flushToDisk();
        return true;
    }
}

export { MemoryStorage };
