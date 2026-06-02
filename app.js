const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');
const searchProductForm = document.querySelector('#search-product-form');
const searchResultDiv = document.querySelector('#search-result');

const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductDescription = document.querySelector('#update-description');
const updateProductPrice = document.querySelector('#update-price');

// 1. FUNÇÃO PARA BUSCAR E EXIBIR TODOS OS PRODUTOS
async function fetchProducts() {
  const response = await fetch('http://localhost:3000/products');
  const products = await response.json();

  productList.innerHTML = '';

  products.forEach(product => {
    const li = document.createElement('li');
    
    // Organiza as informações do produto em uma div interna
    li.innerHTML = `
      <div class="product-info">
        <strong>${product.name}</strong> <span class="id-tag">ID: ${product.id}</span><br>
        <small style="color: #666;">${product.description || 'Sem descrição'}</small> — 
        <span style="color: #2e7d32; font-weight: 600;">$${product.price}</span>
      </div>
    `;

    // Botão de Deletar
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.addEventListener('click', async () => {
      await deleteProduct(product.id);
      await fetchProducts();
    });
    li.appendChild(deleteButton);

    // Botão de Update
    const updateButton = document.createElement('button');
    updateButton.innerHTML = 'Update';
    updateButton.addEventListener('click', () => {
      updateProductId.value = product.id;
      updateProductName.value = product.name;
      updateProductDescription.value = product.description || '';
      updateProductPrice.value = product.price;
    });
    li.appendChild(updateButton);

    productList.appendChild(li);
  });
}

// 2. EVENT LISTENER PARA O FORMULÁRIO DE CONSULTA (SEARCH BY ID)
searchProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const idInput = searchProductForm.elements['searchId'].value.trim();
  
  searchResultDiv.innerHTML = '<p style="color: #666;">Searching...</p>';
  
  let product = await fetchProductById(idInput);
  
  if (!product || !product.id) {
    try {
      const fallbackResponse = await fetch(`http://localhost:3000/products?id=${idInput}`);
      const fallbackData = await fallbackResponse.json();
      if (Array.isArray(fallbackData) && fallbackData.length > 0) {
        product = fallbackData[0];
      }
    } catch (err) {
      console.error("Erro no fallback de busca:", err);
    }
  }
  
  searchResultDiv.innerHTML = '';
  
  if (product && product.id) {
    searchResultDiv.innerHTML = `
      <div class="search-card">
        <p style="margin: 0 0 5px 0;"><strong>Product Found!</strong></p>
        <small><strong>ID:</strong> ${product.id}</small><br>
        <small><strong>Name:</strong> ${product.name}</small><br>
        <small><strong>Description:</strong> ${product.description || 'Sem descrição'}</small><br>
        <small><strong>Price:</strong> $${product.price}</small>
      </div>
    `;
  } else {
    searchResultDiv.innerHTML = `<p class="error-msg">ID "${idInput}" not found.</p>`;
  }
  
  searchProductForm.reset();
});

// 3. EVENT LISTENER PARA O FORMULÁRIO DE CADASTRO (ADD)
addProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = addProductForm.elements['name'].value;
  const description = addProductForm.elements['description'].value;
  const price = addProductForm.elements['price'].value;
  
  await addProduct(name, description, price);
  addProductForm.reset();
  await fetchProducts();
});

// 4. EVENT LISTENER PARA O FORMULÁRIO DE EDIÇÃO (UPDATE)
updateProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = updateProductId.value;
  const name = updateProductName.value;
  const description = updateProductDescription.value;
  const price = updateProductPrice.value;

  await updateProduct(id, name, description, price);
  updateProductForm.reset();
  await fetchProducts();
});

// 5. REQUISIÇÃO HTTP: BUSCAR POR ID (GET)
async function fetchProductById(id) {
  try {
    const response = await fetch(`http://localhost:3000/products/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar ID:", error);
    return null;
  }
}

// 6. REQUISIÇÃO HTTP: ADICIONAR PRODUTO (POST)
async function addProduct(name, description, price) {
  const response = await fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, price })
  });
  return response.json();
}

// 7. REQUISIÇÃO HTTP: ATUALIZAR PRODUTO (PUT)
async function updateProduct(id, name, description, price) {
  const response = await fetch(`http://localhost:3000/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, price })
  });
  return response.json();
}

// 8. REQUISIÇÃO HTTP: DELETAR PRODUTO (DELETE)
async function deleteProduct(id) {
  const response = await fetch('http://localhost:3000/products/' + id, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

fetchProducts();