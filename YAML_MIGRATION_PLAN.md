# Migration Plan: JSON to YAML Save Files

## Overview

This document outlines the changes required to switch from JSON to YAML format for save game files.

## Impact Assessment

### Files to Modify: 2 files

### Lines of Code to Change: ~10-12 lines

### New Dependencies: 1 package (js-yaml)

### Backward Compatibility: Not required

---

## Detailed Changes

### 1. **package.json**

**Impact:** Add dependency
**Changes:**

- Add `js-yaml` to dependencies: `"js-yaml": "^4.1.0"`

**Code:**

```json
"dependencies": {
  ...
  "js-yaml": "^4.1.0"
}
```

---

### 2. **src/utils/localStorage.js**

**Impact:** Medium - 2 function modifications
**Current:** Uses `JSON.parse()` and `JSON.stringify()`
**Changes:**

- Import js-yaml: `import yaml from 'js-yaml'`
- Modify `getFromStorage()` to detect YAML format and parse accordingly
- Modify `saveToStorage()` to save as YAML instead of JSON
- **OR** keep localStorage as JSON (recommended) since it's internal storage, only change file exports

**Recommendation:** Keep localStorage as JSON (it's internal), only change file save/load operations

**Lines affected:** ~5-10 lines

---

### 3. **src/App.jsx**

**Impact:** High - 3 locations to modify
**Total lines affected:** ~10-15 lines

#### Location 1: `handleSaveGame()` function (line ~977-1053)

**Changes:**

- Line 1022: Update comment from `.json` to `.yaml`
- Line 1039: Change filename extension from `.json` to `.yaml`
- Line 1041: Replace `JSON.stringify()` with `yaml.dump()`
- Line 1042: Change MIME type from `application/json` to `text/yaml` or `application/x-yaml`

**Before:**

```javascript
const filename = `${bookPart}-${namePart}-${datePart}-${timePart}.json`;
const jsonString = JSON.stringify(stateToSave, null, 2);
const blob = new Blob([jsonString], { type: 'application/json' });
```

**After:**

```javascript
import yaml from 'js-yaml';
// ...
const filename = `${bookPart}-${namePart}-${datePart}-${timePart}.yaml`;
const yamlString = yaml.dump(stateToSave, { indent: 2, lineWidth: -1 });
const blob = new Blob([yamlString], { type: 'text/yaml' });
```

#### Location 2: `handleLoadGame()` function (line ~1055-1136)

**Changes:**

- Line 1058: Update `input.accept` from `.json` to `.yaml`
- Line 1064: Update file extension validation to only accept `.yaml`
- Line 1071-1072: Replace `JSON.parse()` with `yaml.load()`

**Before:**

```javascript
input.accept = '.json';
if (!file.name.toLowerCase().endsWith('.json')) {
  return;
}
const jsonContent = event.target.result;
const loadedState = JSON.parse(jsonContent);
```

**After:**

```javascript
import yaml from 'js-yaml';
// ...
input.accept = '.yaml';
if (!file.name.toLowerCase().endsWith('.yaml')) {
  return;
}
const fileContent = event.target.result;
const loadedState = yaml.load(fileContent);
```

---

## Code Impact Summary

### Total Changes:

- **Files modified:** 2 files
  - `package.json` (add dependency)
  - `src/App.jsx` (2 functions modified)

### Lines Changed:

- **package.json:** +1 line (dependency)
- **App.jsx:** ~9-11 lines (import + 2 function modifications)

**Total:** ~10-12 lines of code changes

### New Imports:

- `import yaml from 'js-yaml'` in `App.jsx`

---

---

## Testing Checklist

- [ ] Save new game file as YAML
- [ ] Load YAML save file
- [ ] Verify file extension validation rejects non-YAML files
- [ ] Verify all state fields are preserved correctly
- [ ] Test with empty/null values
- [ ] Test with special characters in text fields
- [ ] Verify file download works correctly
- [ ] Check file size comparison (should be smaller)

---

## Additional Considerations

### File Size Impact

- YAML files are typically 10-15% smaller than JSON
- Better readability for manual editing

### Browser Compatibility

- `js-yaml` works in all modern browsers
- No additional polyfills needed

### Performance Impact

- YAML parsing is slightly slower than JSON (~2-3x)
- Negligible for save files (typically <10KB)
- Only affects file load operation, not runtime performance

### Migration Path

1. Add dependency and implement YAML export/import
2. Users will need to re-save their games in the new format

---

## Estimated Effort

- **Implementation time:** 20-30 minutes
- **Testing time:** 10-15 minutes
- **Total:** ~30-45 minutes

---

## Risk Assessment

**Low Risk:**

- Well-tested library (js-yaml)
- Minimal code changes
- Simpler implementation (no backward compatibility logic)
- Clean break from JSON format
