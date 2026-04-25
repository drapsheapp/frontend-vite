import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateTailorSheet = (order) => {

  const doc = new jsPDF();

  const item = order.items?.[0];

  const customization = item?.customization_snapshot || {};
  const measurements = item?.measurement_snapshot || {};

  doc.setFontSize(18);
  doc.text("DRAPSHE - TAILOR SHEET", 14, 20);

  doc.setFontSize(12);

  doc.text(`Order ID : ${order.order_id}`, 14, 35);
  doc.text(`Customer Phone : ${order.user_phone}`, 14, 42);
  doc.text(`Product : ${item?.name}`, 14, 49);

  // STYLE TABLE

  const styleRows = Object.entries(customization)
    .filter(([k, v]) => typeof v !== "object")
    .map(([k, v]) => [
      k.replace(/_/g, " ").toUpperCase(),
      String(v)
    ]);

  autoTable(doc, {
    startY: 60,
    head: [["STYLE OPTION", "VALUE"]],
    body: styleRows
  });

  // MEASUREMENT TABLE

  const measurementRows = Object.entries(measurements)
    .map(([k, v]) => [
      k.replace(/_/g, " ").toUpperCase(),
      `${v}"`
    ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["MEASUREMENT", "VALUE"]],
    body: measurementRows
  });

  doc.save(`tailor-sheet-${order.order_id}.pdf`);
};