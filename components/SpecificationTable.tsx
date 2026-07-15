import type { ProductSpecification } from "@/data/products";

export function SpecificationTable({ items }: { items: ProductSpecification[] }) {
  return <div className="specification-table" role="table" aria-label="Product technical specifications">
    {items.map((item) => <div className="specification-row" role="row" key={item.label}><span role="rowheader">{item.label}</span><b role="cell">{item.value}</b></div>)}
  </div>;
}
