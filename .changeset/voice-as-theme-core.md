---
"@spudly/ui": major
---

Voice-as-theme text system, core (#539, tranche 1 of 4): the design system now defines a typed `Voice` slot object and exports `VoiceProvider` and `useVoice` from the package root. The DS ships no default strings — each app authors its complete voice object in its own repo and supplies it once at the root through `VoiceProvider`, the way it supplies a theme; shared components and views will read their text from that object as the migration tranches land. Reading the voice with no provider above throws a clear error naming the missing provider, so app wiring mistakes fail fast instead of rendering empty strings. Test: wrap a tree in `VoiceProvider` with a complete voice object and confirm `useVoice()` returns it; render a voice-reading component without the provider and confirm it throws the missing-provider error.
