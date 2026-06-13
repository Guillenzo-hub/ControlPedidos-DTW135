const app = {
  init() {
    const activeTab = sessionStorage.getItem('activeTab') || 'dashboard';
    this.switchTab(activeTab);

    this.initTheme();
    this.initWorker();

    if (typeof crud !== 'undefined' && crud.orders) {
      this.updateMetrics(crud.orders);
    }
  },

  initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved !== null ? saved === 'dark' : prefersDark;

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    this.updateThemeButton(isDark);
  },

  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';

    if (isDark) {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    this.updateThemeButton(!isDark);
  },

  updateThemeButton(isDark) {
    const btn = document.getElementById('theme-toggle');
    const label = document.getElementById('theme-label');
    if (!btn || !label) return;

    const icon = btn.querySelector('.theme-icon');
    if (isDark) {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
      label.textContent = 'Modo Claro';
    } else {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
      label.textContent = 'Modo Oscuro';
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
