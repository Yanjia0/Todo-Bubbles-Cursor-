// 在文件开头添加边界配置
const MACHINE_BOUNDS = {
    // 扭蛋机物理边界（占画布的比例）
    physical: {
        top: 0.05,      // 距顶部 5% （考虑装饰区域）
        bottom: 0.67,   // 距顶部 67% 
        left: 0.00,     // 距左侧 0% 
        right: 0.67     // 距左侧 67% 
    },
    // 泡泡生成安全区域（比物理边界更小）
    spawn: {
        top: 0.15,     // 距顶部 15% 
        bottom: 0.65,   // 距顶部 65% 
        left: 0.10,     // 距左侧 10% 
        right: 0.65     // 距左侧 65% 
    },
    // 墙壁厚度（占画布宽度的比例）
    wallThickness: 0.01  // 6px
};

// 添加颜色配置
const BUBBLE_COLORS = {
    1: { base: [144, 238, 144], name: 'green' },    // 浅绿色
    2: { base: [135, 206, 235], name: 'blue' },     // 浅蓝色
    3: { base: [255, 255, 0], name: 'yellow' },     // 黄色
    4: { base: [255, 99, 71], name: 'red' },        // 红色
    5: { base: [47, 47, 47], name: 'black' }        // 深灰色接近黑色
};

