const app = {
  init() {
    const activeTab = sessionStorage.getItem('activeTab') || 'dashboard';
    this.switchTab(activeTab);

    this.initWorker();

    if (typeof crud !== 'undefined' && crud.orders) {
      this.updateMetrics(crud.orders);
    }
  },

  switchTab(tabId) {
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById(`nav-${tabId}`);
    if (navBtn) navBtn.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const tabContent = document.getElementById(`tab-${tabId}`);
    if (tabContent) tabContent.classList.add('active');

    sessionStorage.setItem('activeTab', tabId);
  },

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;

    if (type === 'success') {
      toast.style.borderLeft = '4px solid var(--success)';
    } else if (type === 'error') {
      toast.style.borderLeft = '4px solid var(--danger)';
    } else {
      toast.style.borderLeft = '4px solid var(--info)';
    }

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  worker: null,

  initWorker() {
    if (window.Worker) {
      try {
        this.worker = new Worker('worker.js');
      } catch (e) {
        console.warn("Worker de archivo falló (posible problema de CORS en file://). Usando fallback inline.", e);
        const workerCode = `
          self.onmessage = function(e) {
            const orders = e.data;
            let metrics = { total: orders.length, completed: 0, pending: 0, revenue: 0 };
            orders.forEach(order => {
              if (order.status === 'Completado') metrics.completed++;
              if (order.status === 'Pendiente') metrics.pending++;
              if (order.status !== 'Cancelado') metrics.revenue += order.total;
            });
            self.postMessage(metrics);
          };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
      }

      this.worker.onmessage = function (e) {
        const metrics = e.data;
        document.getElementById('metric-total').textContent = metrics.total;
        document.getElementById('metric-completed').textContent = metrics.completed;
        document.getElementById('metric-pending').textContent = metrics.pending;
        document.getElementById('metric-revenue').textContent = `$${metrics.revenue.toFixed(2)}`;
      };

      this.worker.onerror = (err) => {
        console.warn("Worker error:", err.message);
      };
    } else {
      console.warn("Tu navegador no soporta Web Workers.");
    }
  },

  updateMetrics(orders) {
    if (this.worker) {
      this.worker.postMessage(orders);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
