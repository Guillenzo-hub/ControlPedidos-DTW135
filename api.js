const api = {
  products: [],

  async init() {
    this.getGeolocation();
    await this.fetchProducts();
  },

  getGeolocation() {
    const geoText = document.getElementById('geo-location');

    const fallbackIPGeo = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error("IP API falló");
        const data = await res.json();
        geoText.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${data.city || 'Desconocido'}, ${data.country_name || 'Desconocido'}`;
      } catch (err) {
        console.warn("Fallback IP falló:", err.message);
        geoText.textContent = "Ubicación no disponible";
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          geoText.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
        },
        (error) => {
          console.warn("Error de geolocalización:", error.message, "- Intentando fallback por IP...");
          fallbackIPGeo();
        }
      );
    } else {
      fallbackIPGeo();
    }
  },

  async fetchProducts() {
    try {
      const response = await fetch('https://fakestoreapi.com/products?limit=18');
      if (!response.ok) throw new Error('Error en la red al obtener productos');

      const data = await response.json();
      this.products = data;

      this.renderProductsPreview();
      this.populateProductSelect();
    } catch (error) {
      console.error('Error fetching API:', error);
      document.getElementById('api-products-preview').innerHTML = '<p class="error-msg">No se pudieron cargar los productos.</p>';
    }
  },

  renderProductsPreview() {
    const container = document.getElementById('api-products-preview');
    if (!container) return;

    container.innerHTML = '';
    this.products.forEach(product => {
      const div = document.createElement('div');
      div.className = 'product-item';
      div.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <p title="${product.title}">${product.title}</p>
        <strong>$${product.price}</strong>
      `;
      container.appendChild(div);
    });
  },

  populateProductSelect() {
    const select = document.getElementById('product-select');
    if (!select) return;

    const defaultOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(defaultOption);

    this.products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.setAttribute('data-price', product.price);
      option.setAttribute('data-title', product.title);
      option.textContent = `${product.title} - $${product.price}`;
      select.appendChild(option);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  api.init();
});
