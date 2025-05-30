/*
TODO: support this again with non-debounced save settings:

import { JobSettings } from "./job";
import CraitPlugin from "./main";
import SyncChecker from "./syncChecker";

export interface CronLock {
  lockedDeviceName?: string;
  locked?: boolean;
  lockDate?: string;
  lastRun?: string;
}

export default class CronLockManager {
  syncChecker: SyncChecker;
  plugin: CraitPlugin;
  job: string;
  settings: JobSettings;

  public constructor(
    job: string,
    jobSettings: JobSettings,
    plugin: CraitPlugin,
    syncChecker: SyncChecker
  ) {
    this.syncChecker = syncChecker;
    this.job = job;
    this.settings = jobSettings;
    this.plugin = plugin;

    if (!this.plugin.settings.locks[this.job]) {
      this.plugin.settings.locks[this.job] = {};
    }
    this.plugin.saveSettings();
  }

  updateLastrun(): Promise<void> {
    this.plugin.settings.locks[this.job].lastRun = window.moment().format();
    return this.plugin.saveSettings();
  }

  private async updateLockJob(status: boolean): Promise<void> {
    this.plugin.settings.locks[this.job].locked = status;
    this.plugin.settings.locks[this.job].lockedDeviceName =
      this.syncChecker.deviceName();
    await this.plugin.saveSettings();
    return this.syncChecker.waitForSync(this.settings);
  }

  lockJob(): Promise<void> {
    return this.updateLockJob(true);
  }

  unlockJob(): Promise<void> {
    return this.updateLockJob(false);
  }

  clearLock(): void {
    this.plugin.settings.locks[this.job].locked = false;
  }

  lastRun(): string | undefined {
    return this.plugin.settings.locks[this.job].lastRun;
  }

  resetLastRun(): void {
    this.plugin.settings.locks[this.job].lastRun = undefined;
  }

  jobLocked(): boolean {
    return this.plugin.settings.locks[this.job].locked || false;
  }
}
*/
export {};
