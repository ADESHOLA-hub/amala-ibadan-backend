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

