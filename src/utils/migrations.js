/**
 * Migration system for save file versions
 * Ensures backward compatibility as the save format evolves
 */

import { getDefaultState } from './stateManager';
import { convertItemColorToAnnotation } from './trailMapping';
import packageJson from '../../package.json';

// Current version - synced with package.json version
// When making save file structure changes, add a migration and bump package.json version
export const CURRENT_VERSION = packageJson.version;

/**
 * Get version from saved state (handles missing or old formats)
 */
const getVersion = (state) => {
  if (!state) return null;
  // Check metadata.version (new format)
  if (state.metadata?.version) {
    return state.metadata.version;
  }
  // Check top-level version (legacy)
  if (state.version) {
    return state.version;
  }
  // No version = very old format, treat as pre-1.3.0
  return '0.0.0';
};

/**
 * Compare version strings (semver-like)
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
const compareVersions = (v1, v2) => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  return 0;
};

/**
 * Migration: 0.0.0 -> 1.3.0
 * Migrates from pre-versioned format to versioned format
 */
const migrateTo1_3_0 = (state) => {
  const migrated = { ...state };

  // Ensure metadata exists
  if (!migrated.metadata) {
    migrated.metadata = {
      version: '1.3.0',
      savedAt: new Date().toISOString(),
      bookname: migrated.book || '',
      theme: migrated.theme || 'light',
      actionSoundsEnabled:
        migrated.actionSoundsEnabled !== undefined
          ? migrated.actionSoundsEnabled
          : true,
      allSoundsMuted:
        migrated.allSoundsMuted !== undefined ? migrated.allSoundsMuted : false,
    };
  } else {
    migrated.metadata.version = '1.3.0';
  }

  // Move actionSoundsEnabled and allSoundsMuted to metadata if at top level
  if (
    migrated.actionSoundsEnabled !== undefined &&
    migrated.metadata.actionSoundsEnabled === undefined
  ) {
    migrated.metadata.actionSoundsEnabled = migrated.actionSoundsEnabled;
    delete migrated.actionSoundsEnabled;
  }
  if (
    migrated.allSoundsMuted !== undefined &&
    migrated.metadata.allSoundsMuted === undefined
  ) {
    migrated.metadata.allSoundsMuted = migrated.allSoundsMuted;
    delete migrated.allSoundsMuted;
  }

  // Migrate soundVolumes structure to sounds object
  if (migrated.soundVolumes && !migrated.sounds) {
    migrated.sounds = {
      ambience: migrated.soundUrls?.ambience || '',
      battle: migrated.soundUrls?.battle || '',
      victory: migrated.soundUrls?.victory || '',
      defeat: migrated.soundUrls?.defeat || '',
      ambienceVolume: migrated.soundVolumes.ambience ?? 100,
      battleVolume: migrated.soundVolumes.battle ?? 100,
      victoryVolume: migrated.soundVolumes.victory ?? 100,
      defeatVolume: migrated.soundVolumes.defeat ?? 100,
    };
    delete migrated.soundVolumes;
  }

  // Migrate trail sequence from color-based to annotation-based
  if (migrated.trailSequence && Array.isArray(migrated.trailSequence)) {
    migrated.trailSequence = migrated.trailSequence.map((item) => {
      if (typeof item === 'number') {
        return { number: item, annotation: null };
      }
      if (item.color !== undefined) {
        return convertItemColorToAnnotation(item);
      }
      return item;
    });
  }

  // Ensure sectionsExpanded exists
  if (!migrated.sectionsExpanded) {
    const defaultState = getDefaultState();
    migrated.sectionsExpanded = defaultState.sectionsExpanded;
  }

  return migrated;
};

/**
 * Run all necessary migrations to bring state to current version
 * @param {Object} state - The loaded state object
 * @returns {Object} - Migrated state object
 */
export const migrateState = (state) => {
  if (!state) {
    return null;
  }

  const version = getVersion(state);
  if (!version) {
    // No version info, assume it needs full migration
    return migrateTo1_3_0(state);
  }

  // If already at current version, no migration needed
  if (compareVersions(version, CURRENT_VERSION) >= 0) {
    return state;
  }

  let migrated = { ...state };

  // Run migrations sequentially based on version
  if (compareVersions(version, '1.3.0') < 0) {
    migrated = migrateTo1_3_0(migrated);
  }

  // Future migrations would go here:
  // if (compareVersions(version, '1.1.0') < 0) {
  //   migrated = migrateTo1_1_0(migrated);
  // }

  // Ensure version is updated to current
  if (!migrated.metadata) {
    migrated.metadata = {};
  }
  migrated.metadata.version = CURRENT_VERSION;

  return migrated;
};
