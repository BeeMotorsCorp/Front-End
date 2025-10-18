/* BeeMotors - script.js
   - Cadastro/login de empresas (persistência local)
   - Dashboard da empresa: ver estoque próprio, adicionar/editar/excluir anúncios
   - Visualizações incrementam quando usuário clica no cartão
*/

const COMP_KEY = "beemotors_companies";
const CARS_KEY = "beemotors_cars";
const CUR_COMP_KEY = "beemotors_currentCompanyId";

/* ---------- helpers de localStorage ---------- */
function load(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

/* ---------- inicialização com demo (apenas se vazio) ---------- */
function initData() {
  let companies = load(COMP_KEY, null);
  let cars = load(CARS_KEY, null);

  if (!companies) {
    companies = [
      { id: 1, name: "Demo BeeMotors", email: "demo@beemotors.com", password: "demo123", cnpj: "00.000.000/0001-00" }
    ];
    save(COMP_KEY, companies);
  }
  if (!cars) {
    cars = [
      { id: 1, ownerId: 1, nome: "Fiat Uno 2012", preco: "R$ 20.000", tipo: "venda", views: 12, img: "https://via.placeholder.com/400x250?text=Fiat+Uno", descricao: "Econômico e bem conservado." },
      { id: 2, ownerId: 1, nome: "Honda Civic 2020", preco: "R$ 90.000", tipo: "venda", views: 45, img: "https://via.placeholder.com/400x250?text=Honda+Civic", descricao: "Perfeito estado, baixo km." },
      { id: 3, ownerId: 1, nome: "Chevrolet Onix 2018", preco: "R$ 50.000", tipo: "aluguel", views: 8, img: "https://via.placeholder.com/400x250?text=Onix+2018", descricao: "Aluguel diário disponível." }
    ];
    save(CARS_KEY, cars);
  }
}
initData();

/* ---------- estado em memória (lido do localStorage) ---------- */
function getCompanies() { return load(COMP_KEY, []); }
function getCars() { return load(CARS_KEY, []); }
function setCompanies(c) { save(COMP_KEY, c); }
function setCars(c) { save(CARS_KEY, c); }
function getCurrentCompanyId() { return Number(localStorage.getItem(CUR_COMP_KEY)) || null; }
function setCurrentCompanyId(id) { if (id) localStorage.setItem(CUR_COMP_KEY, String(id)); else localStorage.removeItem(CUR_COMP_KEY); }
function getCurrentCompany() {
  const id = getCurrentCompanyId();
  if (!id) return null;
  return getCompanies().find(x => x.id === id) || null;
}

/* ---------- navegação de páginas ---------- */
function showPage(page) {
  document.querySelectorAll(".page").forEach(s => s.classList.remove("active"));
  document.getElementById(page).classList.add("active");
  if (page === "home") renderCars();
  if (page === "aluguel") renderRentCars();
  if (page === "empresa") renderEmpresa();
}

/* ---------- render global (venda) ---------- */
function renderCars(filter = "") {
  const list = document.getElementById("carList");
  const cars = getCars();
  list.innerHTML = "";

  const filtered = cars.filter(c => c.tipo === "venda" && c.nome.toLowerCase().includes(filter.toLowerCase()));
  if (filtered.length === 0) {
    list.innerHTML = `<div class="card"><p>Nenhum veículo encontrado.</p></div>`;
    return;
  }

  filtered.forEach(c => {
    list.innerHTML += `
      <div class="card" onclick="viewCar(${c.id})">
        <img src="${c.img || 'https://via.placeholder.com/400x250?text=Sem+imagem'}" alt="${escapeHtml(c.nome)}" />
        <h3>${escapeHtml(c.nome)}</h3>
        <p>${escapeHtml(c.preco)}</p>
        <p class="muted"><b>Visualizações:</b> ${c.views || 0}</p>
      </div>
    `;
  });
}

/* ---------- render aluguel ---------- */
function renderRentCars() {
  const list = document.getElementById("rentList");
  const cars = getCars().filter(c => c.tipo === "aluguel");
  list.innerHTML = "";

  if (cars.length === 0) {
    list.innerHTML = `<div class="card"><p>Sem veículos para aluguel.</p></div>`;
    return;
  }

  cars.forEach(c => {
    list.innerHTML += `
      <div class="card" onclick="viewCar(${c.id})">
        <img src="${c.img || 'https://via.placeholder.com/400x250?text=Sem+imagem'}" alt="${escapeHtml(c.nome)}" />
        <h3>${escapeHtml(c.nome)}</h3>
        <p>${escapeHtml(c.preco)}</p>
        <p class="muted"><b>Visualizações:</b> ${c.views || 0}</p>
      </div>
    `;
  });
}

/* ---------- ver carro (aumenta view e mostra detalhes simples) ---------- */
function viewCar(id) {
  const cars = getCars();
  const car = cars.find(c => c.id === id);
  if (!car) return;
  car.views = (car.views || 0) + 1;
  setCars(cars);
  // re-render páginas afetadas
  renderCars(document.getElementById("searchInput").value || "");
  renderRentCars();
  renderEmpresa(); // atualiza painel da empresa caso esteja logado

  // mostrar detalhe simples (alert). Você pode trocar por modal se preferir.
  alert(`${car.nome}\n${car.preco}\n\n${car.descricao || ""}\n\nVisualizações: ${car.views}`);
}

/* ---------- busca ---------- */
function searchCars() {
  const q = document.getElementById("searchInput").value.trim();
  renderCars(q);
}

/* ---------- form de autenticação da empresa (registro/login) ---------- */
function toggleAuth(mode) {
  document.getElementById("loginForm").style.display = mode === "login" ? "flex" : "none";
  document.getElementById("registerForm").style.display = mode === "register" ? "flex" : "none";
  document.getElementById("showLoginBtn").classList.toggle("active", mode === "login");
  document.getElementById("showRegisterBtn").classList.toggle("active", mode === "register");
}

document.getElementById("loginForm").onsubmit = function (e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value;
  const companies = getCompanies();
  const comp = companies.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === pass);
  if (!comp) {
    alert("Credenciais inválidas.");
    return;
  }
  setCurrentCompanyId(comp.id);
  renderEmpresa();
};

