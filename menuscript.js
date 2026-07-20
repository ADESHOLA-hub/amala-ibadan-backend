
    // Mobile Menu
    const menuBtn = document.querySelector('.menu-btn');
    const navlinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('#navbar');
    const navLinks = document.querySelectorAll('.nav-links a');

    menuBtn.addEventListener('click', () => {
        navlinks.classList.toggle('mobile-menu');
    });

    // Navbar Scroll Effect
    document.addEventListener('scroll', () => {
        const scroll_position = window.scrollY;

        if (scroll_position > 250) {
            navbar.style.backgroundColor = '#fff';

            navLinks.forEach(link => {
                link.style.color = '#222'; // Black
            });

            // Active page stays orange
            navLinks[2].style.color = '#e08414';

        } else {
            navbar.style.backgroundColor = 'transparent';

            navLinks.forEach(link => {
                link.style.color = '#fff'; // White
            });

            // Active page stays orange
            navLinks[0].style.color = '#e08414';
        }
    });

    // Team Carousel
    function scrollTeam(direction) {
        const container = document.getElementById("teamCarousel");
        const cardWidth = container.querySelector(".team-card").offsetWidth + 20;

        container.scrollBy({
            left: direction * cardWidth,
            behavior: "smooth"
        });
    }

    // Image Carousel
    document.addEventListener("DOMContentLoaded", () => {
        const carousels = document.querySelectorAll(".carousel-images");

        carousels.forEach((carousel) => {
            const images = carousel.querySelectorAll("img");
            let current = 0;

            if (images.length > 1) {
                images[0].classList.add("active");

                setInterval(() => {
                    images[current].classList.remove("active");
                    current = (current + 1) % images.length;
                    images[current].classList.add("active");
                }, 3000);
            }
        });
    });