document.addEventListener('DOMContentLoaded', function() {
    // Matter.js 模块别名
    const Engine = Matter.Engine,
          Render = Matter.Render,
          World = Matter.World,
          Bodies = Matter.Bodies,
          Body = Matter.Body,
          Events = Matter.Events;

    // 创建引擎，禁用重力
    const engine = Engine.create({
        enableSleeping: false,
        gravity: { x: 0, y: 0 }
    });
    
    // 获取画布容器和画布
    const container = document.querySelector('.canvas-container');
    const canvas = document.getElementById('bubbleCanvas');
    let render; // 声明渲染器变量

    // 鼠标位置计算函数
    function getMousePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    // 设置画布尺寸
    function resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        // 固定扭蛋机的宽高比
        const machineWidth = Math.min(600, window.innerWidth * 0.8);
        const machineHeight = machineWidth * 1.33; // 保持 600:800 的比例
        
        // 更新容器尺寸
        container.style.width = `${machineWidth}px`;
        container.style.height = `${machineHeight}px`;
        
        // 设置布的实际尺寸
        canvas.width = machineWidth;
        canvas.height = machineHeight;
        
        // 更新渲染器尺寸
        if (render) {
            render.canvas.width = machineWidth;
            render.canvas.height = machineHeight;
            render.options.width = machineWidth;
            render.options.height = machineHeight;
            
            // 更新边界
            updateBoundaries();
        }
    }

    // 创建扭蛋机边界
    function createMachineBoundaries() {
        const width = canvas.width;
        const height = canvas.height;
        const wallThickness = width * MACHINE_BOUNDS.wallThickness;
        
        const bounds = MACHINE_BOUNDS.physical;
        const boundaries = [
            // 底部墙
            Bodies.rectangle(
                width/2, 
                height * bounds.bottom,
                width * 0.9,  // 宽度为画布的 90%
                wallThickness,
                {
                    isStatic: true,
                    restitution: 0.8,
                    friction: 0.1,
                    render: { 
                        fillStyle: 'transparent',
                        strokeStyle: 'rgba(255, 158, 205, 0.3)',
                        lineWidth: 1
                    },
                    collisionFilter: { category: 0x0001 }
                }
            ),
            // 顶部墙
            Bodies.rectangle(
                width/2,
                height * bounds.top,
                width * 0.9,  // 宽度为画布的 90%
                wallThickness,
                {
                    isStatic: true,
                    restitution: 0.8,
                    friction: 0.1,
                    render: { 
                        fillStyle: 'transparent',
                        strokeStyle: 'rgba(255, 158, 205, 0.3)',
                        lineWidth: 1
                    },
                    collisionFilter: { category: 0x0001 }
                }
            ),
            // 左侧墙
            Bodies.rectangle(
                width * bounds.left,
                height/2,
                wallThickness,
                height * 0.9,  // 高度为画布的 90%
                {
                    isStatic: true,
                    restitution: 0.8,
                    friction: 0.1,
                    render: { 
                        fillStyle: 'transparent',
                        strokeStyle: 'rgba(255, 158, 205, 0.3)',
                        lineWidth: 1
                    },
                    collisionFilter: { category: 0x0001 }
                }
            ),
            // 右侧墙
            Bodies.rectangle(
                width * bounds.right,
                height/2,
                wallThickness,
                height * 0.9,  // 高度为画布的 90%
                {
                    isStatic: true,
                    restitution: 0.8,
                    friction: 0.1,
                    render: { 
                        fillStyle: 'transparent',
                        strokeStyle: 'rgba(255, 158, 205, 0.3)',
                        lineWidth: 1
                    },
                    collisionFilter: { category: 0x0001 }
                }
            )
        ];

        return boundaries;
    }

    // 更新边界位置
    function updateBoundaries() {
        // 移除旧边界
        const oldBodies = engine.world.bodies.filter(body => body.isStatic);
        World.remove(engine.world, oldBodies);
        
        // 添加新的边界
        const newBoundaries = createMachineBoundaries();
        World.add(engine.world, newBoundaries);
    }

    // 初始调整画布大小
    resizeCanvas();

    // 创建渲染器
    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            wireframes: false,
            background: 'transparent',
            pixelRatio: window.devicePixelRatio || 1
        }
    });

    // 运行引擎和渲染器
    Engine.run(engine);
    Render.run(render);

    // 创建单个小球
    function createBubble(task) {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const timeLeft = deadline - now;
        const daysLeft = timeLeft / (1000 * 60 * 60 * 24); // 转换为天数
        
        // 根据容器大小调整泡泡基础尺寸
        const containerWidth = canvas.width;
        const maxSize = containerWidth * 0.13;
        const minSize = containerWidth * 0.07;
        
        // 基础大小
        let size = minSize + (task.importance * (maxSize - minSize) / 5);
        
        // 根据剩余时间调整大小
        if (daysLeft <= 7) { // 如果剩余时间少于7天
            const timeScale = Math.max(0, Math.min(1, 1 - (daysLeft / 7)));
            size *= (1 + timeScale * 0.5); // 最多增加50%大小
        }

        // 获取基础颜色
        const baseColor = BUBBLE_COLORS[task.importance].base;
        
        // 计算颜色饱和度（基于剩余时间）
        let saturation = 1;
        if (daysLeft <= 7) {
            saturation = Math.max(0.3, Math.min(1, 1 - (daysLeft / 7)));
        }

        // 调整颜色饱和度
        const adjustedColor = baseColor.map(channel => 
            Math.round(255 - ((255 - channel) * saturation))
        );

        const bounds = MACHINE_BOUNDS.spawn;
        const x = canvas.width * (bounds.left + Math.random() * (bounds.right - bounds.left));
        const y = canvas.height * (bounds.top + Math.random() * (bounds.bottom - bounds.top));

        const bubble = Bodies.circle(x, y, size/2, {
            render: {
                fillStyle: 'transparent',
                strokeStyle: 'rgba(255, 255, 255, 0.5)',
                lineWidth: 2
            },
            friction: 0,
            frictionAir: 0.001,
            restitution: 1,
            density: 0.001,
            collisionFilter: {
                category: 0x0002,
                mask: 0x0003
            },
            taskData: task,
            bubbleColor: adjustedColor
        });

        bubble.circleRadius = size/2;
        bubble.gradientSize = size;
        bubble.originalSize = size;

        // 给泡泡一个较小的初始速度
        const speed = 1 + (1 - (size - minSize) / (maxSize - minSize)) * 2;
        const angle = Math.random() * Math.PI * 2;
        Body.setVelocity(bubble, {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        });

        World.add(engine.world, bubble);
    }

    // 从localStorage获取任务并创建小球
    function createBubblesFromTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks.forEach(task => {
            if (!task.completed) {
                createBubble(task);
            }
        });
    }

    // 创建初始泡泡
    createBubblesFromTasks();

    // 修改碰撞事件监听
    Events.on(engine, 'collisionStart', function(event) {
        event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            
            [bodyA, bodyB].forEach(body => {
                if (body.taskData) {
                    const velocity = body.velocity;
                    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                    const newSpeed = speed * 0.95;
                    
                    if (speed > 0.5) {
                        Body.setVelocity(body, {
                            x: (velocity.x / speed) * newSpeed,
                            y: (velocity.y / speed) * newSpeed
                        });
                    }
                }
            });
        });
    });

    // 修改运动调整事件，使运动更平滑
    Events.on(engine, 'beforeUpdate', function() {
        const bounds = MACHINE_BOUNDS.physical;
        const width = canvas.width;
        const height = canvas.height;

        engine.world.bodies.forEach(body => {
            if (body.taskData) {
                const radius = body.circleRadius;
                let needsVelocityUpdate = false;
                let newVelocity = { x: body.velocity.x, y: body.velocity.y };
                
                // 左边界检查
                if (body.position.x < width * bounds.left + radius) {
                    Body.setPosition(body, {
                        x: width * bounds.left + radius,
                        y: body.position.y
                    });
                    newVelocity.x = Math.abs(body.velocity.x);
                    needsVelocityUpdate = true;
                }
                // 右边界检查
                else if (body.position.x > width * bounds.right - radius) {
                    Body.setPosition(body, {
                        x: width * bounds.right - radius,
                        y: body.position.y
                    });
                    newVelocity.x = -Math.abs(body.velocity.x);
                    needsVelocityUpdate = true;
                }
                
                // 上边界检查
                if (body.position.y < height * bounds.top + radius) {
                    Body.setPosition(body, {
                        x: body.position.x,
                        y: height * bounds.top + radius
                    });
                    newVelocity.y = Math.abs(body.velocity.y);
                    needsVelocityUpdate = true;
                }
                // 下边界检查
                else if (body.position.y > height * bounds.bottom - radius) {
                    Body.setPosition(body, {
                        x: body.position.x,
                        y: height * bounds.bottom - radius
                    });
                    newVelocity.y = -Math.abs(body.velocity.y);
                    needsVelocityUpdate = true;
                }

                // 如果发生碰撞，更新速度并添加一些能量损失
                if (needsVelocityUpdate) {
                    const dampening = 0.8; // 碰撞时的能量损失
                    Body.setVelocity(body, {
                        x: newVelocity.x * dampening,
                        y: newVelocity.y * dampening
                    });
                }

                // 速度限制
                const velocity = body.velocity;
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                const maxSpeed = 5;
                const minSpeed = 0.5;

                if (speed > maxSpeed) {
                    const factor = maxSpeed / speed;
                    Body.setVelocity(body, {
                        x: velocity.x * factor,
                        y: velocity.y * factor
                    });
                } else if (speed < minSpeed) {
                    const angle = Math.random() * Math.PI * 2;
                    Body.setVelocity(body, {
                        x: Math.cos(angle) * minSpeed,
                        y: Math.sin(angle) * minSpeed
                    });
                }
            }
        });
    });

    // 修改渲染事件，处理泡泡的渐变效果和文本显示
    Events.on(render, 'beforeRender', function() {
        const context = render.context;
        
        engine.world.bodies.forEach(body => {
            if (body.taskData && body.bubbleColor) {
                const pos = body.position;
                const size = body.originalSize;
                
                // 创建泡泡渐变
                const gradient = context.createRadialGradient(
                    pos.x - size/4, pos.y - size/4, size/10,
                    pos.x, pos.y, size/2
                );
                
                const [r, g, b] = body.bubbleColor;
                gradient.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
                gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.6)`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.2)`);
                
                body.render.fillStyle = gradient;
            }
        });
    });

    // 修改碰撞检测函数
    function isPointInCircle(point, circle, radius) {
        const dx = point.x - circle.x;
        const dy = point.y - circle.y;
        return (dx * dx + dy * dy) <= (radius * radius);
    }

    // 修改鼠标移动事件处理
    render.canvas.addEventListener('mousemove', function(event) {
        const mousePos = getMousePosition(event);
        let foundHovered = false;
        
        engine.world.bodies.forEach(body => {
            if (body.taskData) {
                const radius = body.circleRadius;
                if (isPointInCircle(mousePos, body.position, radius)) {
                    body.isHovered = true;
                    foundHovered = true;
                    body.render.strokeStyle = '#ff7eb6';
                    body.render.lineWidth = 3;
                } else {
                    body.isHovered = false;
                    body.render.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    body.render.lineWidth = 2;
                }
            }
        });
        
        render.canvas.style.cursor = foundHovered ? 'pointer' : 'default';
    });

    // 修改点击事件处理
    render.canvas.addEventListener('click', function(event) {
        event.preventDefault();
        const mousePos = getMousePosition(event);
        
        engine.world.bodies.forEach(body => {
            if (body.taskData && isPointInCircle(mousePos, body.position, body.circleRadius)) {
                completeTask(body.taskData.id);
            }
        });
    });

    // 修改渲染事件，添加调试视觉效果（可选）
    Events.on(render, 'afterRender', function() {
        const context = render.context;
        
        // 绘制碰撞检测范围（调试用）
        if (false) { // 设置为 true 可以看到碰撞检测范围
            engine.world.bodies.forEach(body => {
                if (body.taskData) {
                    context.beginPath();
                    context.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                    context.arc(body.position.x, body.position.y, body.circleRadius, 0, Math.PI * 2);
                    context.stroke();
                }
            });
        }

        // 绘制悬停文本
        engine.world.bodies.forEach(body => {
            if (body.taskData && body.isHovered) {
                const pos = body.position;
                
                context.save();
                
                // 设置文本样式
                context.font = '16px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                
                const text = body.taskData.name;
                const textWidth = context.measureText(text).width;
                const padding = 10;
                const bgWidth = textWidth + (padding * 2);
                const bgHeight = 30;
                
                // 绘制背景
                context.fillStyle = 'rgba(255, 255, 255, 0.95)';
                context.beginPath();
                context.moveTo(pos.x - bgWidth/2, pos.y - bgHeight/2);
                context.lineTo(pos.x + bgWidth/2, pos.y - bgHeight/2);
                context.lineTo(pos.x + bgWidth/2, pos.y + bgHeight/2);
                context.lineTo(pos.x - bgWidth/2, pos.y + bgHeight/2);
                context.closePath();
                context.fill();
                
                // 绘制文本
                context.fillStyle = '#ff9ecd';
                context.fillText(text, pos.x, pos.y);
                
                context.restore();
            }
        });
    });

    // 完成任务
    function completeTask(taskId) {
        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = true;
            tasks[taskIndex].completedDate = new Date().toISOString();
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            const bodies = engine.world.bodies;
            const bubbleToRemove = bodies.find(b => b.taskData && b.taskData.id === taskId);
            
            if (bubbleToRemove) {
                createBurstEffect(bubbleToRemove.position.x, bubbleToRemove.position.y);
                World.remove(engine.world, bubbleToRemove);
                playCompletionSound();
            }
        }
    }

    // 创建破裂效果
    function createBurstEffect(x, y) {
        const particleCount = 15;  // 增加粒子数量
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const radius = Math.random() * 3 + 2;  // 随机大小的水珠
            const distance = Math.random() * 20 + 10;  // 随机飞散距离
            
            const particle = Bodies.circle(x, y, radius, {
                render: {
                    fillStyle: 'rgba(255, 255, 255, 0.6)',
                    strokeStyle: 'rgba(255, 255, 255, 0.4)',
                    lineWidth: 1
                },
                frictionAir: 0.05,
                isParticle: true
            });
            
            Body.setVelocity(particle, {
                x: Math.cos(angle) * distance * 0.2,
                y: Math.sin(angle) * distance * 0.2
            });
            
            particles.push(particle);
        }
        
        World.add(engine.world, particles);
        
        // 添加消失动画
        let opacity = 0.6;
        const fadeInterval = setInterval(() => {
            opacity -= 0.05;
            particles.forEach(particle => {
                if (particle.render) {
                    particle.render.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    particle.render.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
                }
            });
            
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                particles.forEach(particle => {
                    World.remove(engine.world, particle);
                });
            }
        }, 50);
    }

    // 播放泡泡破裂音效
    function playCompletionSound() {
        // 创建音频上下文
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建振荡器和增益节点
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // 设置音频参数
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        
        // 设置音量包络
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        // 连接节点
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 播放音效
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // 更新任务列表
    function updateTaskList() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const taskList = document.querySelector('.task-list');
        taskList.innerHTML = '';

        tasks.filter(task => !task.completed).forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <h4>${task.name}</h4>
                <p>截止日期: ${new Date(task.deadline).toLocaleString()}</p>
                <p class="importance-stars">${''.repeat(task.importance)}</p>
            `;
            taskList.appendChild(taskElement);
        });
    }

    // 切换任务详情面板
    document.getElementById('toggleDetails').addEventListener('click', function() {
        const taskDetails = document.getElementById('taskDetails');
        taskDetails.classList.toggle('show');
        updateTaskList();
    });

    // 添加窗口大小改变事件监听
    window.addEventListener('resize', function() {
        resizeCanvas();
    });
}); 