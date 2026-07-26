// Local mock data for GST Reports (frontend-only, no APIs)
export const gstCompany = {
  name: "STAR ENTERPRISES NANDED",
  gstin: "27CZRPM3752R1Z9",
  stateCode: "27",
  state: "Maharashtra",
  arn: "0002021879",
};

export interface GstrB2BRow {
  gstin: string;
  recipientCode: string;
  recipientName: string;
  recipientType: "Regular" | "Composition" | "SEZ" | "UIN";
  kindOfTransaction: "B2B" | "B2C" | "SEZWP" | "SEZWOP";
  invoiceNumber: string;
  invoiceDate: string; // dd/mm/yyyy
  invoiceValue: number;
  placeOfSupply: string;
  reverseCharge: "Y" | "N";
  invoiceType: "Regular" | "Debit Note" | "Credit Note";
  goodsServices: "Goods" | "Services";
  ecomGstin: string;
  rate: number;
  taxableValue: number;
  cessAmount: number;
  igstRate: number;
  igstAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
}

const mk = (
  i: number,
  name: string,
  gstin: string,
  pos: string,
  taxable: number,
  rate: number,
  interState = false,
): GstrB2BRow => {
  const igst = interState ? +(taxable * rate / 100).toFixed(2) : 0;
  const cgst = interState ? 0 : +(taxable * rate / 200).toFixed(2);
  const sgst = interState ? 0 : +(taxable * rate / 200).toFixed(2);
  const total = +(taxable + igst + cgst + sgst).toFixed(2);
  const d = String((i % 28) + 1).padStart(2, "0");
  return {
    gstin,
    recipientCode: `C${String(1000 + i).padStart(4, "0")}`,
    recipientName: name,
    recipientType: "Regular",
    kindOfTransaction: "B2B",
    invoiceNumber: `SE:2026_${String(i).padStart(7, "0")}`,
    invoiceDate: `${d}/06/2026`,
    invoiceValue: total,
    placeOfSupply: pos,
    reverseCharge: "N",
    invoiceType: "Regular",
    goodsServices: "Goods",
    ecomGstin: "",
    rate,
    taxableValue: taxable,
    cessAmount: 0,
    igstRate: interState ? rate : 0,
    igstAmount: igst,
    cgstRate: interState ? 0 : rate / 2,
    cgstAmount: cgst,
    sgstRate: interState ? 0 : rate / 2,
    sgstAmount: sgst,
  };
};

export const gstrB2BRows: GstrB2BRow[] = [
  mk(1, "SHREE TRADERS", "27ABCDE1234F1Z5", "27-Maharashtra", 125000, 18),
  mk(2, "OM DISTRIBUTORS", "27PQRST5678G1Z2", "27-Maharashtra", 84500, 12),
  mk(3, "AKASH AGENCIES", "27LMNOP9012H1Z7", "27-Maharashtra", 42300, 5),
  mk(4, "BHARAT SALES", "29QWERT3456J1Z1", "29-Karnataka", 156000, 18, true),
  mk(5, "NEW INDIA STORES", "27ZXCVB7890K1Z4", "27-Maharashtra", 67800, 18),
  mk(6, "SHIVAM ENTERPRISES", "24ASDFG1234L1Z8", "24-Gujarat", 98750, 18, true),
  mk(7, "GANESH TRADING CO", "27HJKLM5678N1Z3", "27-Maharashtra", 33450, 12),
  mk(8, "MAHALAXMI AGENCIES", "27VBNMQ9012P1Z6", "27-Maharashtra", 210000, 18),
  mk(9, "SAI SALES CORP", "33WERTY3456R1Z0", "33-Tamil Nadu", 78200, 18, true),
  mk(10, "JAY AMBE TRADERS", "27ERTYU7890S1Z9", "27-Maharashtra", 45600, 5),
  mk(11, "KRISHNA DISTRIBUTORS", "27IOPAS1234T1Z2", "27-Maharashtra", 118900, 18),
  mk(12, "AASHIRWAD STORES", "27DFGHJ5678U1Z5", "27-Maharashtra", 56400, 12),
  mk(13, "TIRUPATI AGENCIES", "27KLZXC9012V1Z8", "27-Maharashtra", 89300, 18),
  mk(14, "RADHIKA TRADING", "29VBNMA3456W1Z1", "29-Karnataka", 145000, 18, true),
  mk(15, "SHREE RAM SALES", "27QWERT7890X1Z4", "27-Maharashtra", 72150, 18),
];

