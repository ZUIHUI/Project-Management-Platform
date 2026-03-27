# GUI 組件整合指南

## 概述
根據 `system-refactor-spec-zh-TW.md` 的功能樹，已為專案管理平台新增 **10+ 核心 UI 組件**，實現完整的視圖系統、管理介面和分析儀表板。

---

## 新增的核心 GUI 組件

### 1. 多視圖系統

#### BoardView.jsx（看板視圖）
**位置**：`apps/web/src/components/BoardView.jsx`

**功能**：
- Kanban 看板，支持狀態欄（Todo → In Progress → Done）
- 拖放重新排序任務
- 狀態流轉自動觸發

**使用範例**：
```jsx
<BoardView
  projectId="PROJECT-001"
  tasks={tasks}
  statuses={['Todo', 'In Progress', 'Done']}
  onTaskClick={(task) => setSelectedTask(task)}
  onStatusChange={(taskId, newStatus) => updateTaskStatus(taskId, newStatus)}
/>
```

#### CalendarView.jsx（日曆視圖）
**位置**：`apps/web/src/components/CalendarView.jsx`

**功能**：
- 月份日曆視圖
- 在日期上顯示並關聯任務
- 上月/下月導覽

**使用範例**：
```jsx
<CalendarView
  tasks={tasks}
  onTaskClick={(task) => setSelectedTask(task)}
  onDateSelect={(date) => handleDateSelect(date)}
/>
```

#### GanttView.jsx（甘特圖）
**位置**：`apps/web/src/components/GanttView.jsx`

**功能**：
- 時間軸項目規劃
- 任務進度條視覺化
- 自動計算任務持續時間
- 按截止日期排序

**使用範例**：
```jsx
<GanttView
  tasks={tasks}
  projectStartDate={new Date(2026, 1, 1)}
  projectEndDate={new Date(2026, 4, 31)}
  onTaskClick={(task) => setSelectedTask(task)}
/>
```

---

### 2. 任務管理

#### TaskDetailPanel.jsx（任務詳情面板）
**位置**：`apps/web/src/components/TaskDetailPanel.jsx`

**功能**：
- 側邊欄任務詳情展示
- 編輯任務屬性（標題、描述、狀態、優先級、指派）
- 附加評論和活動追蹤
- 實時更新

**使用範例**：
```jsx
{selectedTask && (
  <TaskDetailPanel
    task={selectedTask}
    onClose={() => setSelectedTask(null)}
    onUpdate={(updatedTask) => handleTaskUpdate(updatedTask)}
    team={teamMembers}
  />
)}
```

---

### 3. 迭代規劃

#### SprintManagement.jsx（Sprint/Cycle 管理）
**位置**：`apps/web/src/pages/SprintManagement.jsx`

**功能**：
- 建立和編輯 Sprint（迭代周期）
- 進度追蹤（已完成/總數）
- Sprint 狀態管理（未開始/進行中/已完成）
- 多個 Sprint 管理視圖

**使用範例**：
```jsx
<SprintManagement
  projectId={projectId}
  sprints={sprints}
  onSave={(sprint) => saveSprint(sprint)}
  onDelete={(sprintId) => deleteSprint(sprintId)}
/>
```

#### MilestoneManagement.jsx（Milestone 管理）
**位置**：`apps/web/src/components/MilestoneManagement.jsx`

**功能**：
- 里程碑建立和編輯
- 截止日期和逾期警告
- 關聯任務進度追蹤
- 優先順序排序

**使用範例**：
```jsx
<MilestoneManagement
  projectId={projectId}
  milestones={milestones}
  onSave={(milestone) => saveMilestone(milestone)}
  onDelete={(milestoneId) => deleteMilestone(milestoneId)}
/>
```

---

### 4. 協作和管理

#### TeamManagement.jsx（團隊管理）
**位置**：`apps/web/src/pages/TeamManagement.jsx`

**功能**：
- 成員新增和移除
- 角色指派（Member/Project Lead/Project Admin）
- 權限管理
- 成員資訊展示

**使用範例**：
```jsx
<TeamManagement
  projectId={projectId}
  team={teamMembers}
  onAddMember={(member) => addMember(member)}
  onRemoveMember={(memberId) => removeMember(memberId)}
  onRoleChange={(memberId, role) => changeRole(memberId, role)}
/>
```

#### TagsManagement.jsx（標籤管理）
**位置**：`apps/web/src/components/TagsManagement.jsx`

**功能**：
- 標籤建立、編輯、刪除
- 顏色自訂選擇器
- 標籤搜尋和篩選
- 使用統計

**使用範例**：
```jsx
<TagsManagement
  organizationId={organizationId}
  tags={tags}
  onSave={(tag) => saveTag(tag)}
  onDelete={(tagId) => deleteTag(tagId)}
/>
```

---

### 5. 審計和分析

#### ActivityLogView.jsx（活動日誌）
**位置**：`apps/web/src/pages/ActivityLogView.jsx`

**功能**：
- 完整的審計日誌（建立/更新/刪除/狀態變更等）
- 操作類型篩選
- 參與人員篩選
- 時間排序（最新/最舊）
- 變更前後對比顯示

**使用範例**：
```jsx
<ActivityLogView
  projectId={projectId}
  activities={activities}
/>
```