document.getElementById("registerForm").onsubmit = function (e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPassword").value;
  const pass2 = document.getElementById("regPasswordConfirm").value;
  const cnpj = document.getElementById("regCNPJ").value.trim();

  if (pass !== pass2) { alert("Senhas não coincidem."); return; }
  const companies = getCompanies();
  if (companies.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    alert("Já existe empresa com esse e-mail.");
    return;
  }
  const newId = companies.length ? Math.max(...companies.map(x => x.id)) + 1 : 1;
  const newCompany = { id: newId, name, email, password: pass, cnpj };
  companies.push(newCompany);
  setCompanies(companies);
  setCurrentCompanyId(newId);
  renderEmpresa();
};

/* ---------- logout ---------- */
function logoutCompany() {
  setCurrentCompanyId(null);
  toggleAuth('login');
  document.getElementById("empresaDashboard").style.display = "none";
  document.getElementById("empresaAuth").style.display = "block";
}

/* ---------- render da área da empresa ---------- */
function renderEmpresa() {
  const cur = getCurrentCompany();
  const authBox = document.getElementById("empresaAuth");
  const dash = document.getElementById("empresaDashboard");

  if (!cur) {
    // mostrar auth
    authBox.style.display = "block";
    dash.style.display = "none";
    toggleAuth('login');
    return;
  }

  // exibir dashboard da empresa
  authBox.style.display = "none";
  dash.style.display = "block";
  document.getElementById("companyTitle").innerText = cur.name;
  document.getElementById("companyCNPJ").innerText = cur.cnpj ? `CNPJ: ${cur.cnpj}` : "";

  renderCompanyStats();
  renderEstoque();
}

/* ---------- Estatísticas da empresa ---------- */
function renderCompanyStats() {
  const company = getCurrentCompany();
  if (!company) return;
  const cars = getCars().filter(c => c.ownerId === company.id);
  const totalAds = cars.length;
  const totalViews = cars.reduce((s, c) => s + (c.views || 0), 0);
  const mostViewed = cars.slice().sort((a,b)=> (b.views||0)-(a.views||0))[0];

  const container = document.getElementById("companyStats");
  container.innerHTML = `
    <div><strong>Anúncios</strong><p>${totalAds}</p></div>
    <div><strong>Total de visualizações</strong><p>${totalViews}</p></div>
    <div><strong>Mais visto</strong><p>${mostViewed ? escapeHtml(mostViewed.nome) + " ("+(mostViewed.views||0)+")" : "—"}</p></div>
  `;
}

/* ---------- Estoque da empresa (lista apenas dos anúncios do dono) ---------- */
function renderEstoque() {
  const company = getCurrentCompany();
  const container = document.getElementById("estoqueList");
  container.innerHTML = "";
  if (!company) return;
  const cars = getCars().filter(c => c.ownerId === company.id);
  if (cars.length === 0) {
    container.innerHTML = `<div class="card"><p>Seu estoque está vazio. Adicione um veículo acima.</p></div>`;
    return;
  }

  cars.forEach(c => {
    container.innerHTML += `
      <div class="card">
        <img src="${c.img || 'https://via.placeholder.com/400x250?text=Sem+imagem'}" alt="${escapeHtml(c.nome)}" />
        <h3>${escapeHtml(c.nome)}</h3>
        <p>${escapeHtml(c.preco)}</p>
        <p class="muted"><b>Visualizações:</b> ${c.views || 0}</p>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button onclick="openEdit(${c.id})">Editar</button>
          <button class="secondary" onclick="deleteCar(${c.id})">Remover</button>
        </div>
      </div>
    `;
  });
}

