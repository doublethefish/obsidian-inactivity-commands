# Obsidian Inactivty Commands Plugin

Obsidian Inactivty Commands is a plugin for Obsidian.md that allows users to schedule Obsidian commands or custom user scripts to run automatically after a period of inactivity.

# Installation
To install Obsidian Inactivty Commands you can download it through the community packages within Obsidian, or download the latest release and add it manually.

# Usage

Add jobs in the plugin settings page.

Each job requires

1. a name
2. an Obsidian command to run
3. a inactivity-period
   * This will be the frequency your job runs, after the user (you) stops doing anything in side obsidian.

Each job also has three toggable options

1. Enable job to run on mobile
   * By default all jobs do not run on mobile
2. Toggle job lock
   * If your job gets stuck with a bad log you can toggle the status here. Check [locking](#locking) for more details
3. Toggle sync check
   * Toggles the sync check ability on a per job basis. Check [sync](#sync) for more details

# Functionality

## Sync

Obsidian Inactivty Commands has the ability to hook into the native Obsidian Sync plugin. When enabled all locks, task runs & commands will wait for Obsidian Sync to be fully completed before running any jobs.

This is useful if you have multiple instances of Obsidian running and want to ensure that jobs only run on one device or once per Obsidian vault.

## Locking

At the start of each job a lock is saved into the plugin settings that stops multiple instances of the same jobs running. Sometimes if jobs don't finish cleanly they can be left with locks still in place. They can be unlocked in the settings page of the plugin.

# License
Obsidian Inactivty Commands is released under the MIT License. See the LICENSE file for more information.
