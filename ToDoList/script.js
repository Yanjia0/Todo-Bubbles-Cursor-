document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskData = {
            name: document.getElementById('taskName').value,
            importance: document.querySelector('input[name="importance"]:checked').value,
            deadline: document.getElementById('deadline').value
        };

        // 保存任务数据
        saveTask(taskData);
        
        // 显示成功消息
        showSuccessMessage(taskData);
        
        // 重置表单
        taskForm.reset();
    });
});

function saveTask(taskData) {
    // 获取现有任务
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // 添加新任务
    tasks.push({
        ...taskData,
        id: Date.now(),
        created: new Date().toISOString(),
        completed: false
    });
    
    // 保存回本地存储
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showSuccessMessage(taskData) {
    // 创建气泡提示框
    const bubble = document.createElement('div');
    bubble.className = 'success-bubble';
    
    // 根据重要性设置不同的颜色
    const colors = {
        1: '#90EE90', // 绿色
        2: '#87CEEB', // 蓝色
        3: '#FFD700', // 黄色
        4: '#FF6347', // 红色
        5: '#2F2F2F'  // 黑色
    };
    
    bubble.innerHTML = `
        <div class="bubble-content" style="background: ${colors[taskData.importance]}">
            <h3>✨ 任务创建成功！</h3>
            <p>${taskData.name}</p>
            <p>重要程度: ${'★'.repeat(taskData.importance)}</p>
            <p>截止日期: ${new Date(taskData.deadline).toLocaleDateString()}</p>
        </div>
    `;
    
    document.body.appendChild(bubble);

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        .success-bubble {
            position: fixed;
            right: -300px;
            top: 100px;
            width: 250px;
            animation: slideIn 0.5s forwards, slideOut 0.5s forwards 3s;
            z-index: 1000;
        }

        .bubble-content {
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            color: white;
            text-align: center;
        }

        .bubble-content h3 {
            margin: 0 0 10px 0;
            font-size: 1.2rem;
        }

        .bubble-content p {
            margin: 5px 0;
            font-size: 0.9rem;
        }

        @keyframes slideIn {
            from { right: -300px; }
            to { right: 20px; }
        }

        @keyframes slideOut {
            from { right: 20px; opacity: 1; }
            to { right: -300px; opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // 3.5秒后移除提示
    setTimeout(() => {
        document.body.removeChild(bubble);
    }, 3500);
} 