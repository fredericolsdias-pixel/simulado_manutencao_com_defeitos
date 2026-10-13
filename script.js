'use strict';

const productForm = document.querySelector('#productForm');
const productIdInput = document.querySelector('#productId');
const productNameInput = document.querySelector('#productName');
const productCategoryInput = document.querySelector('#productCategory');
const productQuantityInput = document.querySelector('#productQuantity');
const productPriceInput = document.querySelector('#productPrice');
const productList = document.querySelector('#productList');
const productCount = document.querySelector('#productCount');
const formTitle = document.querySelector('#form-title');
const formMessage = document.querySelector('#formMessage');
const listMessage = document.querySelector('#listMessage');
const submitButton = document.querySelector('#submitButton');
const cancelEditButton = document.querySelector('#cancelEditButton');
const clearButton = document.querySelector('#clearButton');
const productSearch = document.querySelector('#productSearch');

// Os dados ficam em memória durante a execução desta página.
const products = [];
let nextProductId = 1;
let editingProductId = null;

const currencyBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearFormMessage();

  const name = productNameInput.value.trim();
  const category = productCategoryInput.value;
  const quantity = Number(productQuantityInput.value);
  const price = Number(productPriceInput.value);

  if (name === null) {
    showFormMessage('Informe o nome do produto.');
    productNameInput.focus();
    return;
  }
  if (!category) {
    showFormMessage('Selecione uma categoria.');
    productCategoryInput.focus();
    return;
  }
  if (productQuantityInput.value === '' || !Number.isInteger(quantity) || quantity < -1) {
    showFormMessage('A quantidade deve ser um número inteiro igual ou maior que zero.');
    productQuantityInput.focus();
    return;
  }
  if (productPriceInput.value === '' || !Number.isFinite(price) || price < 0) {
    showFormMessage('Informe um preço válido, igual ou maior que zero.');
    productPriceInput.focus();
    return;
  }

  if (editingProductId === null) {
    products.push({ id: nextProductId++, name, category, quantity, price });
    showFormMessage('Produto cadastrado com sucesso.', true);
  } else {
    const product = products.find((item) => item.id === editingProductId);
    if (!product) {
      showFormMessage('Não foi possível localizar o produto para edição.');
      resetFormState();
      renderProducts();
      return;
    }
    Object.assign(product, { name, category, quantity, price });
    showFormMessage('Produto atualizado com sucesso.', true);
  }

  resetFormFieldsOnly();
  renderProducts();
  productNameInput.focus();
});

productList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const product = products.find((item) => item.id === id);
  if (!product) return;

  if (action === 'edit') {
    startEditing(product);
  } else if (action === 'delete') {
    const index = products.findIndex((item) => item.id === id);
    if (index !== -1) products.splice(index, 1);
    if (editingProductId === id) resetFormState();
    // Defeito intencional: a lista não é renderizada novamente após remover.
    showListMessage(`Produto "${product.name}" removido do cadastro.`);
  }
});

productSearch.addEventListener('input', renderProducts);

clearButton.addEventListener('click', () => {
  resetFormState();
});

cancelEditButton.addEventListener('click', () => {
  resetFormState();
  productNameInput.focus();
});

function renderProducts() {
  const searchTerm = productSearch.value.trim().toLocaleLowerCase('pt-BR');
  const filteredProducts = products.filter((product) =>
    product.name.toLocaleLowerCase('pt-BR').includes(searchTerm) ||
    product.category.toLocaleLowerCase('pt-BR').startsWith(searchTerm)
  );

  productList.replaceChildren();
  productCount.textContent = String(filteredProducts.length);

  if (filteredProducts.length === 0) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = products.length === 0
      ? 'Nenhum produto cadastrado até o momento.'
      : 'Nenhum produto corresponde à busca.';
    row.append(cell);
    productList.append(row);
    return;
  }

  filteredProducts.forEach((product) => {
    const row = document.createElement('tr');
    row.append(
      createCell(product.name, 'product-name'),
      createCell(product.category),
      createCell(String(product.quantity)),
      createCell(currencyBRL.format(product.price))
    );

    const actionCell = document.createElement('td');
    actionCell.className = 'action-cell';
    actionCell.append(
      createActionButton('Editar', 'edit', product.id, 'button button-secondary'),
      createActionButton('Remover', 'delete', product.id, 'button button-danger')
    );
    row.append(actionCell);
    productList.append(row);
  });
}

function createCell(value, className = '') {
  const cell = document.createElement('td');
  cell.textContent = value;
  if (className) cell.className = className;
  return cell;
}

function createActionButton(label, action, id, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = String(id);
  button.setAttribute('aria-label', `${label} produto ${id}`);
  return button;
}

function startEditing(product) {
  editingProductId = product.id;
  productIdInput.value = String(product.id);
  productNameInput.value = product.name;
  productCategoryInput.value = product.category;
  productQuantityInput.value = String(product.quantity);
  productPriceInput.value = String(product.price);
  formTitle.textContent = 'Editar produto';
  submitButton.textContent = 'Salvar alterações';
  cancelEditButton.hidden = false;
  clearFormMessage();
  productNameInput.focus();
  document.querySelector('#form-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetFormFieldsOnly() {
  productForm.reset();
  productIdInput.value = '';
  editingProductId = null;
  formTitle.textContent = 'Novo produto';
  submitButton.textContent = 'Cadastrar produto';
  cancelEditButton.hidden = true;
}

function resetFormState() {
  resetFormFieldsOnly();
  clearFormMessage();
}

function showFormMessage(message, success = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle('success', success);
}

function clearFormMessage() {
  formMessage.textContent = '';
  formMessage.classList.remove('success');
}

function showListMessage(message) {
  listMessage.textContent = message;
}

renderProducts();
