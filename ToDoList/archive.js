document.addEventListener('DOMContentLoaded', function() {
    loadCompletedTasks();
    updateCompletionRate();
});

function loadCompletedTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const completedTasks = tasks.filter(task => task.completed);
    const archiveList = document.getElementById('archiveList');
    
    completedTasks.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    
    archiveList.innerHTML = completedTasks.map(task => `
        <div class="archive-item">
            <div class="completion-date">
                完成于: ${new Date(task.completedDate).toLocaleString()}
            </div>
            <h3 class="task-name">${task.name}</h3>
            <div class="importance-stars">
                ${'★'.repeat(task.importance)}
            </div>
            <div class="deadline">
                原定截止: ${new Date(task.deadline).toLocaleString()}
            </div>
        </div>
    `).join('');
}

function updateCompletionRate() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const completedCount = tasks.filter(task => task.completed).length;
    const totalCount = tasks.length;
    const rate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
    
    document.getElementById('completionRate').textContent = `完成率: ${rate}%`;
} 