#### InsightsPage.jsx（分析儀表板）
**位置**：`apps/web/src/pages/InsightsPage.jsx`

**功能**：
- 關鍵指標卡片（完成率、逾期任務、平均完成時間）
- 狀態分布圖表
- 優先級分析
- 團隊生產力熱圖
- 趨勢和建議

**使用範例**：
```jsx
<InsightsPage
  projectId={projectId}
  tasks={tasks}
/>
```

---

### 6. 工作負載分析

#### WorkloadView.jsx（工作負載視圖）
**位置**：`apps/web/src/components/WorkloadView.jsx`

**功能**：
- 按團隊成員分析工作負載
- 任務狀態分布（待辦/進行/完成）
- 負載平衡指示器
- 工作負載建議

**使用範例**：
```jsx
<WorkloadView
  tasks={tasks}
  team={teamMembers}
/>
```

---

## 導航整合

### 更新的 Sidebar.jsx
已更新導航項目包括：
- `Home` → 首頁
- `Projects` → 專案列表
- `Dashboard` → 主儀表板
- **`Board`** → 看板視圖 (新)
- **`Timeline`** → 時間軸視圖 (新)
- **`Calendar`** → 日曆視圖 (新)
- **`Insights`** → 數據分析 (新)
- **`Team`** → 團隊管理 (新)
- **`Activity Log`** → 活動日誌 (新)
- `Notifications` → 通知
- `Settings` → 設定

---

## 整合示例

### ProjectDashboard.jsx
**位置**：`apps/web/src/pages/ProjectDashboard.jsx`

展示所有視圖和管理組件的完整集成示例，包括：
- 視圖選擇器（Board/Calendar/Gantt/List）
- 任務狀態管理
- 側邊欄任務詳情
- 實時更新

---

## 路由配置建議

將以下路由添加到 `App.jsx` 或路由配置：

```javascript
// 視圖路由
{
  path: '/board',
  element: <BoardView />,
  requireAuth: true,
}
{
  path: '/calendar',
  element: <CalendarView />,
  requireAuth: true,
}
{
  path: '/timeline',
  element: <GanttView />,
  requireAuth: true,
}
{
  path: '/insights',
  element: <InsightsPage />,
  requireAuth: true,
}

// 管理路由
{
  path: '/team',
  element: <TeamManagement />,
  requireAuth: true,
  requireRole: ['Project Admin'],
}
{
  path: '/activity',
  element: <ActivityLogView />,
  requireAuth: true,
}
{
  path: '/projects/:projectId',
  element: <ProjectDashboard />,
  requireAuth: true,
}
```

---

## 樣式和依賴

### 使用的技術棧
- **React** + **Hooks**
- **Tailwind CSS** (樣式)
- **react-dnd** (拖放 - BoardView)
- **react-router-dom** (路由)

### Tailwind 類別用法
所有組件都使用 Tailwind CSS 進行樣式定義，支持：
- 響應式設計（`md:`, `lg:` 前綴）
- 暗色模式（可擴展）
- 狀態顏色編碼（green/blue/red/yellow）

---

## 資料結構規範

### Task/Issue 對象結構
```typescript
{
  id: string;
  number: number;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  comments?: Comment[];
}
```

### Sprint 對象結構
```typescript
{
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  goal?: string;
  status: 'pending' | 'active' | 'completed';
  totalTasks: number;
  completedTasks: number;
}
```

### Milestone 對象結構
```typescript
{
  id: string;
  name: string;
  description?: string;
  dueAt: Date;
  status: 'pending' | 'completed';
  totalTasks: number;
  completedTasks: number;
}
```

### Team Member 對象結構
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'Member' | 'Project Lead' | 'Project Admin';
}
```

---

## 下一步優化建議

### Phase 2
1. **通知系統整合** - 連接後端通知 API
2. **即時更新** - WebSocket 支持實時協作
3. **文件上傳** - 任務附件管理
4. **自動化規則** - 狀態轉換觸發器

### Phase 3
1. **AI 輔助** - 自動分類和排優先級
2. **報表導出** - PDF/Excel 下載
3. **整合外部工具** - Slack/Teams 通知
4. **多語言支持** - i18n 完整實現

---

## 故障排除

### 常見問題

**Q: 拖放功能不工作？**
A: 確認已安裝 `react-dnd` 和 `react-dnd-html5-backend`

**Q: 日期顯示格式不對？**
A: 檢查瀏覽器語言設定，確保 `toLocaleDateString('zh-TW')` 正確

**Q: 樣式遺失？**
A: 確認 Tailwind CSS 在主 CSS 檔案中正確匯入

---

## 開發指南

### 添加新視圖
1. 在 `apps/web/src/components/` 建立新組件
2. 使用 Tailwind CSS 進行樣式
3. 在 Sidebar.jsx 添加導航項目
4. 更新路由配置

### 擴展任務屬性
1. 更新 Task 資料結構
2. 更新 TaskDetailPanel 輸入欄位
3. 更新 API 契約（OpenAPI schema）
4. 更新後端模型

---

## 版本控制
- **建立日期**：2026-03-27
- **版本**：1.0 MVP
- **相容性**：React 18+, Node.js 18+