/* ---------- adicionar novo carro (form) ---------- */
document.getElementById("addCarForm").onsubmit = function (e) {
  e.preventDefault();
  const cur = getCurrentCompany();
  if (!cur) { alert("Faça login como empresa."); return; }

  const nome = document.getElementById("newNome").value.trim();
  const preco = document.getElementById("newPreco").value.trim();
  const tipo = document.getElementById("newTipo").value;
  const img = document.getElementById("newImg").value.trim();
  const descricao = document.getElementById("newDescricao").value.trim();

  const cars = getCars();
  const newId = cars.length ? Math.max(...cars.map(c => c.id)) + 1 : 1;
  const novo = { id: newId, ownerId: cur.id, nome, preco, tipo, views: 0, img: img || "", descricao };
  cars.push(novo);
  setCars(cars);

  // limpa form e atualiza
  e.target.reset();
  renderEstoque();
  renderCompanyStats();
  // também atualiza listagens públicas
  renderCars(document.getElementById("searchInput").value || "");
  renderRentCars();
};

/* ---------- editar carro (abrir formulário) ---------- */
let editTargetId = null;
function openEdit(id) {
  const car = getCars().find(c => c.id === id);
  const cur = getCurrentCompany();
  if (!car || !cur || car.ownerId !== cur.id) { alert("Operação não permitida."); return; }
  editTargetId = id;
  document.getElementById("editFormContainer").style.display = "block";
  document.getElementById("editNome").value = car.nome;
  document.getElementById("editPreco").value = car.preco;
  document.getElementById("editTipo").value = car.tipo;
  document.getElementById("editImg").value = car.img || "";
  document.getElementById("editDescricao").value = car.descricao || "";
  // rolar para o formulário
  document.getElementById("editFormContainer").scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("editCarForm").onsubmit = function (e) {
  e.preventDefault();
  if (!editTargetId) return;

  const cars = getCars();
  const car = cars.find(c => c.id === editTargetId);
  if (!car) { alert("Anúncio não encontrado"); return; }

  car.nome = document.getElementById("editNome").value.trim();
  car.preco = document.getElementById("editPreco").value.trim();
  car.tipo = document.getElementById("editTipo").value;
  car.img = document.getElementById("editImg").value.trim();
  car.descricao = document.getElementById("editDescricao").value.trim();

  setCars(cars);
  editTargetId = null;
  document.getElementById("editFormContainer").style.display = "none";
  renderEstoque();
  renderCompanyStats();
  renderCars(document.getElementById("searchInput").value || "");
  renderRentCars();
};

function cancelEdit() {
  editTargetId = null;
  document.getElementById("editFormContainer").style.display = "none";
}

/* ---------- excluir carro ---------- */
function deleteCar(id) {
  const cur = getCurrentCompany();
  const cars = getCars();
  const car = cars.find(c => c.id === id);
  if (!car) return;
  if (!cur || car.ownerId !== cur.id) { alert("Operação não permitida."); return; }

  if (!confirm(`Remover o anúncio "${car.nome}"?`)) return;
  const updated = cars.filter(c => c.id !== id);
  setCars(updated);
  renderEstoque();
  renderCompanyStats();
  renderCars(document.getElementById("searchInput").value || "");
  renderRentCars();
}

/* ---------- utilidades ---------- */
function escapeHtml(s) {
  if (!s && s !== 0) return "";
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- inicial render ---------- */
renderCars();
renderRentCars();

/* ---------- simulador ---------- */
// Event listener para o formulário de simulação
document.getElementById("financeForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Obtém valores dos campos
  const valor = parseFloat(document.getElementById("valorFinanciado").value);
  const entrada = parseFloat(document.getElementById("valorEntrada").value);
  const juros = parseFloat(document.getElementById("juros").value) / 100; // Converte para decimal
  const meses = parseInt(document.getElementById("meses").value);

  // Calcula valores do financiamento
  const valorFinal = valor - entrada;
  const parcela = (valorFinal * juros) / (1 - Math.pow(1 + juros, -meses));
  const totalPago = parcela * meses;

  // Exibe resultados
  document.getElementById("resultado").innerHTML = `
    <h5>Resultado:</h5>
    <p>Valor Financiado: R$ ${valorFinal.toFixed(2)}</p>
    <p>Parcela Mensal: R$ ${parcela.toFixed(2)}</p>
    <p>Total Pago: R$ ${totalPago.toFixed(2)}</p>
  `;

  // Salva no localStorage
  const historico = JSON.parse(localStorage.getItem("historicoFinanciamentos")) || [];

  historico.push({
    data: new Date().toLocaleString(),
    valor,
    entrada,
    juros: juros * 100, // Converte para porcentagem
    meses,
    valorFinal: valorFinal.toFixed(2),
    parcela: parcela.toFixed(2),
    totalPago: totalPago.toFixed(2)
  });

  localStorage.setItem("historicoFinanciamentos", JSON.stringify(historico));

  // Envia para o MySQL se o usuário estiver logado
  const usuario_id = localStorage.getItem("usuario_id");
  if (usuario_id) {
    await fetch("http://localhost/anao/simuladorPHP/salvar_simulacao.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id,
        data: new Date().toISOString(),
        valor,
        entrada,
        juros: juros * 100,
        meses,
        valorFinal: valorFinal.toFixed(2),
        parcela: parcela.toFixed(2),
        totalPago: totalPago.toFixed(2)
      })
    });
  }
});