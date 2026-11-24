document.addEventListener('DOMContentLoaded', function() {

  const STORAGE_KEY = 'wedding_bookings';
  let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let selectedDate = new Date();
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  const calendar = document.getElementById('calendar');
  const currentMonthEl = document.getElementById('current-month');
  const bookingsList = document.getElementById('bookings-list');
  const addBtn = document.querySelector('.add-btn');
  const overlay = document.getElementById('add-form-overlay');
  const formTitle = document.getElementById('form-title');
  const bookingForm = document.getElementById('booking-form');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function renderCalendar() {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    let html = '';
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      html += `<div class="day-cell empty">${lastDayOfPrevMonth - i}</div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = 
        day === new Date().getDate() && 
        currentMonth === new Date().getMonth() && 
        currentYear === new Date().getFullYear();
      
      const dayBookings = bookings.filter(b => {
        const bDate = new Date(b.date);
        return bDate.getDate() === day && 
               bDate.getMonth() === currentMonth && 
               bDate.getFullYear() === currentYear;
      });
      
      const hasBookings = dayBookings.length > 0;
      
      html += `<div class="day-cell${isToday ? ' today' : ''}${hasBookings ? ' has-booking' : ''}" 
                onclick="selectDate(new Date(${currentYear}, ${currentMonth}, ${day}))">
                <span class="day-number">${day}</span>${hasBookings ? `<div class="day-booking">${dayBookings.length}</div>` : ''}</div>`;
    }
    
    const totalCells = firstDayOfMonth + daysInMonth;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      html += `<div class="day-cell empty"></div>`;
    }
    
    calendar.innerHTML = html;
    currentMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  window.selectDate = function(date) {
    selectedDate = date;
    renderBookingsForDate(date);
    closeAddForm();
  };

  function renderBookingsForDate(date) {
    const dayBookings = bookings.filter(b => {
      const bDate = new Date(b.date);
      return bDate.getDate() === date.getDate() &&
             bDate.getMonth() === date.getMonth() &&
             bDate.getFullYear() === date.getFullYear();
    });
    
    const bookingsContainer = document.getElementById('bookings-list');
    
    if (dayBookings.length === 0) {
      bookingsContainer.innerHTML = '<div class="no-bookings">No bookings on ' + 
        date.toLocaleDateString() + '</div>';
      return;
    }
    
    let html = '';
    dayBookings.forEach((booking, index) => {
      const bDate = new Date(booking.date);
      html += `
        <div class="booking-item">
          <div class="booking-header">
            <span class="booking-client">${booking.clientName}</span>
            <span class="booking-date">${bDate.toLocaleDateString()}</span>
          </div>
          <div class="booking-details">
            ${booking.eventType} • $${parseFloat(booking.price).toFixed(0)}
          </div>
          <div style="margin-top: 8px;">
            <span style="color: var(--primary);">${booking.whatsapp}</span>
            ${booking.notes ? `<div style="margin-top: 4px; font-size: 10px; color: var(--text-secondary);">${booking.notes}</div>` : ''}
          </div>
          <button class="booking-delete" onclick="deleteBooking('${booking.id}')">Delete</button>
        </div>`;
    });
    
    bookingsContainer.innerHTML = html;
  }

  window.saveBooking = function(event) {
    event.preventDefault();
    
    const booking = {
      id: Date.now().toString(),
      clientName: document.getElementById('client-name').value,
      eventType: document.getElementById('event-type').value,
      package: document.getElementById('package').value,
      price: document.getElementById('price').value || 0,
      whatsapp: document.getElementById('whatsapp').value,
      notes: document.getElementById('notes').value,
      date: selectedDate.toISOString()
    };
    
    bookings.unshift(booking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    
    closeAddForm();
    renderCalendar();
    renderBookingsForDate(selectedDate);
    
    showToast('Booking saved!');
    bookingForm.reset();
  };

  window.deleteBooking = function(id) {
    if(confirm('Delete this booking?')) {
      bookings = bookings.filter(b => b.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
      renderCalendar();
      renderBookingsForDate(selectedDate);
      showToast('Booking deleted!');
    }
  };

  window.showAddForm = function() {
    overlay.classList.add('active');
    formTitle.textContent = 'Add Booking';
    document.getElementById('booking-form').reset();
  };

  window.closeAddForm = function(event) {
    if (event && event.target === overlay) {
      overlay.classList.remove('active');
    } else {
      overlay.classList.remove('active');
    }
  };

  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: var(--primary); color: white; padding: 12px 24px; 
      border-radius: 12px; font-size: 14px; z-index: 9999; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }

  renderCalendar();
  renderBookingsForDate(selectedDate);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeAddForm();
    }
  });
});
