import { useState } from 'react';

const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const CalendarDay = ({ date, tasks, onDayClick, onTaskClick }) => {
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div
      onClick={() => onDayClick(date)}
      className={`
        min-h-24 p-2 border rounded cursor-pointer transition-colors
        ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'}
      `}
    >
      <p className={`text-sm font-semibold ${isToday ? 'text-blue-800' : 'text-gray-700'}`}>
        {date.getDate()}
      </p>
      <div className="mt-1 space-y-1">
        {tasks.slice(0, 2).map((task) => (
          <div
            key={task.id}
            onClick={(e) => {
              e.stopPropagation();
              onTaskClick(task);
            }}
            className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate cursor-pointer hover:bg-blue-200"
            title={task.title}
          >
            {task.title}
          </div>
        ))}
        {tasks.length > 2 && (
          <p className="text-xs text-gray-500">+{tasks.length - 2} more</p>
        )}
      </div>
    </div>
  );
};

export default function CalendarView({ tasks = [], onTaskClick, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  const tasksByDate = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const dateKey = new Date(task.dueDate).toDateString();
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    }
  });

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    days.push(date);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('zh-TW', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">日曆視圖</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← 上月
            </button>
            <span className="px-4 py-1 font-semibold">{monthName}</span>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              下月 →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => (
          <div key={index}>
            {date ? (
              <CalendarDay
                date={date}
                tasks={tasksByDate[date.toDateString()] || []}
                onDayClick={(d) => onDateSelect?.(d)}
                onTaskClick={onTaskClick}
              />
            ) : (
              <div className="min-h-24 bg-gray-100 rounded opacity-50"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
