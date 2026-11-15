export function getNumCoursesCheckout(): string | undefined {
  return document.querySelector('[class="price-item__count--primary"]')?.textContent
}

export function getOrderTotal(): string | undefined {
  return document.querySelector('[class="price-item__price"]')?.textContent
}
