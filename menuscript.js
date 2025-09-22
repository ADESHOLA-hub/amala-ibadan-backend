// Toggle Search Bar
function toggleSearch() {
    var searchBar = document.getElementById("search-bar");
    searchBar.classList.toggle('active');
}

// Toggle Mobile Menu
const menuBtn = document.querySelector('.menu-btn');
const navlinks = document.querySelector('.nav-links');
const navbar = document.querySelector('#navbar');

menuBtn.addEventListener('click', () => {
    navlinks.classList.toggle('mobile-menu');
    
    // Update aria-expanded attribute for accessibility
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true' || false;
    menuBtn.setAttribute('aria-expanded', !expanded);
});

// Change Navbar Background on Scroll
document.addEventListener('scroll', () => {
    var scroll_position = window.scrollY;
    if (scroll_position > 250) {
        navbar.style.backgroundColor = '#ffffffff';
    } else {
        navbar.style.backgroundColor = 'transparent';
    }
});


  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.display = 'none';
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.display = 'block';
      }
    });
  });


document.querySelectorAll('.toggleSoups').forEach((btn) => {
  btn.addEventListener('click', () => {
    const soupContent = btn.closest('.soup-section').querySelector('.soup-content');
    soupContent.classList.toggle('show');
    btn.textContent = soupContent.classList.contains('show') ? 'Hide' : 'View';
  });
});


