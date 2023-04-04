interface Product {
  id: number;
  make: string;
  model: string;
  color: string;
  features: string[];
  warranty: string;
  price: number;
  description?: string;
}
export default Product;
