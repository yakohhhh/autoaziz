import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeeklyCalendar.css';

interface TimeSlot {
  time: string;
  available: boolean;
  reserved?: boolean;
}

interface DaySlots {
  date: string;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  isWithin24Hours: boolean;
  slots: TimeSlot[];
}

interface WeeklyCalendarProps {
  onSelectSlot: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  onSelectSlot,
  selectedDate,
  selectedTime,
}) => {
  const [weekData, setWeekData] = useState<DaySlots[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [weekRange, setWeekRange] = useState({ start: '', end: '' });

  const loadWeekData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/appointments/available-slots?weekOffset=${weekOffset}`
      );
      setWeekData(response.data.days);
      setWeekRange({
        start: response.data.weekStart,
        end: response.data.weekEnd,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    loadWeekData();
  }, [weekOffset, loadWeekData]);

  const handleSlotClick = (day: DaySlots, slot: TimeSlot) => {
    if (day.isPast || day.isWithin24Hours || !slot.available) {
      return;
    }
    onSelectSlot(day.date, slot.time);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('fr-FR', { month: 'short' });
    return `${day} ${month}`;
  };

  const nextWeek = () => {
    setWeekOffset(weekOffset + 1);
  };

  const prevWeek = () => {
    if (weekOffset > 0) {
      setWeekOffset(weekOffset - 1);
    }
  };

  const goToCurrentWeek = () => {
    setWeekOffset(0);
  };

  return (
    <div className='weekly-calendar'>
      <div className='calendar-header'>
        <button
          onClick={prevWeek}
          disabled={weekOffset === 0 || loading}
          className='nav-button'
        >
          <span>←</span> Semaine précédente
        </button>
        <div className='week-range'>
          <h3>
            {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
          </h3>
          {weekOffset > 0 && (
            <button onClick={goToCurrentWeek} className='current-week-btn'>
              Aujourd'hui
            </button>
          )}
        </div>

        <button onClick={nextWeek} disabled={loading} className='nav-button'>
          Semaine suivante <span>→</span>
        </button>
      </div>

      {loading ? (
        <div className='calendar-loading'>
          <div className='spinner'></div>
          <p>Chargement des créneaux...</p>
        </div>
      ) : (
        <div className='calendar-grid'>
          {weekData.map(day => (
            <div
              key={day.date}
              className={`day-column ${day.isToday ? 'is-today' : ''} ${
                day.isPast || day.isWithin24Hours ? 'is-disabled' : ''
              }`}
            >
              <div className='day-header'>
                <div className='day-name'>{day.dayName}</div>
                <div className='day-date'>{formatDate(day.date)}</div>
                {day.isToday && (
                  <span className='today-badge'>Aujourd'hui</span>
                )}
              </div>

              <div className='slots-container'>
                {day.isPast && (
                  <div className='day-message'>
                    <span className='icon'>🕒</span>
                    <p>Date passée</p>
                  </div>
                )}

                {!day.isPast && day.isWithin24Hours && (
                  <div className='day-message warning'>
                    <span className='icon'>⚠️</span>
                    <p>Réservation impossible</p>
                    <small>Minimum 24h à l'avance</small>
                    <small className='contact-info'>
                      📞 Appelez-nous pour une urgence
                    </small>
                  </div>
                )}

                {!day.isPast &&
                  !day.isWithin24Hours &&
                  day.slots.length === 0 && (
                    <div className='day-message'>
                      <span className='icon'>🔒</span>
                      <p>Fermé</p>
                    </div>
                  )}

                {!day.isPast &&
                  !day.isWithin24Hours &&
                  day.slots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => handleSlotClick(day, slot)}
                      disabled={!slot.available}
                      className={`time-slot ${
                        selectedDate === day.date && selectedTime === slot.time
                          ? 'selected'
                          : ''
                      } ${!slot.available ? 'unavailable' : ''} ${
                        slot.reserved ? 'reserved' : ''
                      }`}
                    >
                      <span className='time'>{slot.time}</span>
                      {!slot.available && (
                        <span className='badge'>Complet</span>
                      )}
                      {slot.available && slot.reserved && (
                        <span className='badge limited'>Places limitées</span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='calendar-legend'>
        <div className='legend-item'>
          <span className='dot available'></span>
          <span>Disponible</span>
        </div>
        <div className='legend-item'>
          <span className='dot selected'></span>
          <span>Sélectionné</span>
        </div>
        <div className='legend-item'>
          <span className='dot limited'></span>
          <span>Places limitées</span>
        </div>
        <div className='legend-item'>
          <span className='dot unavailable'></span>
          <span>Complet</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
