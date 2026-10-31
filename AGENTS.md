<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- AI engines live behind the `ChatEngine` interface in `src/lib/engines`; the UI never calls a provider directly, so online/local engines can be swapped.
- Engines must never fabricate replies: an unavailable engine throws `EngineUnavailableError` and the UI shows a notice.
- No Ollama dependency, ever (product requirement).
- Phase 1 stores conversations/settings in localStorage via `src/lib/store.ts`; online data will move to Lovable Cloud in phase 2, kept separate from local data.
