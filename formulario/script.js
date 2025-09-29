// Desplazamiento suave para enlaces de navegación
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Efectos de desplazamiento de navegación
        const navItems = document.querySelectorAll('.nav-menu a');
        navItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#ff6b35';
                this.style.color = 'white';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
                this.style.color = '#333';
            });
        });