// Dropdown logic for .button-choose-creative-wrapper
const wrapper = document.querySelector('.button-choose-creative-wrapper');
const button = wrapper.querySelector('.button-choose-creative');
const dropdown = wrapper.querySelector('.dropdown-menu');
const arrow = wrapper.querySelector('.arrow');

function openDropdown() {
  dropdown.style.display = 'block';
  dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
  dropdown.style.opacity = '1';
  arrow.classList.add('rotated');
  button.classList.add('open');
}

function closeDropdown() {
  dropdown.style.maxHeight = '0';
  dropdown.style.opacity = '0';
  arrow.classList.remove('rotated');
  button.classList.remove('open');
  setTimeout(() => {
    dropdown.style.display = 'none';
  }, 350);
}

button.addEventListener('click', function(e) {
  e.stopPropagation();
  const isOpen = dropdown.style.display === 'block';
  if (isOpen) {
    closeDropdown();
  } else {
    openDropdown();
  }
});

document.addEventListener('click', function(e) {
  if (dropdown.style.display === 'block') {
    closeDropdown();
  }
});

// Button selection logic for .buttons-container
const buttonsContainer = document.querySelector('.buttons-container');
const buttons = buttonsContainer.querySelectorAll('button');

buttons.forEach(button => {
  button.addEventListener('click', function() {
    // Remove active class from all buttons
    buttons.forEach(btn => {
      btn.classList.remove('active');
    });
    // Add active class to clicked button
    this.classList.add('active');
  });
});
