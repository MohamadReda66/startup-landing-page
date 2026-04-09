document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. إدارة شريط التنقل (Navbar) --- */
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    // تغيير شكل النافبار عند التمرير
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // قائمة الجوال
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // إغلاق القائمة عند النقر على رابط (في الجوال)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    /* --- 2. حركات الظهور عند التمرير (Scroll Reveal) --- */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15, // يظهر العنصر عندما يظهر 15% منه في الشاشة
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // إيقاف المراقبة بعد الظهور لمرة واحدة
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    /* --- 3. العدادات الذكية (Animated Counters) --- */
    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;

    const startCounters = () => {
        counters.forEach(counter => {
            counter.innerText = '0';
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // مدة الحركة بالميلي ثانية
            const increment = target / (duration / 16); // 16ms = ~60fps

            const updateCounter = () => {
                const current = +counter.innerText;
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target + (target === 5000 ? '+' : '');
                }
            };
            updateCounter();
        });
    };

    const statsSection = document.getElementById('statistics');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                startCounters();
                hasAnimated = true;
            }
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    /* --- 4. نظام التحقق والإرسال لنموذج التواصل (Formspree) --- */
    const form = document.getElementById('main-form');
    const statusDiv = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    // دالة فحص المدخلات
    const validateForm = () => {
        let isValid = true;
        
        const inputs = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            service: document.getElementById('service'),
            message: document.getElementById('message')
        };

        // مسح الأخطاء السابقة
        Object.values(inputs).forEach(input => input.parentElement.classList.remove('error'));

        // فحص الاسم
        if (inputs.name.value.trim().length < 3) {
            inputs.name.parentElement.classList.add('error');
            isValid = false;
        }

        // فحص الايميل
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputs.email.value.trim())) {
            inputs.email.parentElement.classList.add('error');
            isValid = false;
        }

        // فحص الخدمة
        if (inputs.service.value === "") {
            inputs.service.parentElement.classList.add('error');
            isValid = false;
        }

        // فحص الرسالة
        if (inputs.message.value.trim().length < 10) {
            inputs.message.parentElement.classList.add('error');
            isValid = false;
        }

        return isValid;
    };

    // معالجة الإرسال
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // منع الانتقال لصفحة أخرى
            
            if (!validateForm()) return; // التوقف إذا كان هناك خطأ

            // حالة التحميل (Loading)
            const btnText = submitBtn.querySelector('span');
            const originalText = btnText.innerText;
            submitBtn.disabled = true;
            btnText.innerText = "جاري إرسال طلبك...";
            submitBtn.style.opacity = '0.7';

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    statusDiv.className = "form-status success";
                    statusDiv.innerHTML = "<i class='fas fa-check-circle'></i> رائع! تم إرسال رسالتك بنجاح، وسنتواصل معك قريباً.";
                    form.reset(); // تفريغ الخانات
                } else {
                    throw new Error();
                }
            } catch (error) {
                statusDiv.className = "form-status error";
                statusDiv.innerHTML = "<i class='fas fa-exclamation-circle'></i> عذراً، حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.";
            } finally {
                // إعادة الزر لحالته الأصلية
                submitBtn.disabled = false;
                btnText.innerText = originalText;
                submitBtn.style.opacity = '1';
                
                // إخفاء رسالة الحالة بعد 6 ثواني
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                    statusDiv.className = "form-status";
                }, 6000);
            }
        });

        // إزالة حالة الخطأ عند بدء الكتابة
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', () => {
                input.parentElement.classList.remove('error');
            });
        });
    }
});