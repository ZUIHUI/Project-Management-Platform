# GitHub Pages 佈署說明

## 已完成設定

- Workflow：`.github/workflows/deploy-github-pages.yml`
- 前端打包 base path 自動依 `GITHUB_REPOSITORY` 設定（`apps/web/vite.config.js`）
- production client 只連接正式 OpenAPI API，不再打包 mock database 或示範帳密
- Repository variable `VITE_API_URL` 必須設定為可公開存取的完整 API base URL，例如 `https://api.example.com/api/v1`；缺少時 workflow 會停止建置

## 預期網址

```
https://<github-username>.github.io/Project-Management-Platform/
```

> 實際 `<github-username>` 以你的 GitHub 帳號為準。

## 上線檢查

1. 到 GitHub repo 的 **Settings > Secrets and variables > Actions > Variables** 設定 `VITE_API_URL`。
2. 確認 API 已允許 Pages origin，並能由外部連線 `/health`。
3. Push 到 `main`/`master`/`work` 分支。
4. 到 GitHub repo 的 **Actions** 確認 `Deploy Web to GitHub Pages` 成功。
5. 到 repo **Settings > Pages**，確認 Source 為 GitHub Actions。
6. 使用正式測試帳號驗證登入、Projects、Tasks 與 Dashboard，不使用前端示範資料判定成功。
