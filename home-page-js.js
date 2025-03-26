


// Dynamic Greeting Message
const greetingMessage = document.getElementById('greeting-message');
if (greetingMessage) {
  const hour = new Date().getHours();
  let greeting;
  
  if (hour < 12) {
    greeting = 'Good morning!';
  } else if (hour < 15) {
    greeting = 'Good afternoon!';
  } else {
    greeting = 'Good evening!';
  }
  
  greetingMessage.textContent = `${greeting} ${greetingMessage.textContent}`;
}

// Button Click Animations
const teacherBtn = document.getElementById('teacher-btn');
const studentBtn = document.getElementById('student-btn');

if (teacherBtn) {
  teacherBtn.addEventListener('click', (e) => {
    e.preventDefault();
    teacherBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      teacherBtn.style.transform = 'scale(1)';
      window.location.href = 'teacher_login.html';
    }, 200);
  });
}

if (studentBtn) {
  studentBtn.addEventListener('click', (e) => {
    e.preventDefault();
    studentBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      studentBtn.style.transform = 'scale(1)';
      window.location.href = 'student_login.html';
    }, 200);
  });
}