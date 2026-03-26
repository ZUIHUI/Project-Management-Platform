# GitHub Pages 佈署說明

## 已完成設定（可直接線上使用）

- Workflow：`.github/workflows/deploy-github-pages.yml`
- 前端打包 base path 自動依 `GITHUB_REPOSITORY` 設定（`apps/web/vite.config.js`）
- production 以 `VITE_DEMO_MODE=true` 啟用前端 mock adapter，可在 GitHub Pages（無後端）直接運作
- Router 改為 `HashRouter`，避免 GitHub Pages 刷新 404

## 線上網址

```
https://<github-username>.github.io/Project-Management-Platform/
```

可直接進入功能頁：
- Dashboard：`https://<github-username>.github.io/Project-Management-Platform/#/`
- Projects：`https://<github-username>.github.io/Project-Management-Platform/#/projects`
- Tasks：`https://<github-username>.github.io/Project-Management-Platform/#/tasks`

## 一次到位上線步驟

1. Push 到 `main` 或 `master`。
2. 到 GitHub repo 的 **Actions** 確認 `Deploy Web to GitHub Pages` 成功。
3. 到 repo **Settings > Pages**，確認 Source 為 GitHub Actions。
4. 開啟上述網址即可以線上使用（無需另外開 API）。
