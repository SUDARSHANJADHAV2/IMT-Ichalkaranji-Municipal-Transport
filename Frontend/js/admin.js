const applications = [
    { id: 'P9876', name: 'Ravi Shinde', category: 'Student', status: 'Pending' },
    { id: 'P4321', name: 'Meena Patil', category: 'Senior', status: 'Pending' },
  ];
  
  const adminPassList = document.getElementById('adminPassList');
  
  applications.forEach(app => {
    adminPassList.innerHTML += `
      <div class="admin-card">
        <p><strong>${app.name}</strong> (${app.category}) - ${app.status}</p>
        <button onclick="approve('${app.id}')">Approve</button>
        <button onclick="reject('${app.id}')">Reject</button>
      </div>
    `;
  });
  
  function approve(id) {
    alert(`Pass ID ${id} approved.`);
    location.reload();
  }
  
  function reject(id) {
    alert(`Pass ID ${id} rejected.`);
    location.reload();
  }
  