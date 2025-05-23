import { debounce, Debouncer, Notice, Plugin } from "obsidian";
import Job, { CraitJob, JobFrequency, JobSettings } from "./job";
import CronSettingTab from "./settings";
import SyncChecker from "./syncChecker";
//import { CronLock } from './lockManager';
//import CronLockManager from './lockManager';
// TODO:reintroduce: import CraitAPI from './api';

export interface CraitSettings {
  resumeTimersOnStartup: boolean;
  runOnStartup: boolean;
  enableMobile: boolean;
  lastUpdatedMs: number | null; // Timestamp in milliseconds
  watchObsidianSync: boolean;
  jobs: Array<CraitJob>;
  // locks: { [key: string]: CronLock };
}

const DEFAULT_SETTINGS: CraitSettings = {
  resumeTimersOnStartup: true,
  runOnStartup: true,
  enableMobile: true,
  lastUpdatedMs: null, // null = not loaded/set
  watchObsidianSync: false,
  jobs: [],
  // locks: {},
};

export default class CraitPlugin extends Plugin {
  static instance: CraitPlugin;
  settings: CraitSettings;
  syncChecker: SyncChecker;
  // lockManager: CronLockManager;
  jobs: { [key: string]: Job };
  saveSettings: Debouncer<[], void>;
  // TODO:reintroduce: api: api: CraitAPI

  /** Called when the plugin is loaded. */
  async onload() {
    console.log("Loading Crait!");

    // set up the save debouncer
    this.setSaveSettingsDebouncer();

    CraitPlugin.instance = this;

    await this.loadSettings();

    this.addSettingTab(new CronSettingTab(this.app, this));
    this.syncChecker = new SyncChecker(this.app, this);

    this.jobs = {};

    // load our cronjobs
    this.loadJobs();
    // TODO:reintroduce: this.api = CraitAPI.get(this)
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.runOnStartup) {
        if (this.app.isMobile && !this.settings.enableMobile) {
          return;
        }
        new Notice("Run-on-start-up Focus-Timers!");
        this.runJobs();
      } else {
        // We are not auto-magically running the jobs on
        // startup. Check to see if we want to run them if
        // the timers have updates since.
        if (this.settings.resumeTimersOnStartup) {
          if (this.app.isMobile && !this.settings.enableMobile) {
            return;
          }
          new Notice("Resuming Focus-Timers!");
          this.runJobsAndResume();
        }
      }
    });

    // Configure the timeouts
    this.resetTimeout();
    this.initInactivity();
  }

  public async runJobs() {
    // new Notice("Running Obsidian Cron!")
    for (const [, job] of Object.entries(this.jobs)) {
      await this.syncChecker.waitForSync(job.settings);

      // reload the settings incase we've had a new lock come in via sync
      await this.loadSettings();

      if (!job.canRunJob()) {
        // new Notice(`Can't run job: ${job.noRunReason}`)
        continue;
      }

      await job.runJob();
    }
  }

  private async runJobsAndResume() {
    for (const [, job] of Object.entries(this.jobs)) {
      await this.syncChecker.waitForSync(job.settings);

      // reload the settings incase we've had a new lock come in via sync
      await this.loadSettings();

      if (!job.canRunJob()) {
        // new Notice(`Can't run job: ${job.noRunReason}`)
        continue;
      }

      await job.onLoad(this.settings.lastUpdatedMs);
    }
  }

  public initInactivity() {
    // Listen to common user interactions to reset the timer.
    this.registerDomEvent(window, "mousemove", () => this.resetTimeout());
    this.registerDomEvent(window, "keydown", () => this.resetTimeout());
    this.registerDomEvent(window, "mousedown", () => this.resetTimeout());
  }

  public addJob(
    name: string,
    frequency: JobFrequency,
    settings: JobSettings,
    job: string /*TODO: |JobFunc*/
  ) {
    const existingJob = this.getJob(name);
    if (existingJob) throw new Error("CRAIT job already exists");

    const craitJob: CraitJob = {
      id: name,
      name,
      job,
      frequency,
      settings,
    };

    this.jobs[name] = new Job(craitJob, this.app, this, this.syncChecker);
    this.saveSettings();
  }

  public async runJob(name: string) {
    const job = this.getJob(name);
    if (!job) throw new Error("CRAIT job doesn't exist");
    await job.runJob();
  }

  // public clearJobLock(name: string) {
  //   const job = this.getJob(name);
  //   if (!job) throw new Error("CRAIT job doesn't exist");
  //   job.clearJobLock();
  // }

  public getJob(name: string): Job | null {
    for (const [, job] of Object.entries(this.jobs)) {
      if (job.name == name) return job;
    }
    return null;
  }

  public onunload() {
    if (this.settings.watchObsidianSync) this.syncChecker.handleUnload();
    // new Notice("CRAIT unloaded")
  }

  public loadJobs() {
    this.settings.jobs.forEach((craitJob) => {
      if (craitJob.job === "") {
        // empty job, nothing to do.
        return;
      }

      if (
        craitJob.frequency.hours === undefined &&
        craitJob.frequency.mins === undefined &&
        craitJob.frequency.secs === undefined
      ) {
        // no timeout config set
        return;
      }

      this.jobs[craitJob.id] = new Job(craitJob, this.app, this, this.syncChecker);
    });
  }

  private clearTimeout() {
    for (const [, job] of Object.entries(this.jobs)) {
      job.clearTimeout();
    }
  }

  /** Resets the inactivity timer. */
  private resetTimeout() {
    this.clearTimeout();
    if (this.app.isMobile && !this.settings.enableMobile) {
      // we're disabled on mobile, do nothing.
      return;
    }
    for (const [, job] of Object.entries(this.jobs)) {
      job.resetTimeout();
    }

    // reset the timeout in the settings
    this.settings.lastUpdatedMs = Date.now();
    this.saveSettings();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  private setSaveSettingsDebouncer(): void {
    this.saveSettings?.cancel();
    this.saveSettings = debounce(
      () => {
        new Notice("Focus timers: Saving settings");
        this.saveData(this.settings).then(() => {
          this.resetTimeout();
        });
      },
      60 * 1000,
      true
    );
  }
}
