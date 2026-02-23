import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Edit2, Loader } from 'lucide-react';

export default function TodoCalendarView({
  todos,
  onEdit,
  onDelete,
  onStatusChange,
  deletingId,
}) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Group todos by date
  const todosByDate = useMemo(() => {
    const grouped = {};
    todos.forEach((todo) => {
      const dateKey = todo.date ? new Date(todo.date).toISOString().split('T')[0] : 'no-date';
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(todo);
    });
    return grouped;
  }, [todos]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (todos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        <div className="text-center">
          <p className="text-sm">No todos match your filters</p>
          <p className="text-xs text-neutral-500 mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 overflow-auto">
      {/* Calendar Header */}
      <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 text-center">
            <h3 className="font-semibold text-lg">{monthName}</h3>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={handleToday}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-neutral-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-16 bg-neutral-900/50 rounded" />;
              }

              const dateStr = formatDate(date);
              const todayStr = formatDate(new Date());
              const dayTodos = todosByDate[dateStr] || [];
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className={`h-16 rounded border p-1 overflow-hidden ${
                    isToday
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-neutral-700 bg-neutral-800/30'
                  }`}
                >
                  <div className="text-xs font-semibold text-neutral-300 mb-1">
                    {date.getDate()}
                  </div>
                  {dayTodos.length > 0 && (
                    <div className="space-y-0.5">
                      {dayTodos.slice(0, 2).map((todo) => (
                        <div
                          key={todo.id}
                          className="text-xs truncate px-1 py-0.5 rounded bg-blue-500/20 text-blue-300"
                          title={todo.notes}
                        >
                          {todo.notes}
                        </div>
                      ))}
                      {dayTodos.length > 2 && (
                        <div className="text-xs text-neutral-400 text-center">
                          +{dayTodos.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Todos for selected date or upcoming */}
      <div className="flex-1 overflow-auto">
        <h4 className="font-semibold text-sm mb-3 text-neutral-200">Upcoming Todos</h4>
        <div className="space-y-2">
          {todos
            .filter((t) => t.date)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 10)
            .map((todo) => {
              const isDeleting = deletingId === todo.id;
              return (
                <div
                  key={todo.id}
                  className={`p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 ${
                    isDeleting ? 'opacity-50 bg-red-500/5' : 'hover:bg-neutral-800'
                  } transition-colors`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-300 mb-1">
                        {formatDateDisplay(todo.date)}
                      </p>
                      <p
                        className={`text-sm break-words line-clamp-1 ${
                          todo.status === 'Completed'
                            ? 'text-neutral-500 line-through'
                            : 'text-neutral-100'
                        }`}
                      >
                        {todo.notes}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => onEdit(todo)}
                        disabled={isDeleting}
                        className="p-1 text-neutral-400 hover:text-blue-400 rounded transition-colors disabled:opacity-50"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(todo.id)}
                        disabled={isDeleting}
                        className="p-1 text-neutral-400 hover:text-red-400 rounded transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
