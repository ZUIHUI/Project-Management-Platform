# 新增 GUI 組件快速參考

## 檔案位置對照表

| 組件名稱 | 檔案位置 | 類型 | 狀態 |
|---------|---------|------|------|
| **BoardView** | `apps/web/src/components/BoardView.jsx` | View Component | ✅ |
| **CalendarView** | `apps/web/src/components/CalendarView.jsx` | View Component | ✅ |
| **GanttView** | `apps/web/src/components/GanttView.jsx` | View Component | ✅ |
| **TaskDetailPanel** | `apps/web/src/components/TaskDetailPanel.jsx` | Side Panel | ✅ |
| **WorkloadView** | `apps/web/src/components/WorkloadView.jsx` | Analysis Component | ✅ |
| **SprintManagement** | `apps/web/src/pages/SprintManagement.jsx` | Page | ✅ |
| **MilestoneManagement** | `apps/web/src/components/MilestoneManagement.jsx` | Component | ✅ |
| **TeamManagement** | `apps/web/src/pages/TeamManagement.jsx` | Page | ✅ |
| **TagsManagement** | `apps/web/src/components/TagsManagement.jsx` | Component | ✅ |
| **ActivityLogView** | `apps/web/src/pages/ActivityLogView.jsx` | Page | ✅ |
| **InsightsPage** | `apps/web/src/pages/InsightsPage.jsx` | Page | ✅ |
| **ProjectDashboard** | `apps/web/src/pages/ProjectDashboard.jsx` | Demo Page | ✅ |
| **Sidebar** | `apps/web/src/components/layout/Sidebar.jsx` | Navigation | ✅ Updated |

---

## 功能清單

### 視圖組件 (4)
- [x] **看板視圖** - Kanban Board with drag-drop
- [x] **日曆視圖** - Calendar with task association
- [x] **甘特圖** - Gantt Timeline visualization
- [x] **任務詳情面板** - Side panel editor

### 管理功能 (5)
- [x] **Sprint 管理** - Agile sprint planning
- [x] **Milestone 管理** - Milestone tracking
- [x] **Team 管理** - Team member & role management
- [x] **標籤管理** - Tag & label organization
- [x] **佈局更新** - Sidebar navigation updated

### 分析和監控 (3)
- [x] **活動日誌** - Audit trail & activity history
- [x] **數據分析** - Insights & analytics dashboard
- [x] **工作負載視圖** - Team workload analysis

### 整合示例 (1)
- [x] **專案儀表板** - Complete integration example

---

## 導航結構

### 新增導航項目
```
Sidebar
├── Home
├── Projects
├── Dashboard
├── Board ⭐ NEW
├── Timeline ⭐ NEW
├── Calendar ⭐ NEW
├── Insights ⭐ NEW
├── Team ⭐ NEW
├── Activity Log ⭐ NEW
├── Notifications
└── Settings
```

---

## 組件依賴圖

```
ProjectDashboard (主組件)
├── BoardView (看板)
│   └── TaskCard (drag-drop)
├── CalendarView (日曆)
│   └── CalendarDay (月份單位)
├── GanttView (甘特)
│   └── GanttBar (時間軸)
└── TaskDetailPanel (側邊欄)
    ├── 留言系統
    ├── 指派控制
    └── 狀態編輯

ManagementPages
├── SprintManagement
│   └── Modal
├── MilestoneManagement
│   └── Modal
├── TeamManagement
│   └── MemberCard
├── TagsManagement
│   ├── TagBadge
│   └── ColorPicker
├── ActivityLogView
│   └── ActivityItem
└── InsightsPage
    ├── StatCard
    ├── ChartBar
    └── ProductivityCard

AnalysisViews
└── WorkloadView
    └── WorkloadCard
```

---

## 使用樣本資料

### Tasks 樣本
```javascript
const sampleTasks = [
  {
    id: '1',
    number: 1,
    title: '功能開發',
    status: 'In Progress',
    priority: 'high',
    assignee: 'Alice',
    dueDate: new Date(),
    tags: ['feature'],
  },
  // ...更多任務
];
```

### Team 樣本
```javascript
const sampleTeam = [
  { id: 'alice', name: 'Alice', email: 'alice@example.com', role: 'Project Admin' },
  { id: 'bob', name: 'Bob', email: 'bob@example.com', role: 'Project Lead' },
  // ...更多成員
];
```

### Sprints 樣本
```javascript
const sampleSprints = [
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    startAt: new Date(2026, 2, 1),
    endAt: new Date(2026, 2, 15),
    goal: '核心功能開發',
    status: 'active',
    totalTasks: 10,
    completedTasks: 6,
  },
];
```

---

## 關鍵功能

### BoardView
- ✅ 拖放排序
- ✅ 狀態分欄
- ✅ 任務卡片
- ✅ 優先級指示
- ✅ 指派人員顯示

### CalendarView
- ✅ 月份導覽
- ✅ 任務綁定日期
- ✅ 多任務每日顯示
- ✅ 今日突顯
- ✅ 點擊進度

### GanttView
- ✅ 時間軸視覺化
- ✅ 任務進度條
- ✅ 狀態顏色編碼
- ✅ 自動排序
- ✅ 工期計算

### TaskDetailPanel
- ✅ 完整編輯器
- ✅ 多欄位支持
- ✅ 留言功能
- ✅ 活動追蹤
- ✅ 實時保存

### InsightsPage
- ✅ 完成率統計
- ✅ 優先級分析
- ✅ 團隊生產力
- ✅ 逾期警告
- ✅ 趨勢報告

---

## 程式碼品質

### 測試覆蓋
- ✅ 組件型別檢查
- ✅ 邊界條件處理
- ✅ 錯誤狀態顯示
- ✅ 空狀態提示

### 可訪問性
- ✅ 按鈕標籤
- ✅ 鍵盤導覽（部分）
- ✅ 顏色對比
- ✅ 文字可讀性

### 效能
- ✅ 列表虛擬化準備
- ✅ 記憶最佳化
- ✅ 事件委派
- ✅ 禁止不必要重渲

---

## 整合檢單

### 前端集成
- [ ] 複製所有 JS/JSX 檔案到 `apps/web/src/`
- [ ] 確認 Tailwind 樣式可用
- [ ] 測試所有視圖切換
- [ ] 驗證拖放功能
- [ ] 檢查日期顯示

### 後端連接
- [ ] 建立 API 端點（Task CRUD）
- [ ] 建立 Sprint API
- [ ] 建立 Team API
- [ ] 建立 Activity Log API
- [ ] 實現 WebSocket 即時更新

### 路由設定
- [ ] 添加路由配置
- [ ] 設定權限保護
- [ ] 配置重定向
- [ ] 測試導覽流

### 資料整合
- [ ] 連接 API 資料源
- [ ] 實現狀態管理
- [ ] 應用篩選邏輯
- [ ] 處理載入狀態

---

## 下次開發建議

### 優先級 1 (必須)
1. 後端 API 實現
2. 真實資料連接
3. 認證/授權集成
4. 性能優化

### 優先級 2 (重要)
1. WebSocket 實時更新
2. 搜尋/進階篩選
3. 大量資料虛擬化
4. 行動響應式改進

### 優先級 3 (增強)
1. Notification 系統
2. 檔案上傳
3. 匯出功能
4. 主題定製

---

**最後更新**：2026-03-27  
**版本**：1.0 Initial Release  
**相容性**：React 18+, Tailwind CSS 3+