export const gstr3B = {
  period: "01/06/2026 - 30/06/2026",
  outward: [
    { sl: 1, nature: "(a) Outward Taxable Supplies (other than zero rated, nil rated and exempted)", taxable: 5700791.80, integrated: 0, central: 142519.80, state: 142519.80, cess: 0 },
    { sl: 2, nature: "(b) Outward Taxable Supplies (Zero Rated)", taxable: 0, integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 3, nature: "(c) Other Outward Supplies (Nil Rated, Exempted)", taxable: 488564.75, integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 4, nature: "(d) Inward supplies (liable to reverse charge)", taxable: 0, integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 5, nature: "(e) Non-GST Outward Supplies", taxable: 0, integrated: 0, central: 0, state: 0, cess: 0 },
  ],
  interstate: [
    { sl: 1, nature: "Supplies made to UnRegistered person", pos: "", taxable: 0, igst: 0 },
    { sl: 2, nature: "Supplies made to composition taxable person", pos: "", taxable: 0, igst: 0 },
    { sl: 3, nature: "Supplies made to UIN holders", pos: "", taxable: 0, igst: 0 },
  ],
  itc: [
    { sl: 1, label: "(A) ITC Available (Whether in full or part)", integrated: 0, central: 0, state: 0, cess: 0, group: true },
    { sl: 2, label: "(1) Import of goods", integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 3, label: "(2) Import of Services", integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 4, label: "(3) Inward supplies liable to reverse charge (Other than 1 & 2 above)", integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 5, label: "(4) Inward supplies from ISD", integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 6, label: "(5) All other ITC", integrated: 0, central: 130594.92, state: 130594.92, cess: 0 },
    { sl: 7, label: "(B) ITC Reversed", integrated: 0, central: 0, state: 0, cess: 0, group: true },
    { sl: 8, label: "(1) As per rules 42 & 43 of CGST rules", integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 9, label: "(2) Others", integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 10, label: "(C) Net ITC Available (A)-(B)", integrated: 0, central: 130594.92, state: 130594.92, cess: 0, group: true },
    { sl: 11, label: "(D) Ineligible ITC", integrated: 0, central: 0, state: 0, cess: 0, group: true },
    { sl: 12, label: "(1) As per Section 17(5)", integrated: 0, central: 0, state: 0, cess: 0 },
    { sl: 13, label: "(2) Others", integrated: 0, central: 0, state: 0, cess: 0 },
  ],
  exempt: [
    { sl: 1, nature: "From a Supplier under composition scheme, Exempted and Nil rated", inter: 0, intra: 489054.88 },
    { sl: 2, nature: "Non GST Supply", inter: 0, intra: 0 },
  ],
  payment: [
    { sl: 1, desc: "Integrated Tax", payable: 0, itcInt: 0, itcCen: 0, itcState: 0, itcCess: 0, taxPaid: 0, interest: 0, lateFee: 0 },
    { sl: 2, desc: "Central Tax", payable: 142519.80, itcInt: 0, itcCen: 130594.92, itcState: 0, itcCess: 0, taxPaid: 11924.88, interest: 0, lateFee: 0 },
    { sl: 3, desc: "State/UT Tax", payable: 142519.80, itcInt: 0, itcCen: 0, itcState: 130594.92, itcCess: 0, taxPaid: 11924.88, interest: 0, lateFee: 0 },
    { sl: 4, desc: "Cess", payable: 0, itcInt: 0, itcCen: 0, itcState: 0, itcCess: 0, taxPaid: 0, interest: 0, lateFee: 0 },
  ],
};

export interface GstB2BExportRow {
  yourGstin: string;
  returnPeriod: string;
  customerGstin: string;
  ecomGstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  placeOfSupply: string;
  invoiceType: string;
  lineNumber: number;
  rate: number;
  taxableValue: number;
  igstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  cessAmount: number;
  reverseCharge: "Y" | "N";
  taxpayerAction: "Add" | "Modify" | "Delete";
  invoiceChecksum: string;
}

export const gstB2BExportRows: GstB2BExportRow[] = gstrB2BRows.flatMap((r, idx) => {
  const lines = 1 + (idx % 3);
  const rows: GstB2BExportRow[] = [];
  for (let i = 1; i <= lines; i++) {
    const share = 1 / lines;
    rows.push({
      yourGstin: gstCompany.gstin,
      returnPeriod: "062026",
      customerGstin: r.gstin,
      ecomGstin: "",
      invoiceNumber: r.invoiceNumber,
      invoiceDate: r.invoiceDate,
      invoiceValue: r.invoiceValue,
      placeOfSupply: r.placeOfSupply,
      invoiceType: r.invoiceType,
      lineNumber: i,
      rate: r.rate,
      taxableValue: +(r.taxableValue * share).toFixed(2),
      igstAmount: +(r.igstAmount * share).toFixed(2),
      cgstAmount: +(r.cgstAmount * share).toFixed(2),
      sgstAmount: +(r.sgstAmount * share).toFixed(2),
      cessAmount: 0,
      reverseCharge: r.reverseCharge,
      taxpayerAction: "Add",
      invoiceChecksum: btoa(r.invoiceNumber + "-" + i).slice(0, 16).toUpperCase(),
    });
  }
  return rows;
});
