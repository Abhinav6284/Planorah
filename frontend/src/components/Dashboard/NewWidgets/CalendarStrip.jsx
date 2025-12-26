import React from 'react';
import WeeklyCalendar from '../../common/WeeklyCalendar';

const CalendarStrip = () => {
    return (
        <div className="h-full">
            <WeeklyCalendar compact={true} />
        </div>
    );
};

export default CalendarStrip;
