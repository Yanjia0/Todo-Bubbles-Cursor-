document.addEventListener('DOMContentLoaded', function() {
    // 初始化两只猫
    initializeCat('pink');
    initializeCat('blue');

    function initializeCat(color) {
        const catContainer = document.querySelector(`.cat-container.${color}`);
        
        // 创建猫的HTML结构，添加身体部分
        catContainer.innerHTML = `
            <div class="cat">
                <div class="cat-body">
                    <div class="cat-head">
                        <div class="cat-ears">
                            <div class="cat-ear left">
                                <div class="cat-ear-inner"></div>
                            </div>
                            <div class="cat-ear right">
                                <div class="cat-ear-inner"></div>
                            </div>
                        </div>
                        <div class="cat-face">
                            <div class="cat-eyes">
                                <div class="cat-eye left">
                                    <div class="cat-pupil"></div>
                                </div>
                                <div class="cat-eye right">
                                    <div class="cat-pupil"></div>
                                </div>
                            </div>
                            <div class="cat-nose"></div>
                            <div class="cat-mouth"></div>
                            <div class="cat-whiskers">
                                <div class="whiskers-left">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div class="whiskers-right">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="cat-torso"></div>
                    <div class="cat-legs">
                        <div class="cat-leg front-left"></div>
                        <div class="cat-leg front-right"></div>
                        <div class="cat-leg back-left"></div>
                        <div class="cat-leg back-right"></div>
                    </div>
                    <div class="cat-tail"></div>
                </div>
            </div>
        `;

        const catHead = catContainer.querySelector('.cat-head');
        const catEyes = catContainer.querySelectorAll('.cat-pupil');
        const catTail = catContainer.querySelector('.cat-tail');

        // 处理鼠标移动
        document.addEventListener('mousemove', function(e) {
            const rect = catContainer.getBoundingClientRect();
            const catCenterX = rect.left + rect.width / 2;
            const catCenterY = rect.top + rect.height / 2;

            // 计算角度
            const angle = Math.atan2(e.clientY - catCenterY, e.clientX - catCenterX);
            let rotation = angle * (180 / Math.PI);

            // 根据猫的位置决定转头方向
            if (color === 'blue') {
                rotation = e.clientX > catCenterX ? 
                    Math.abs(rotation) : 
                    -Math.abs(rotation);
            } else {
                rotation = e.clientX < catCenterX ? 
                    -Math.abs(rotation) : 
                    Math.abs(rotation);
            }

            // 限制旋转角度
            const maxRotation = 20;
            const limitedRotation = Math.max(-maxRotation, Math.min(maxRotation, rotation));

            // 应用头部旋转
            catHead.style.transform = `rotate(${limitedRotation * 0.3}deg)`;

            // 移动眼睛
            const eyeMove = 3;
            const eyeX = Math.cos(angle) * eyeMove;
            const eyeY = Math.sin(angle) * eyeMove;

            catEyes.forEach(pupil => {
                pupil.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
            });
        });

        // 添加眨眼动画
        function blink() {
            const eyes = catContainer.querySelectorAll('.cat-eye');
            eyes.forEach(eye => {
                eye.style.height = '1px';
                eye.style.transform = 'translateY(2px)';
            });
            
            setTimeout(() => {
                eyes.forEach(eye => {
                    eye.style.height = '12px';
                    eye.style.transform = 'translateY(0)';
                });
            }, 200);
        }

        // 随机眨眼
        setInterval(() => {
            if (Math.random() < 0.3) {
                blink();
            }
        }, 3000);
    }
}); 