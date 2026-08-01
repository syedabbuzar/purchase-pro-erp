import type { Company, Customer, Invoice, InvoiceItem } from "@/lib/types";
import { inr, inrWords } from "@/lib/num";
import { format } from "date-fns";

interface Props {
  invoice: Invoice;
  items: InvoiceItem[];
  customer: Customer;
  company: Company;
}

const ROWS_PER_PAGE = 10;

export function InvoiceSheet({ invoice, items, customer, company }: Props) {
  const pages: InvoiceItem[][] = [];
  for (let i = 0; i < items.length; i += ROWS_PER_PAGE) {
    pages.push(items.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);
  const interState = !!customer.stateCode && customer.stateCode !== company.stateCode;

  const totalBoxes = items.reduce((s, i) => s + (i.boxes || 0), 0);
  const totalPieces = items.reduce((s, i) => s + (i.pieces || 0), 0);

  return (
    <div className="print-invoice">
      {pages.map((pageItems, pi) => (
        <div key={pi} className="invoice-page invoice-sheet p-2" style={{ pageBreakAfter: pi < pages.length - 1 ? "always" : "auto" }}>
          <Header company={company} customer={customer} invoice={invoice} page={pi + 1} totalPages={pages.length} />
          <table className="mt-1">
            <thead>
              <tr>
                <th className="w-6">Sr</th>
                <th className="w-14">HSN</th>
                <th className="text-left">Description</th>
                <th className="w-14">Batch</th>
                <th className="w-14">Rate</th>
                <th className="w-10">Box</th>
                <th className="w-10">Pcs</th>
                <th className="w-10">GST%</th>
                <th className="w-14">GST</th>
                <th className="w-16">Net Amt</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((it) => (
                <tr key={it._id || `${pi}-${it.name}`}>
                  <td className="text-center">{pi * ROWS_PER_PAGE + pageItems.indexOf(it) + 1}</td>
                  <td className="text-center">{it.hsn}</td>
                  <td>{it.name}</td>
                  <td className="text-center">{it.batch || ""}</td>
                  <td className="text-right">{inr(it.rate)}</td>
                  <td className="text-center">{it.boxes || ""}</td>
                  <td className="text-center">{it.pieces || ""}</td>
                  <td className="text-center">{it.gstPct}</td>
                  <td className="text-right">{inr(it.gstAmount)}</td>
                  <td className="text-right">{inr(it.amount)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, ROWS_PER_PAGE - pageItems.length) }).map((_, i) => (
                <tr key={"e" + i}>
                  <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {pi === pages.length - 1 && (
            <Footer
              invoice={invoice} company={company} interState={interState}
              totalBoxes={totalBoxes} totalPieces={totalPieces}
              itemCount={items.length}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Header({ company, customer, invoice, page, totalPages }: { company: Company; customer: Customer; invoice: Invoice; page: number; totalPages: number }) {
  return (
    <table className="no-border">
      <tbody>
        <tr>
          <td className="no-border w-[38%] align-top" style={{ border: "1px solid #000", padding: 4 }}>
            <div className="text-[9px]">Retailer Code: {customer._id ? String(customer._id).slice(-12) : ""}</div>
            <div className="font-bold text-[13px]">{customer.name}</div>
            {customer.shopName && <div className="text-[10px]">{customer.shopName}</div>}
            {customer.address && <div className="text-[10px]">{customer.address}</div>}
            {customer.city && <div className="text-[10px]">{customer.city} {customer.pincode}</div>}
            <div className="text-[10px]">Place of Supply: {customer.state || "-"} ({customer.stateCode || "-"})</div>
            {customer.mobile && <div className="text-[10px]">PH: {customer.mobile}</div>}
            {customer.gstin && <div className="text-[10px]">GSTIN/PAN: {customer.gstin} / {customer.pan || ""}</div>}
            <div className="text-[10px]">FSSAI:</div>
          </td>
          <td className="no-border w-[38%] align-top text-center" style={{ border: "1px solid #000", padding: 4 }}>
            <div className="text-[10px] font-semibold">TAX INVOICE</div>
            <div className="font-bold text-[14px] italic">{company.name}</div>
            <div className="text-[10px]">{company.address}</div>
            <div className="text-[10px]">State & Code: {company.state} ({company.stateCode})</div>
            <div className="text-[10px] font-bold">PH: {company.phone}</div>
            <div className="text-[10px]">GSTIN/PAN: {company.gstin} / {company.pan}</div>
            <div className="text-[10px]">FSSAI: {company.fssai}</div>
          </td>
          <td className="no-border w-[24%] align-top" style={{ border: "1px solid #000", padding: 4 }}>
            <div className="text-[10px] text-right">Duplicate Invoice Copy &nbsp; Page {page} of {totalPages}</div>
            <div className="text-[10px] mt-1"><b>Bill No:</b> {invoice.number}</div>
            <div className="text-[10px]"><b>Bill Date:</b> {invoice.date ? format(new Date(invoice.date), "dd/MM/yyyy") : "—"}</div>
            <div className="mt-1 inline-block bg-black text-white text-[10px] px-1 font-bold">NO EXCHANGE NO RETURN</div>
            <div className="text-[10px] mt-1 font-semibold">CHEQUE BOUNCE FEES 530/- RS EXTRA</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Footer({ invoice, company, interState, totalBoxes, totalPieces, itemCount }: {
  invoice: Invoice; company: Company; interState: boolean;
  totalBoxes: number; totalPieces: number; itemCount: number;
}) {
  return (
    <>
      <table className="mt-0">
        <tbody>
          <tr>
            <td className="w-6 text-center font-bold">Total:-</td>
            <td className="w-14"></td>
            <td></td>
            <td className="w-14"></td>
            <td className="w-14"></td>
            <td className="w-10 text-center font-bold">{totalBoxes}</td>
            <td className="w-10 text-center font-bold">{totalPieces}</td>
            <td className="w-10"></td>
            <td className="w-14 text-right font-bold">{inr(invoice.cgst + invoice.sgst + invoice.igst)}</td>
            <td className="w-16 text-right font-bold">{inr(invoice.taxable + invoice.cgst + invoice.sgst + invoice.igst)}</td>
          </tr>
        </tbody>
      </table>

      <table className="mt-1">
        <tbody>
          <tr>
            <td className="w-[55%] align-top" style={{ padding: 4 }}>
              <div className="font-bold text-[10px]">Tax Summary</div>
              {interState ? (
                <table className="mt-1">
                  <thead><tr><th>IGST%</th><th>Taxable</th><th>IGST Amt</th></tr></thead>
                  <tbody><tr><td className="text-center">{invoice.taxable > 0 ? "Mixed" : "-"}</td><td className="text-right">{inr(invoice.taxable)}</td><td className="text-right">{inr(invoice.igst)}</td></tr></tbody>
                </table>
              ) : (
                <table className="mt-1">
                  <thead><tr><th>Tax Desc</th><th>Tax Amt</th><th>Taxable Amt</th><th>Tax Desc</th><th>Tax Amt</th><th>Taxable Amt</th></tr></thead>
                  <tbody>
                    <tr>
                      <td>CGST</td><td className="text-right">{inr(invoice.cgst)}</td><td className="text-right">{inr(invoice.taxable)}</td>
                      <td>SGST</td><td className="text-right">{inr(invoice.sgst)}</td><td className="text-right">{inr(invoice.taxable)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
              <div className="text-[10px] mt-2"><b>Company's Bank Detail</b></div>
              <div className="text-[10px]">Bank: {company.bankName}</div>
              <div className="text-[10px]">IFSC Code: {company.ifsc}</div>
              <div className="text-[10px]">A/C No: {company.accountNo}</div>
            </td>
            <td className="w-[45%] align-top" style={{ padding: 4 }}>
              <table className="no-border">
                <tbody>
                  <tr><td className="no-border py-0.5">CD Disc Amt:</td><td className="no-border text-right"></td></tr>
                  <tr><td className="no-border py-0.5">Taxable Amt:</td><td className="no-border text-right font-semibold">{inr(invoice.taxable)}</td></tr>
                  <tr><td className="no-border py-0.5">Total GST:</td><td className="no-border text-right">{inr(invoice.cgst + invoice.sgst + invoice.igst)}</td></tr>
                  <tr><td className="no-border py-1 font-bold text-[12px]">Receivable Amt:</td><td className="no-border py-1 text-right font-bold text-[12px]">{inr(invoice.total)}</td></tr>
                </tbody>
              </table>
              <div className="text-[10px] text-right italic mt-1">{inrWords(invoice.total)}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="no-border mt-1">
        <tbody>
          <tr>
            <td className="no-border w-[60%] align-top text-[9px]">
              <div className="mt-1">{company.terms}</div>
            </td>
            <td className="no-border w-[40%] text-right align-bottom text-[10px]">
              <div className="mb-6">For- <b>{company.name}</b></div>
              <div className="text-[9px]">Authorized Signatory</div>
              <div className="text-[9px] text-right">E & O E &nbsp; Items: {itemCount}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
