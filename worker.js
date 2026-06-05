self.onmessage = function (e) {
  const orders = e.data;

  let metrics = {
    total: orders.length,
    completed: 0,
    pending: 0,
    revenue: 0
  };

  orders.forEach(order => {
    if (order.status === 'Completado') {
      metrics.completed++;
    }
    if (order.status === 'Pendiente') {
      metrics.pending++;
    }

    if (order.status !== 'Cancelado') {
      metrics.revenue += order.total;
    }
  });

  self.postMessage(metrics);
};
