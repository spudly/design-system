---
"@spudly/ui": major
---

MemorizeSettingsPage no longer shows an API key section. The "Scripture source" card — the secure API-key field and its Save / Clear actions — is removed entirely, and hosts no longer pass the API-key props (`apiKeyValue`, `onApiKeyValueChange`, `hasSavedApiKey`, `onSaveApiKeyPress`, `onClearApiKeyPress`). The page now renders only its "Settings" heading in the shared shell (plus the host-supplied footer), because Memorize search is server-key-only on every platform. Test: open the MemorizeSettingsPage Default story and confirm no API key field or key actions render and the remaining heading and footer are unchanged.
