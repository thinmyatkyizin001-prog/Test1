# 校園活動報名平台（PostgreSQL + Flask）

## Windows 啟動步驟

1. 確認 PostgreSQL 17 已啟動，使用 SQL Shell (psql) 登入 `postgres`。
2. 建立資料庫（只需執行一次）：`CREATE DATABASE activity_platform;`
3. 在 **PowerShell** 進入此專案資料夾，執行：

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d activity_platform -f database/schema.sql
py -m pip install -r requirements.txt
$env:DATABASE_URL = "postgresql://postgres:你的密碼@localhost:5432/activity_platform"
py app.py
```

若密碼含 `@`、`#` 等特殊字元，請進行 URL 編碼；也可使用環境變數 `PGPASSWORD` 搭配不含密碼的連線字串（僅限本機開發）。不要把密碼寫進 GitHub。

4. 瀏覽器開啟 **http://127.0.0.1:5000/**。請勿直接雙擊 `index.html`，因為頁面需要 Flask API。
5. 測試新增活動、報名、查看報名名單，重新整理確認資料仍在。

## API

- `GET /api/activities`：活動清單與報名人數
- `POST /api/activities`：新增活動（JSON: `name`, `date`, `location`）
- `GET /api/activities/<id>/registrations`：報名清單
- `POST /api/activities/<id>/registrations`：新增報名（JSON: `name`, `phone`）

## 注意

本 ZIP 是根據你上傳的版本修改，**未連線測試你的本機 PostgreSQL**。如果組員另有 SQL 結構，先協調欄位名稱再匯入。這個範例是課堂本機開發版，不建議直接公開部署（尚無登入權限與正式資料保護機制）。
