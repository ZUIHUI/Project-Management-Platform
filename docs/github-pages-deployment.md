# GitHub Pages 佈署說明

## 已完成設定

- Workflow：`.github/workflows/deploy-github-pages.yml`
- 前端打包 base path 自動依 `GITHUB_REPOSITORY` 設定（`apps/web/vite.config.js`）
- production 以 `VITE_DEMO_MODE=true` 啟用前端 mock adapter，可在 GitHub Pages（無後端）直接運作

## 預期網址

```
https://<github-username>.github.io/Project-Management-Platform/
```

> 實際 `<github-username>` 以你的 GitHub 帳號為準。

## 上線檢查

1. Push 到 `main`/`master`/`work` 分支。
2. 到 GitHub repo 的 **Actions** 確認 `Deploy Web to GitHub Pages` 成功。
3. 到 repo **Settings > Pages**，確認 Source 為 GitHub Actions。
4. 開啟上述網址驗證頁面功能（Projects / Tasks / Dashboard）。
