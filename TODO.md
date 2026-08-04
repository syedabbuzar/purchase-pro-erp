# TODO - Fix image paths in packaged Electron app

## Steps
- [x] Analyze root cause (absolute /paths break under file:// protocol)
- [x] Fix image paths in `src/App.tsx` (starLogo)
- [x] Fix image paths in `src/components/app-sidebar.tsx` (starLogo, mellowMoonLogo)
- [x] Fix image paths in `src/pages/Auth.tsx` (starLogo, mellowMoonLogo)
- [x] Fix favicon path in `index.html`
- [x] Reduce login page logo size in `src/pages/Auth.tsx`
- [x] Rebuild installer (`npm run dist:win`)
