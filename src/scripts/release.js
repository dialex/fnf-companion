import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get version bump type from command line argument (patch, minor, major)
const bumpType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('❌ Invalid version bump type. Use: patch, minor, or major');
  process.exit(1);
}

try {
  const rootDir = resolve(__dirname, '..', '..');
  const packageJsonPath = resolve(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  const currentVersion = packageJson.version;
  console.log(`📌 Current version: ${currentVersion}`);

  // Bump version based on type
  const versionParts = currentVersion.split('.').map(Number);
  if (bumpType === 'major') {
    versionParts[0]++;
    versionParts[1] = 0;
    versionParts[2] = 0;
  } else if (bumpType === 'minor') {
    versionParts[1]++;
    versionParts[2] = 0;
  } else {
    versionParts[2]++;
  }

  const newVersion = versionParts.join('.');
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`✅ Updated package.json: ${currentVersion} → ${newVersion}\n`);

  // Stage and commit
  console.log('📝 Staging package.json...');
  execSync('git add package.json', { stdio: 'inherit', cwd: rootDir });

  console.log('💾 Committing changes...');
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, {
    stdio: 'inherit',
    cwd: rootDir,
  });

  // Create tag
  console.log(`🏷️  Creating tag v${newVersion}...`);
  execSync(`git tag -m "" v${newVersion}`, { stdio: 'inherit', cwd: rootDir });

  // Push commit and tag
  console.log('📤 Pushing commit...');
  execSync('git push', { stdio: 'inherit', cwd: rootDir });

  console.log(`📤 Pushing tag v${newVersion}...`);
  execSync(`git push origin v${newVersion}`, {
    stdio: 'inherit',
    cwd: rootDir,
  });

  console.log(`\n🎉 Version ${newVersion} released successfully!`);
} catch (error) {
  console.error('\n❌ Release failed:', error.message);
  process.exit(1);
}
