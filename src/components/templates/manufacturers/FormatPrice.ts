import { PriceTable } from "@/interface/manufacturers";

export function FormatPrice(price_table: PriceTable[]) {
  const heights = [...new Set(price_table?.map((item) => item?.height))];
  const widths = [...new Set(price_table?.map((item) => item?.width))];
  const headerRow = ["", ...widths?.map((width) => width?.toString())];
  const result = [headerRow];
  heights?.forEach((height) => {
    const row = [height?.toString()];
    widths?.forEach((width) => {
      const priceItem = price_table?.find(
        (item) => item?.width === width && item?.height === height
      );
      row.push(
        priceItem && priceItem?.price !== null
          ? priceItem?.price?.toString()
          : ""
      );
    });
    result.push(row);
  });
  return result;
}
