const crud = {
  orders: [],
  searchQuery: '',

  init() {
    if (typeof auth !== 'undefined' && !auth.checkSession()) {
      return;
    }
    const stored = localStorage.getItem('orders');
    if (stored) {
      try {
        this.orders = JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing localStorage", e);
        this.orders = [];
      }
    }

    this.render();
  },

  getFilteredOrders() {
    if (!this.searchQuery.trim()) return this.orders;

    const q = this.searchQuery.toLowerCase().trim();
    return this.orders.filter(order =>
      order.customer.toLowerCase().includes(q) ||
      order.productTitle.toLowerCase().includes(q) ||
      order.status.toLowerCase().includes(q)
    );
  },

  searchOrders(query) {
    this.searchQuery = query;
    this.render();
  },

  saveToStorage() {
    try {
      localStorage.setItem('orders', JSON.stringify(this.orders));
      if (typeof app !== 'undefined') {
        app.updateMetrics(this.orders);
      }
    } catch (error) {
      console.error("Error saving to localStorage", error);
      app.showToast("Error al guardar localmente", "error");
    }
  },

  render() {
    const tbody = document.getElementById('orders-tbody');
    const emptyState = document.getElementById('empty-state');

    if (!tbody || !emptyState) return;

    tbody.innerHTML = '';

    const filtered = this.getFilteredOrders();

    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      if (tbody.parentElement) tbody.parentElement.style.display = 'none';
      if (this.orders.length > 0) {
        emptyState.querySelector('p').textContent = 'No hay pedidos que coincidan con tu búsqueda.';
      } else {
        emptyState.querySelector('p').textContent = 'No hay pedidos registrados aún.';
      }
    } else {
      emptyState.style.display = 'none';
      if (tbody.parentElement) tbody.parentElement.style.display = 'table';

      filtered.forEach(order => {
        const tr = document.createElement('tr');

        let badgeClass = 'status-pendiente';
        if (order.status === 'En Proceso') badgeClass = 'status-en-proceso';
        else if (order.status === 'Completado') badgeClass = 'status-completado';
        else if (order.status === 'Cancelado') badgeClass = 'status-cancelado';

        tr.innerHTML = `
          <td>#${order.id}</td>
          <td>${order.customer}</td>
          <td>${order.productTitle}</td>
          <td>${order.quantity}</td>
          <td>$${order.total.toFixed(2)}</td>
          <td><span class="status-badge ${badgeClass}">${order.status}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn-icon" onclick="crud.editOrder(${order.id})" title="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn-icon delete" onclick="crud.deleteOrder(${order.id})" title="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (typeof app !== 'undefined') {
      app.updateMetrics(this.orders);
    }
  },

  openModal(orderId = null) {
    this.clearForm();
    const modal = document.getElementById('order-modal');
    const title = document.getElementById('modal-title');

    if (orderId) {
      title.textContent = 'Editar Pedido';
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        document.getElementById('order-id').value = order.id;
        document.getElementById('customer-name').value = order.customer;
        document.getElementById('product-select').value = order.productId;
        document.getElementById('quantity').value = order.quantity;
        document.getElementById('order-status').value = order.status;
        this.updatePriceHint();
      }
    } else {
      title.textContent = 'Crear Pedido';
      document.getElementById('order-id').value = '';
    }

    modal.classList.add('show');
  },

  closeModal() {
    document.getElementById('order-modal').classList.remove('show');
  },

  clearForm() {
    document.getElementById('order-form').reset();
    document.getElementById('price-hint').textContent = '$0.00';
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  },

  updatePriceHint() {
    const select = document.getElementById('product-select');
    const quantity = document.getElementById('quantity').value;
    const option = select.options[select.selectedIndex];

    if (option && option.value && quantity > 0) {
      const price = parseFloat(option.getAttribute('data-price'));
      const total = price * quantity;
      document.getElementById('price-hint').textContent = `$${total.toFixed(2)}`;
    } else {
      document.getElementById('price-hint').textContent = '$0.00';
    }
  },

  editOrder(id) {
    this.openModal(id);
  },

  saveOrder(event) {
    event.preventDefault();

    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    try {
      const idField = document.getElementById('order-id').value;
      const customer = document.getElementById('customer-name').value.trim();
      const select = document.getElementById('product-select');
      const quantity = parseInt(document.getElementById('quantity').value);
      const status = document.getElementById('order-status').value;

      if (!customer) {
        document.getElementById('err-customer-name').textContent = "El nombre es requerido.";
        throw new Error("Validation Error: Nombre vacío");
      }
      if (!select.value) {
        document.getElementById('err-product-select').textContent = "Debe seleccionar un producto.";
        throw new Error("Validation Error: Producto no seleccionado");
      }
      if (isNaN(quantity) || quantity < 1) {
        document.getElementById('err-quantity').textContent = "La cantidad debe ser mayor a 0.";
        throw new Error("Validation Error: Cantidad inválida");
      }

      const option = select.options[select.selectedIndex];
      const price = parseFloat(option.getAttribute('data-price'));
      const productTitle = option.getAttribute('data-title');
      const total = price * quantity;

      if (idField) {
        const index = this.orders.findIndex(o => o.id === parseInt(idField));
        if (index > -1) {
          this.orders[index] = {
            id: parseInt(idField),
            customer,
            productId: select.value,
            productTitle,
            price,
            quantity,
            total,
            status
          };
          app.showToast("Pedido actualizado con éxito", "success");
        }
      } else {
        const newOrder = {
          id: Date.now(),
          customer,
          productId: select.value,
          productTitle,
          price,
          quantity,
          total,
          status
        };
        this.orders.unshift(newOrder);
        app.showToast("Pedido creado con éxito", "success");
      }

      this.saveToStorage();
      this.render();
      this.closeModal();

    } catch (error) {
      console.warn("Error guardando pedido:", error.message);
      if (!error.message.includes("Validation Error")) {
        app.showToast("Error inesperado al guardar.", "error");
      }
    }
  },

  deleteOrder(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
      try {
        this.orders = this.orders.filter(o => o.id !== id);
        this.saveToStorage();
        this.render();
        app.showToast("Pedido eliminado", "info");
      } catch (error) {
        console.error("Error al eliminar", error);
        app.showToast("Error al eliminar pedido", "error");
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  crud.init();
});
