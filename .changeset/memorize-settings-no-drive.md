---
"@spudly/ui": major
---

MemorizeSettingsPage: the Google Drive sync section is removed entirely. The page now renders only the Scripture source (API key) card, and all Drive props (`driveFolderName`, `driveConnected`, `driveConnectReady`, `isSyncing`, `driveError`, `syncMessage`, `syncConflict`, `onConnectDrivePress`, `onSyncDrivePress`, `onKeepDevicePress`, `onKeepDrivePress`) are deleted from `MemorizeSettingsPageProps`. Hosts no longer pass any Drive props; the Settings page shows no Connect/Sync card.
