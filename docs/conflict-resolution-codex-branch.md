# PR 衝突處理：`codex/draft-ai-driven-system-restructuring-specifications-uzj6gf`

## 已採取措施

1. 新增 `.gitattributes`：
   - `apps/web/yarn.lock` 採 `merge=ours`，降低 lockfile 衝突噪音。
   - `docs/*.md` 採 `merge=union`，降低文件章節互相覆蓋。
2. 新增 `scripts/resolve_pr_conflict.sh`：
   - 可對指定分支執行 merge。
   - 發生衝突時按既定策略自動解部分衝突。

## 使用方式

```bash
./scripts/resolve_pr_conflict.sh codex/draft-ai-driven-system-restructuring-specifications-uzj6gf
```

> 若目標分支不在本地，請先：

```bash
git fetch origin codex/draft-ai-driven-system-restructuring-specifications-uzj6gf:codex/draft-ai-driven-system-restructuring-specifications-uzj6gf
```

## 注意

- 自動策略僅處理高重複衝突檔（lock/docs）。
- Domain 程式碼衝突仍需人工 review。
