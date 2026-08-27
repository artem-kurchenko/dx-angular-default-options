export interface Order {
  orderNumber: number;
  customerName: string;
  orderDate: Date;
  totalAmount: number;
  shipped: boolean;
}

const customers = ['Super Mart', 'Electronics Depot', 'K&S Music', 'Screen Shop', 'Tom Club'];

export const orders: Order[] = Array.from({ length: 24 }, (_, i) => ({
  orderNumber: 10000 + i,
  customerName: customers[i % customers.length],
  orderDate: new Date(2026, i % 12, (i % 27) + 1),
  totalAmount: Math.round((1200 + i * 143.75) * 100) / 100,
  shipped: i % 3 !== 0,
}));
