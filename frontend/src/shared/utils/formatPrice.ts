/**
 * Formatea un precio a pesos colombianos (COP) sin decimales
 * @param price - El precio a formatear
 * @returns El precio formateado en COP
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

