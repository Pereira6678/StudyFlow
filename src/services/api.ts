export async function fetchPlaceholder() {
  // Estrutura para futuras chamadas de API
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    throw error;
  }
}
