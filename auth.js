/**
 * Módulo de Autenticación Local (Frontend-Only)
 * Utiliza localStorage para la base de datos de usuarios y sessionStorage para la sesión activa.
 */

const auth = {
  // Inicializa el sistema de usuarios y crea el usuario por defecto si es necesario
  init() {
    let users = localStorage.getItem('users');
    if (!users) {
      const defaultUsers = [
        { username: 'admin', password: 'admin123' }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  },

  // Verifica si hay una sesión activa
  checkSession() {
    return !!sessionStorage.getItem('currentUser');
  },

  // Obtiene el nombre del usuario conectado
  getCurrentUser() {
    return sessionStorage.getItem('currentUser');
  },

  // Registra un nuevo usuario con validaciones
  register(username, password) {
    const trimmedUsername = username.trim();
    
    // Validaciones de longitud
    if (trimmedUsername.length < 3) {
      return { success: false, message: 'El nombre de usuario debe tener al menos 3 caracteres.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Validar si el usuario ya existe (insensible a mayúsculas/minúsculas)
    const userExists = users.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (userExists) {
      return { success: false, message: 'El nombre de usuario ya está registrado.' };
    }

    // Agregar usuario y guardar
    users.push({ username: trimmedUsername, password: password });
    localStorage.setItem('users', JSON.stringify(users));

    return { success: true, message: 'Usuario registrado con éxito.' };
  },

  // Valida credenciales e inicia sesión
  login(username, password) {
    const trimmedUsername = username.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const user = users.find(u => u.username.toLowerCase() === trimmedUsername && u.password === password);
    if (!user) {
      return { success: false, message: 'Usuario o contraseña incorrectos.' };
    }

    // Guardar sesión activa (preservando capitalización original del registro)
    sessionStorage.setItem('currentUser', user.username);
    return { success: true };
  },

  // Cierra la sesión activa
  logout() {
    sessionStorage.removeItem('currentUser');
    // También limpiamos el tab activo para iniciar limpio la próxima vez
    sessionStorage.removeItem('activeTab');
    window.location.reload();
  },

  // Alterna entre el formulario de Login y Registro
  toggleMode(event) {
    if (event) event.preventDefault();
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTitle = document.getElementById('auth-title');
    const toggleText = document.getElementById('toggle-text');

    if (loginForm.style.display === 'none') {
      // Cambiar a modo Login
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      authTitle.textContent = 'Iniciar Sesión';
      toggleText.innerHTML = '¿No tienes una cuenta? <a href="#" onclick="auth.toggleMode(event)">Regístrate</a>';
      this.clearErrors();
    } else {
      // Cambiar a modo Registro
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      authTitle.textContent = 'Registro de Usuario';
      toggleText.innerHTML = '¿Ya tienes una cuenta? <a href="#" onclick="auth.toggleMode(event)">Inicia Sesión</a>';
      this.clearErrors();
    }
  },

  // Inicializa los formularios de la interfaz
  initUI() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm && registerForm) {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      loginForm.reset();
      registerForm.reset();
      this.clearErrors();
    }
  },

  // Limpia los mensajes de error
  clearErrors() {
    const loginErr = document.getElementById('login-error');
    const registerErr = document.getElementById('register-error');
    if (loginErr) loginErr.textContent = '';
    if (registerErr) registerErr.textContent = '';
  },

  // Manejador del submit de Login
  handleLogin() {
    const userVal = document.getElementById('login-username').value;
    const passVal = document.getElementById('login-password').value;
    const errDiv = document.getElementById('login-error');

    errDiv.textContent = '';

    const result = this.login(userVal, passVal);
    if (result.success) {
      // Recargar la página para re-inicializar el estado completo de la app bajo sesión activa
      window.location.reload();
    } else {
      errDiv.textContent = result.message;
    }
  },

  // Manejador del submit de Registro
  handleRegister() {
    const userVal = document.getElementById('register-username').value;
    const passVal = document.getElementById('register-password').value;
    const errDiv = document.getElementById('register-error');

    errDiv.textContent = '';

    const result = this.register(userVal, passVal);
    if (result.success) {
      if (typeof app !== 'undefined' && app.showToast) {
        app.showToast(result.message, 'success');
      } else {
        alert(result.message);
      }
      // Cambiar a login después de registrar exitosamente
      this.toggleMode();
      // Auto-rellenar el campo de usuario
      const loginUserField = document.getElementById('login-username');
      if (loginUserField) {
        loginUserField.value = userVal;
      }
    } else {
      errDiv.textContent = result.message;
    }
  },

  // Actualiza la información del usuario en el Sidebar
  updateSidebarUser() {
    const userDisplay = document.getElementById('user-display-name');
    if (userDisplay) {
      userDisplay.textContent = this.getCurrentUser() || '';
    }
  }
};

// Auto-inicializar base de datos de usuarios al cargar el archivo
auth.init();
