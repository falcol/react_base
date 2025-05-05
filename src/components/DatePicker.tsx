import 'react-datepicker/dist/react-datepicker.css';

import { CFormInput } from '@coreui/react';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ja } from 'date-fns/locale/ja';
import { useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  dateFormat?: string;
  name?: string;
}

const CustomDatePicker = ({
  selected,
  onChange,
  placeholder = '日付を選択',
  className = '',
  name = '',
  disabled = false,
  dateFormat = 'yyyy/MM/dd',
}: CustomDatePickerProps) => {
  // Create a ref for the container
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Apply custom styles via JavaScript to ensure they don't get overridden
  useEffect(() => {
    // Add a style tag to handle the calendar container styling
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .custom-datepicker-wrapper {
        position: relative !important;
        display: inline-block !important; /* Make container only as wide as content */
        width: auto !important;
      }

      .custom-datepicker-wrapper .react-datepicker-wrapper,
      .custom-datepicker-wrapper .react-datepicker__input-container {
        display: inline-block !important;
        width: auto !important;
      }

      .custom-datepicker-wrapper .react-datepicker {
        position: relative !important;
        z-index: 1000 !important;
      }

      .custom-datepicker-wrapper .datepicker-footer {
        display: flex !important;
        justify-content: space-between !important;
        gap: 0.5rem !important;
        padding: 0.5rem !important;
        border-top: 1px solid #dee2e6 !important;
        background-color: white !important;
      }

      .custom-datepicker-wrapper .datepicker-footer button {
        min-width: 60px !important;
        text-align: center !important;
        padding: 0.25rem 0.5rem !important;
      }

      .custom-datepicker-wrapper .calendar-icon {
        position: absolute !important;
        right: 10px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        color: #6c757d !important;
        pointer-events: none !important;
        z-index: 10 !important;
      }

      .btn-link {
        color: #008b9b !important;
        text-decoration: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="custom-datepicker-wrapper" ref={datePickerRef}>
      <DatePicker
        selected={selected}
        id={name}
        name={name}
        onChange={onChange}
        className={`form-control ${className}`}
        placeholderText={placeholder}
        dateFormat={dateFormat}
        disabled={disabled}
        isClearable={false}
        locale={ja}
        customInput={<CFormInput className="pe-5" style={{ backgroundImage: 'none' }} placeholder={placeholder} />}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="d-flex justify-content-between align-items-center p-2">
            <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="btn btn-link">
              {'<'}
            </button>
            <div>{date.toLocaleString('ja-JP', { year: 'numeric', month: 'long' })}</div>
            <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="btn btn-link">
              {'>'}
            </button>
          </div>
        )}
        calendarContainer={({ children }) => (
          <div className="react-datepicker">
            {children}
            <div className="datepicker-footer">
              <button type="button" onClick={() => onChange(new Date())} className="btn btn-link">
                今日
              </button>
              <button type="button" onClick={() => onChange(null)} className="btn btn-link">
                クリア
              </button>
            </div>
          </div>
        )}
      />
      <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" aria-hidden="true" />
    </div>
  );
};

export default CustomDatePicker;
